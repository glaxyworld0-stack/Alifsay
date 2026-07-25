import React from 'react';
import { useGetWishlist, useRemoveFromWishlist, getGetWishlistQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Link } from 'wouter';
import { Trash2, ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Wishlist() {
  const { data: wishlist, isLoading } = useGetWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();

  const handleRemove = async (productId: number) => {
    await removeFromWishlist.mutateAsync({ id: productId });
    queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 animate-pulse">
      <div className="h-10 bg-muted w-48 mb-10"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-96 bg-muted w-full"></div>)}
      </div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-[70vh]">
      <Breadcrumbs items={[{ label: 'Wishlist' }]} />
      
      <div className="flex justify-between items-end mb-10 mt-6 border-b pb-6">
        <div>
          <h1 className="font-serif text-4xl mb-2">Your Wishlist</h1>
          <p className="text-muted-foreground">{wishlist?.length || 0} items saved for later</p>
        </div>
      </div>

      {!wishlist || wishlist.length === 0 ? (
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="font-serif text-2xl mb-4">Your Wishlist is Empty</h2>
          <p className="text-muted-foreground mb-8">Keep track of your favorite items by clicking the heart icon on any product.</p>
          <Button asChild className="rounded-none px-8 py-6 uppercase tracking-widest text-xs">
            <Link href="/shop">Discover Collection</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {wishlist.map(product => (
            <div key={product.id} className="group flex flex-col relative">
              <button 
                onClick={() => handleRemove(product.id)}
                className="absolute top-3 right-3 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-muted mb-4">
                <img 
                  src={product.images?.[0] || `/assets/products/product-${(product.id % 10) + 1}.jpg`} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>

              <div className="flex flex-col flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{product.brand || product.categoryName}</p>
                <Link href={`/product/${product.id}`} className="font-serif text-base line-clamp-1 hover:text-primary transition-colors mb-2">
                  {product.name}
                </Link>
                <div className="mb-4">
                  {product.salePrice ? (
                    <div className="flex gap-2">
                      <span className="font-medium text-destructive">{formatPrice(product.salePrice)}</span>
                      <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
                    </div>
                  ) : (
                    <span className="font-medium">{formatPrice(product.price)}</span>
                  )}
                </div>
                
                <Button asChild variant="outline" className="w-full rounded-none mt-auto group-hover:bg-foreground group-hover:text-background transition-colors">
                  <Link href={`/product/${product.id}`} className="flex items-center justify-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> View Options
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
