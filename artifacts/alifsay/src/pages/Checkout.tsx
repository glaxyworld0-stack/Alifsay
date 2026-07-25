import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useGetCart, useCreateOrder, OrderInputPaymentMethod } from '@workspace/api-client-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ShieldCheck, ChevronRight, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const checkoutSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number is required for delivery" }),
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  street: z.string().min(5, { message: "Street address is required" }),
  street2: z.string().optional(),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State/Province is required" }),
  postalCode: z.string().min(3, { message: "Postal code is required" }),
  country: z.string().min(2, { message: "Country is required" }),
  paymentMethod: z.nativeEnum(OrderInputPaymentMethod)
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { formatPrice } = useCurrency();
  const { data: cart, isLoading } = useGetCart();
  const createOrder = useCreateOrder();
  
  const [step, setStep] = useState<1|2|3>(1); // 1: Shipping, 2: Payment, 3: Review
  
  const { register, handleSubmit, formState: { errors, isValid }, trigger, getValues, watch } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: 'US',
      paymentMethod: OrderInputPaymentMethod.credit_card
    },
    mode: 'onTouched'
  });

  const watchPaymentMethod = watch('paymentMethod');

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full"></div></div>;
  if (!cart || cart.items.length === 0) {
    setLocation('/cart');
    return null;
  }

  const proceedToPayment = async () => {
    const valid = await trigger(['email', 'phone', 'firstName', 'lastName', 'street', 'city', 'state', 'postalCode', 'country']);
    if (valid) setStep(2);
  };

  const proceedToReview = async () => {
    const valid = await trigger(['paymentMethod']);
    if (valid) setStep(3);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const order = await createOrder.mutateAsync({
        data: {
          customerEmail: data.email,
          customerPhone: data.phone,
          shippingAddress: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            street: data.street,
            street2: data.street2,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country
          },
          paymentMethod: data.paymentMethod,
          couponCode: cart.couponCode || undefined
        }
      });
      setLocation(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  const inputClass = "w-full border border-border bg-transparent px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-colors";
  const labelClass = "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block";

  return (
    <div className="bg-background min-h-screen">
      {/* Checkout Header */}
      <header className="border-b py-6 text-center bg-background sticky top-0 z-10">
        <div className="container mx-auto">
          <h1 className="font-serif text-3xl font-bold tracking-tight">ALIFSAY</h1>
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-4">
            <button onClick={() => setStep(1)} className={step >= 1 ? 'font-medium text-foreground' : 'text-muted-foreground'}>Shipping</button>
            <ChevronRight className="w-3 h-3 text-muted-foreground mx-1" />
            <button onClick={() => step > 1 && setStep(2)} className={step >= 2 ? 'font-medium text-foreground' : 'text-muted-foreground'} disabled={step < 2}>Payment</button>
            <ChevronRight className="w-3 h-3 text-muted-foreground mx-1" />
            <span className={step >= 3 ? 'font-medium text-foreground' : 'text-muted-foreground'}>Review</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start max-w-6xl mx-auto">
          
          {/* Main Checkout Form */}
          <div className="w-full lg:w-3/5 order-2 lg:order-1">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              
              {/* STEP 1: Shipping */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="font-serif text-2xl mb-6">Contact & Shipping Details</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium uppercase tracking-wider border-b pb-2 mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Email Address</label>
                          <input type="email" {...register('email')} className={inputClass} placeholder="For order updates" />
                          {errors.email && <span className="text-destructive text-xs mt-1 block">{errors.email.message}</span>}
                        </div>
                        <div>
                          <label className={labelClass}>Phone Number</label>
                          <input type="tel" {...register('phone')} className={inputClass} placeholder="For delivery carrier" />
                          {errors.phone && <span className="text-destructive text-xs mt-1 block">{errors.phone.message}</span>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium uppercase tracking-wider border-b pb-2 mb-4 mt-8">Shipping Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className={labelClass}>First Name</label>
                          <input type="text" {...register('firstName')} className={inputClass} />
                          {errors.firstName && <span className="text-destructive text-xs mt-1 block">{errors.firstName.message}</span>}
                        </div>
                        <div>
                          <label className={labelClass}>Last Name</label>
                          <input type="text" {...register('lastName')} className={inputClass} />
                          {errors.lastName && <span className="text-destructive text-xs mt-1 block">{errors.lastName.message}</span>}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className={labelClass}>Country/Region</label>
                        <select {...register('country')} className={inputClass}>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                          <option value="AE">United Arab Emirates</option>
                          <option value="PK">Pakistan</option>
                          <option value="FR">France</option>
                          <option value="DE">Germany</option>
                        </select>
                      </div>
                      
                      <div className="mb-4">
                        <label className={labelClass}>Address</label>
                        <input type="text" {...register('street')} className={inputClass} placeholder="Street address or P.O. Box" />
                        {errors.street && <span className="text-destructive text-xs mt-1 block">{errors.street.message}</span>}
                        <input type="text" {...register('street2')} className={`${inputClass} mt-2`} placeholder="Apartment, suite, unit, etc. (optional)" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClass}>City</label>
                          <input type="text" {...register('city')} className={inputClass} />
                          {errors.city && <span className="text-destructive text-xs mt-1 block">{errors.city.message}</span>}
                        </div>
                        <div>
                          <label className={labelClass}>State/Province</label>
                          <input type="text" {...register('state')} className={inputClass} />
                          {errors.state && <span className="text-destructive text-xs mt-1 block">{errors.state.message}</span>}
                        </div>
                        <div>
                          <label className={labelClass}>Postal Code</label>
                          <input type="text" {...register('postalCode')} className={inputClass} />
                          {errors.postalCode && <span className="text-destructive text-xs mt-1 block">{errors.postalCode.message}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button type="button" onClick={proceedToPayment} className="w-full bg-foreground text-background py-4 mt-8 uppercase tracking-widest text-sm font-medium hover:bg-foreground/90 transition-colors">
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* STEP 2: Payment */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="font-serif text-2xl mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5" /> Secure Payment
                  </h2>
                  
                  <div className="border border-border divide-y divide-border bg-background">
                    {Object.entries({
                      [OrderInputPaymentMethod.credit_card]: 'Credit or Debit Card',
                      [OrderInputPaymentMethod.paypal]: 'PayPal',
                      [OrderInputPaymentMethod.cod]: 'Cash on Delivery (Pakistan Only)'
                    }).map(([value, label]) => (
                      <label key={value} className={`flex items-center p-4 cursor-pointer transition-colors ${watchPaymentMethod === value ? 'bg-muted/30' : 'hover:bg-muted/10'}`}>
                        <input type="radio" value={value} {...register('paymentMethod')} className="w-4 h-4 accent-foreground" />
                        <span className="ml-4 font-medium">{label}</span>
                      </label>
                    ))}
                  </div>

                  {watchPaymentMethod === OrderInputPaymentMethod.credit_card && (
                    <div className="mt-6 p-6 border bg-muted/10 space-y-4">
                      <div>
                        <label className={labelClass}>Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000" className={inputClass} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Expiration (MM/YY)</label>
                          <input type="text" placeholder="MM/YY" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Security Code</label>
                          <input type="text" placeholder="CVC" className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Name on Card</label>
                        <input type="text" className={inputClass} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-8">
                    <button type="button" onClick={() => setStep(1)} className="w-1/3 border py-4 uppercase tracking-widest text-sm font-medium hover:bg-muted transition-colors">
                      Back
                    </button>
                    <button type="button" onClick={proceedToReview} className="w-2/3 bg-foreground text-background py-4 uppercase tracking-widest text-sm font-medium hover:bg-foreground/90 transition-colors">
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Review */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="font-serif text-2xl mb-6">Review Your Order</h2>
                  
                  <div className="bg-muted/10 p-6 border mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2 flex justify-between">
                          Shipping Details
                          <button type="button" onClick={() => setStep(1)} className="text-xs underline text-foreground">Edit</button>
                        </h4>
                        <div className="text-sm space-y-1">
                          <p>{getValues('firstName')} {getValues('lastName')}</p>
                          <p>{getValues('street')} {getValues('street2')}</p>
                          <p>{getValues('city')}, {getValues('state')} {getValues('postalCode')}</p>
                          <p>{getValues('country')}</p>
                          <p className="pt-2 text-muted-foreground">{getValues('email')} | {getValues('phone')}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2 flex justify-between">
                          Payment Method
                          <button type="button" onClick={() => setStep(2)} className="text-xs underline text-foreground">Edit</button>
                        </h4>
                        <div className="text-sm capitalize">
                          {getValues('paymentMethod').replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-6">By placing your order, you agree to our Terms of Service and Privacy Policy.</p>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(2)} className="w-1/3 border py-4 uppercase tracking-widest text-sm font-medium hover:bg-muted transition-colors">
                      Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={createOrder.isPending}
                      className="w-2/3 bg-primary text-primary-foreground py-4 uppercase tracking-widest text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {createOrder.isPending ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Sidebar Order Summary */}
          <div className="w-full lg:w-2/5 order-1 lg:order-2 bg-muted/30 p-6 lg:p-8 lg:sticky lg:top-32">
            <h3 className="font-serif text-xl mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-muted shrink-0 relative">
                    <img src={item.productImage || '/assets/products/product-1.jpg'} alt={item.productName} className="w-full h-full object-cover" />
                    <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 text-sm flex flex-col justify-center">
                    <span className="font-medium line-clamp-1">{item.productName}</span>
                    <span className="text-muted-foreground text-xs mt-1">{item.size} {item.color ? `| ${item.color}` : ''}</span>
                  </div>
                  <div className="text-sm font-medium flex items-center">
                    {formatPrice((item.salePrice || item.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated at next step</span>
              </div>
              {cart.discount && cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-serif text-2xl pt-4 border-t mt-4">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t flex items-center gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <p>Your payment information is processed securely. We do not store credit card details nor have access to your credit card information.</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
