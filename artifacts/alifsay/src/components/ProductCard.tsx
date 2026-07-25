import React, { useState } from 'react';
import { Link } from 'wouter';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '@workspace/api-client-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAddToCart, getGetCartQueryKey, useAddToWishlist, useRemoveFromWishlist, getGetWishlistQueryKey, useGetWishlist } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useCartDrawer } from '@/contexts/CartDrawerContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { openCart } = useCartDrawer();
  
  const { data: wishlist } = useGetWishlist({ query: { queryKey: getGetWishlistQueryKey() } });
  const isWishlisted = wishlist?.some(item => item.id === product.id) || false;
  
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // If it has sizes or colors, open quick view instead of direct add
    if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
      setIsQuickViewOpen(true);
      return;
    }

    try {
      await addToCart.mutateAsync({ 
        data: { 
          productId: product.id, 
          quantity: 1 
        } 
      });
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      openCart();
    } catch (error) {
      toast({
        title: "Error adding to cart",
        variant: "destructive"
      });
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isWishlisted) {
        await removeFromWishlist.mutateAsync({ productId: product.id });
        toast({ title: "Removed from wishlist" });
      } else {
        await addToWishlist.mutateAsync({ productId: product.id });
        toast({ title: "Added to wishlist" });
      }
      queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
    } catch (error) {
      toast({
        title: "Error updating wishlist",
        variant: "destructive"
      });
    }
  };

  const getFallbackImage = () => {
    // Deterministic fallback based on ID
    const imgNum = (product.id % 10) + 1;
    return `/assets/products/product-${imgNum}.jpg`;
  };

  const mainImage = product.images?.[0] || getFallbackImage();
  const hoverImage = product.images?.[1] || mainImage;

  return (
    <>
      <div 
        className="group flex flex-col cursor-pointer relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.isNewArrival && (
            <span className="bg-background text-foreground text-[10px] uppercase tracking-wider px-2 py-1 border border-border">
              New
            </span>
          )}
          {product.isOnSale && (
            <span className="bg-destructive text-destructive-foreground text-[10px] uppercase tracking-wider px-2 py-1">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={toggleWishlist}
          className="absolute top-3 right-3 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
        </button>

        {/* Image Container */}
        <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-muted mb-4">
          <img 
            src={mainImage} 
            alt={product.name} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          />
          <img 
            src={hoverImage} 
            alt={product.name} 
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-105 opacity-100' : 'scale-100 opacity-0'}`}
          />
          
          {/* Quick Actions overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex gap-2">
            <button 
              onClick={(e) => { e.preventDefault(); setIsQuickViewOpen(true); }}
              className="flex-1 bg-background text-foreground py-3 text-sm font-medium border border-border hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" /> Quick View
            </button>
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Add
            </button>
          </div>
        </Link>

        {/* Content */}
        <div className="flex flex-col flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{product.brand || product.categoryName}</p>
          <Link href={`/product/${product.id}`} className="font-serif text-base line-clamp-2 hover:text-primary transition-colors mb-2">
            {product.name}
          </Link>
          <div className="mt-auto flex items-center gap-3">
            {product.salePrice ? (
              <>
                <span className="font-medium text-destructive">{formatPrice(product.salePrice)}</span>
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="font-medium">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background gap-0 border-none rounded-none">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-[3/4] md:aspect-auto md:h-[600px] bg-muted relative">
               <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-8 flex flex-col">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{product.brand}</p>
              <h2 className="font-serif text-2xl mb-4">{product.name}</h2>
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                {product.salePrice ? (
                  <>
                    <span className="text-xl font-medium text-destructive">{formatPrice(product.salePrice)}</span>
                    <span className="text-base text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  </>
                ) : (
                  <span className="text-xl font-medium">{formatPrice(product.price)}</span>
                )}
              </div>
              
              <div className="space-y-6 flex-1">
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium">Select Size</span>
                      <Link href="/size-guide" className="text-xs underline text-muted-foreground">Size Guide</Link>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(size => (
                        <button key={size} className="border border-border py-2 px-4 text-sm hover:border-foreground transition-colors min-w-[3rem]">
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <span className="text-sm font-medium block mb-3">Select Color</span>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map(color => (
                        <button key={color} className="border border-border py-2 px-4 text-sm hover:border-foreground transition-colors">
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-6 mt-6 border-t space-y-3">
                <button 
                  onClick={() => {
                     addToCart.mutate({ data: { productId: product.id, quantity: 1 } }, {
                       onSuccess: () => {
                         queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
                         setIsQuickViewOpen(false);
                         openCart();
                       }
                     });
                  }}
                  className="w-full bg-foreground text-background py-4 uppercase tracking-widest text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
                </button>
                <Link 
                  href={`/product/${product.id}`}
                  className="w-full block text-center border py-4 uppercase tracking-widest text-sm font-medium hover:bg-muted transition-colors"
                  onClick={() => setIsQuickViewOpen(false)}
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
