import React from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useRoute } from 'wouter';
import { Link } from 'wouter';
import { useListProducts, getListProductsQueryKey } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';

export default function Category() {
  const [, params] = useRoute('/category/:slug');
  const slug = params?.slug || '';
  
  // In a real app we'd fetch the category details by slug to get ID and image.
  // For this mock, we map the slug to a mock category ID.
  const categoryMap: Record<string, { id: number, name: string, desc: string, img: string }> = {
    'bridal': { id: 1, name: 'Bridal Edit', desc: 'Exquisite handcrafted bridal wear for your special day.', img: '/assets/products/product-1.jpg' },
    'pret': { id: 2, name: 'Ready to Wear', desc: 'Contemporary elegance ready to be worn globally.', img: '/assets/products/product-2.jpg' },
    'unstitched': { id: 3, name: 'Unstitched Luxury', desc: 'Premium fabrics with intricate embroidery components.', img: '/assets/products/product-9.jpg' },
    'accessories': { id: 4, name: 'Accessories', desc: 'Handcrafted shawls, dupattas, and jewelry.', img: '/assets/products/product-5.jpg' }
  };

  const category = categoryMap[slug] || { id: 0, name: slug.charAt(0).toUpperCase() + slug.slice(1), desc: 'Explore our curated collection.', img: '/assets/products/product-6.jpg' };
  
  const { data, isLoading } = useListProducts({ categoryId: category.id });

  return (
    <div className="w-full">
      {/* Category Hero */}
      <div className="relative h-[40vh] min-h-[300px] w-full flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full">
          <img src={category.img} alt={category.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-2xl">
          <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: category.name }]} />
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 mt-4">{category.name}</h1>
          <p className="text-white/80 font-light">{category.desc}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted aspect-[3/4] mb-4"></div>
                <div className="h-4 bg-muted w-2/3 mb-2"></div>
                <div className="h-5 bg-muted w-full mb-3"></div>
              </div>
            ))}
          </div>
        ) : data?.products.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="font-serif text-2xl mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">We're currently updating this collection.</p>
            <Link href="/shop" className="underline underline-offset-4">View All Products</Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Showing {data?.products.length} products</div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {data?.products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
