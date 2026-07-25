import React from 'react';
import { useRoute, Link } from 'wouter';
import { useGetOrder } from '@workspace/api-client-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CheckCircle2, Package, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderConfirmation() {
  const [, params] = useRoute('/order-confirmation/:id');
  const id = parseInt(params?.id || '0');
  const { data: order, isLoading } = useGetOrder(id);
  const { formatPrice } = useCurrency();

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;
  }

  if (!order) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h2 className="font-serif text-3xl mb-4">Order Not Found</h2>
      <Link href="/" className="underline underline-offset-4">Return Home</Link>
    </div>;
  }

  return (
    <div className="bg-muted/10 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-background p-8 md:p-12 shadow-sm border text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl mb-2">Thank you for your purchase</h1>
          <p className="text-muted-foreground mb-8 text-lg">Your order <span className="font-medium text-foreground">#{order.orderNumber}</span> has been confirmed.</p>
          
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            We've sent a confirmation email to <span className="font-medium text-foreground">{order.shippingAddress.email}</span>. We'll send another email when your order ships.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-foreground text-background px-8 py-6 rounded-none text-sm uppercase tracking-widest">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" className="px-8 py-6 rounded-none text-sm uppercase tracking-widest">
              <Link href={`/track-order?orderNumber=${order.orderNumber}`}>Track Order</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-background p-8 shadow-sm border space-y-8">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
                <MapPin className="w-4 h-4" /> Shipping Address
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.street}</p>
                {order.shippingAddress.street2 && <p>{order.shippingAddress.street2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
                <CreditCard className="w-4 h-4" /> Payment Method
              </h3>
              <p className="text-sm text-muted-foreground capitalize">
                {order.paymentMethod?.replace('_', ' ') || 'Credit Card'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
                <Package className="w-4 h-4" /> Estimated Delivery
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                {order.estimatedDelivery || '5-7 Business Days'}
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-background p-8 shadow-sm border">
            <h3 className="text-sm font-medium uppercase tracking-wider mb-6 border-b pb-2">Order Items</h3>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4 text-sm">
                  <div className="w-16 h-20 bg-muted shrink-0 relative">
                    <img src={item.productImage || '/assets/products/product-1.jpg'} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="font-medium line-clamp-1">{item.productName}</span>
                    <span className="text-muted-foreground text-xs mt-1">Size: {item.size} | Qty: {item.quantity}</span>
                  </div>
                  <div className="font-medium flex items-center">
                    {formatPrice(item.total)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm pt-4 border-t text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping || 0)}</span>
              </div>
              {order.discount && order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-serif text-xl pt-4 border-t mt-2 text-foreground">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
