import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useListProducts, getListProductsQueryKey } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Shop() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [category, setCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<string>('');
  
  const { data, isLoading } = useListProducts({ 
    sort: sort as any,
    categoryId: category,
  });

  const categories = [
    { id: 1, name: 'Bridal' },
    { id: 2, name: 'Pret' },
    { id: 3, name: 'Unstitched' },
    { id: 4, name: 'Formals' },
    { id: 5, name: 'Accessories' }
  ];

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Shop' }]} />
      
      <div className="mt-8 mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl mb-4">The Collection</h1>
        <p className="text-muted-foreground font-light">Explore our complete range of premium Pakistani fashion. Each piece thoughtfully designed and crafted with exceptional quality.</p>
      </div>

      <div className="flex justify-between items-center mb-8 border-y border-border py-4">
        <button onClick={toggleFilter} className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors">
          <SlidersHorizontal className="w-4 h-4" /> 
          Filters {isFilterOpen ? '(-)' : '(+)'}
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
          <div className="relative">
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-transparent border-none text-sm font-medium uppercase tracking-wider pr-8 cursor-pointer focus:outline-none"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="best_sellers">Best Sellers</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Sidebar Filters */}
        {isFilterOpen && (
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-28 animate-in slide-in-from-left-4 fade-in duration-300">
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-lg mb-4">Categories</h3>
                <ul className="space-y-3">
                  <li>
                    <button 
                      onClick={() => setCategory(null)} 
                      className={`text-sm ${category === null ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map(c => (
                    <li key={c.id}>
                      <button 
                        onClick={() => setCategory(c.id)} 
                        className={`text-sm ${category === c.id ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-lg mb-4">Price Range</h3>
                <ul className="space-y-3">
                  {['Under $100', '$100 - $300', '$300 - $500', 'Over $500'].map(range => (
                    <li key={range}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="price" 
                          className="accent-primary w-4 h-4" 
                          checked={priceRange === range}
                          onChange={() => setPriceRange(range)}
                        />
                        <span className="text-sm text-muted-foreground">{range}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-lg mb-4">Availability</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="accent-primary w-4 h-4 rounded-none" />
                  <span className="text-sm text-muted-foreground">In Stock Only</span>
                </label>
              </div>

              <Button 
                variant="outline" 
                className="w-full rounded-none"
                onClick={() => { setCategory(null); setPriceRange(''); setSort('newest'); }}
              >
                Clear All Filters
              </Button>
            </div>
          </aside>
        )}

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {isLoading ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isFilterOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-x-6 gap-y-12`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted aspect-[3/4] mb-4"></div>
                  <div className="h-4 bg-muted w-2/3 mb-2"></div>
                  <div className="h-5 bg-muted w-full mb-3"></div>
                  <div className="h-4 bg-muted w-1/3"></div>
                </div>
              ))}
            </div>
          ) : data?.products.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="font-serif text-2xl mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters to find what you're looking for.</p>
              <Button onClick={() => { setCategory(null); setPriceRange(''); }}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-muted-foreground">
                Showing {data?.products.length} products
              </div>
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${isFilterOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-x-6 gap-y-12`}>
                {data?.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {data?.totalPages && data.totalPages > 1 && (
                <div className="mt-16 flex justify-center gap-2">
                  <Button variant="outline" className="rounded-none px-6">Previous</Button>
                  <Button variant="outline" className="rounded-none px-6">Next</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
