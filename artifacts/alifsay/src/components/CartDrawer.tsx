import React, { useEffect, useState } from 'react';
import { useCartDrawer } from '@/contexts/CartDrawerContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useGetCart, useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function CartDrawer() {
  const { isOpen, closeCart } = useCartDrawer();
  const { formatPrice } = useCurrency();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useGetCart({ query: { enabled: isOpen, queryKey: getGetCartQueryKey() } });
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // Close when escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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

  const goToCheckout = () => {
    closeCart();
    setLocation('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-50 transition-opacity backdrop-blur-sm" 
        onClick={closeCart}
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-background border-l shadow-2xl z-50 flex flex-col transition-transform transform translate-x-0 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-serif text-2xl font-medium tracking-tight">Your Cart {cart?.itemCount ? `(${cart.itemCount})` : ''}</h2>
          <button onClick={closeCart} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-24 h-32 bg-muted rounded"></div>
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-4 bg-muted w-3/4 rounded"></div>
                    <div className="h-3 bg-muted w-1/2 rounded"></div>
                    <div className="h-4 bg-muted w-1/4 rounded mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : cart && cart.items.length > 0 ? (
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item.id} className={`flex gap-4 ${isUpdating === item.id ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
                  <div className="w-24 h-32 bg-muted flex-shrink-0 relative overflow-hidden">
                    <img 
                      src={item.productImage || '/assets/products/product-1.jpg'} 
                      alt={item.productName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium line-clamp-1">{item.productName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.color && <span>{item.color}</span>}
                          {item.color && item.size && <span> | </span>}
                          {item.size && <span>Size: {item.size}</span>}
                        </p>
                      </div>
                      <button onClick={() => handleRemove(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border rounded">
                        <button 
                          className="px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button 
                          className="px-2 py-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-medium">
                        {formatPrice(item.salePrice ? item.salePrice * item.quantity : item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
              <Button onClick={() => { closeCart(); setLocation('/shop'); }} variant="outline">
                Continue Shopping
              </Button>
            </div>
          )}
        </ScrollArea>

        {cart && cart.items.length > 0 && (
          <div className="p-6 bg-background border-t">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.discount && cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-serif text-xl">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Shipping and taxes calculated at checkout.</p>
            </div>
            
            <div className="space-y-3">
              <Button onClick={goToCheckout} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6">
                Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="w-full py-6" onClick={() => { closeCart(); setLocation('/cart'); }}>
                View Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
