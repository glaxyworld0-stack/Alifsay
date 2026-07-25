import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useGetCart, useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey, useApplyCoupon } from '@workspace/api-client-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQueryClient } from '@tanstack/react-query';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function Cart() {
  const [, setLocation] = useLocation();
  const { formatPrice } = useCurrency();
  const queryClient = useQueryClient();
  
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const applyCoupon = useApplyCoupon();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const handleQuantityChange = async (itemId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    
    setIsUpdating(itemId);
    await updateItem.mutateAsync({ id: itemId, data: { quantity: newQty } });
    await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    setIsUpdating(null);
  };

  const handleRemove = async (itemId: number) => {
    setIsUpdating(itemId);
    await removeItem.mutateAsync({ id: itemId });
    await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    setIsUpdating(null);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    try {
      await applyCoupon.mutateAsync({ data: { code: couponCode } });
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      setCouponError('');
    } catch (err) {
      setCouponError('Invalid or expired coupon code');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 animate-pulse">
      <div className="h-10 bg-muted w-48 mb-10"></div>
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3 space-y-6">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-muted w-full"></div>)}
        </div>
        <div className="w-full lg:w-1/3">
          <div className="h-64 bg-muted w-full"></div>
        </div>
      </div>
    </div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any premium pieces to your collection yet.</p>
        <Link href="/shop" className="inline-block bg-foreground text-background py-4 px-8 uppercase tracking-widest text-sm font-medium hover:bg-foreground/90 transition-colors">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />
      
      <h1 className="font-serif text-4xl mb-10 mt-6 text-center">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          
          <div className="space-y-6 md:space-y-0 divide-y divide-border">
            {cart.items.map((item) => (
              <div key={item.id} className={`py-6 flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center ${isUpdating === item.id ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
                <div className="col-span-6 flex gap-4">
                  <Link href={`/product/${item.productId}`} className="w-24 h-32 bg-muted shrink-0">
                    <img src={item.productImage || '/assets/products/product-1.jpg'} alt={item.productName} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex flex-col justify-center">
                    <Link href={`/product/${item.productId}`} className="font-serif text-lg hover:text-primary transition-colors">
                      {item.productName}
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.color && <span className="mr-3">Color: {item.color}</span>}
                      {item.size && <span>Size: {item.size}</span>}
                    </div>
                    <button 
                      onClick={() => handleRemove(item.id)} 
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors uppercase tracking-wider mt-4 self-start flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
                
                <div className="col-span-2 md:text-center font-medium hidden md:block">
                  {formatPrice(item.salePrice || item.price)}
                </div>
                
                <div className="col-span-2 flex md:justify-center items-center">
                  <div className="flex items-center border border-border">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                      disabled={item.quantity <= 1}
                      className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                      className="p-2 text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="col-span-2 md:text-right font-medium flex justify-between md:block mt-4 md:mt-0">
                  <span className="md:hidden text-muted-foreground">Total:</span>
                  {formatPrice((item.salePrice || item.price) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3 bg-muted/30 p-8">
          <h3 className="font-serif text-2xl mb-6 border-b pb-4">Order Summary</h3>
          
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            
            {cart.discount && cart.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({cart.couponCode})</span>
                <span>-{formatPrice(cart.discount)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            
            <div className="flex justify-between font-serif text-xl border-t pt-4 mt-4">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setLocation('/checkout')}
            className="w-full bg-foreground text-background py-4 uppercase tracking-widest text-sm font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 mb-6"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>
          
          <div className="pt-6 border-t">
            <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-3">Promo Code</span>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input 
                type="text" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code" 
                className="flex-1 border bg-transparent px-3 py-2 text-sm uppercase outline-none focus:border-foreground transition-colors"
              />
              <button 
                type="submit"
                className="bg-muted-foreground/20 hover:bg-foreground hover:text-background px-4 text-sm uppercase tracking-wider transition-colors"
              >
                Apply
              </button>
            </form>
            {couponError && <p className="text-destructive text-xs mt-2">{couponError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
