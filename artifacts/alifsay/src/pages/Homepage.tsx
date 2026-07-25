import React from 'react';
import { useListFeaturedProducts, useListNewArrivals, useListCategories, useListProductReviews } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { ProductCard } from '@/components/ProductCard';
import { ArrowRight, Star, ShieldCheck, Globe, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Homepage() {
  const { data: featuredProducts, isLoading: loadingFeatured } = useListFeaturedProducts({ limit: 8 });
  const { data: newArrivals, isLoading: loadingNew } = useListNewArrivals({ limit: 4 });
  const { data: categories } = useListCategories();

  // For visual demo purposes, filter some reviews manually if API doesn't have a global hook
  const reviews = [
    { id: 1, authorName: 'Aisha K.', authorCountry: 'UK', rating: 5, body: 'The velvet shawl is even more beautiful in person. The craftsmanship is exquisite.', title: 'Stunning craftsmanship' },
    { id: 2, authorName: 'Sara M.', authorCountry: 'USA', rating: 5, body: 'Perfect fit and the silk is incredibly high quality. Wore this to a wedding and got so many compliments.', title: 'Perfect for weddings' },
    { id: 3, authorName: 'Zainab R.', authorCountry: 'Canada', rating: 5, body: 'Fast shipping to Toronto and the outfit was packaged beautifully. It felt like opening a gift.', title: 'Excellent service' },
  ];

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/assets/products/product-1.jpg" 
            alt="Premium Pakistani Wedding Wear" 
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto flex flex-col items-center">
          <span className="uppercase tracking-[0.3em] text-sm font-medium mb-4">The Bridal Edit 2025</span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">Heritage Crafted For The Modern World</h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-xl font-light">
            Exquisite zardozi, pure silks, and timeless silhouettes. Experience the luxury of Pakistani atelier fashion delivered globally.
          </p>
          <div className="flex gap-4 flex-col sm:flex-row">
            <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 rounded-none px-8 py-6 text-sm uppercase tracking-widest font-medium">
              <Link href="/shop">Shop Collection</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10 rounded-none px-8 py-6 text-sm uppercase tracking-widest font-medium">
              <Link href="/category/bridal">View Bridal</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/50">
            <div className="flex flex-col items-center gap-3 px-4">
              <Globe className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">Worldwide Shipping</h3>
              <p className="text-xs text-muted-foreground">Complimentary over $300</p>
            </div>
            <div className="flex flex-col items-center gap-3 px-4">
              <ShieldCheck className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">Authentic Designer</h3>
              <p className="text-xs text-muted-foreground">100% original guaranteed</p>
            </div>
            <div className="flex flex-col items-center gap-3 px-4">
              <RefreshCcw className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">Easy Returns</h3>
              <p className="text-xs text-muted-foreground">14-day global return policy</p>
            </div>
            <div className="flex flex-col items-center gap-3 px-4">
              <Star className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">Premium Quality</h3>
              <p className="text-xs text-muted-foreground">Finest fabrics & craftsmanship</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl mb-3">Shop by Category</h2>
              <p className="text-muted-foreground font-light">Curated collections for every occasion</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-2 text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors pb-1 border-b border-transparent hover:border-primary">
              View All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories?.slice(0, 4).map((category, idx) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="group relative aspect-[4/5] overflow-hidden bg-muted">
                <img 
                  src={category.imageUrl || `/assets/products/product-${idx + 2}.jpg`} 
                  alt={category.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                  <h3 className="font-serif text-2xl mb-1">{category.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/80">{category.productCount} Products</p>
                    <ArrowRight className="w-5 h-5 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Just Arrived</h2>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto">
              Discover the latest additions to our atelier. Fresh silhouettes and exquisite new fabrics for the upcoming season.
            </p>
          </div>
          
          {loadingNew ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted aspect-[3/4] mb-4"></div>
                  <div className="h-4 bg-muted w-2/3 mb-2"></div>
                  <div className="h-5 bg-muted w-full mb-3"></div>
                  <div className="h-4 bg-muted w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {newArrivals?.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-16 text-center">
            <Button asChild variant="outline" className="rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background px-10 py-6 uppercase tracking-widest text-xs font-medium">
              <Link href="/shop?sort=newest">Shop All New Arrivals</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Editorial Split Section */}
      <section className="py-0 flex flex-col md:flex-row min-h-[600px]">
        <div className="w-full md:w-1/2 relative bg-muted aspect-square md:aspect-auto">
          <img src="/assets/products/product-6.jpg" alt="Craftsmanship" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-10 md:p-20 bg-primary text-primary-foreground text-center md:text-left">
          <div className="max-w-md">
            <span className="uppercase tracking-[0.2em] text-xs mb-6 block opacity-80">Our Heritage</span>
            <h2 className="font-serif text-3xl md:text-5xl mb-6 leading-tight">The Art of Zardozi</h2>
            <p className="text-primary-foreground/80 font-light mb-10 leading-relaxed text-lg">
              Every ALIFSAY garment tells a story of generations. Our master artisans in Lahore and Karachi spend hundreds of hours hand-crafting intricate embroideries using techniques passed down through centuries. We preserve heritage while designing for the contemporary world.
            </p>
            <Button asChild className="bg-white text-primary hover:bg-white/90 rounded-none px-8 py-6 text-sm uppercase tracking-widest font-medium">
              <Link href="/about">Discover Our Craft</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Curated For You</h2>
          </div>
          
          {loadingFeatured ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted aspect-[3/4] mb-4"></div>
                  <div className="h-4 bg-muted w-full mb-2"></div>
                  <div className="h-4 bg-muted w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
              {featuredProducts?.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl mb-4 text-background">Loved by the Diaspora</h2>
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />)}
            </div>
            <p className="text-background/70 font-light text-sm uppercase tracking-widest">Based on 1,200+ Reviews</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-background/5 p-8 border border-background/10">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />)}
                </div>
                <h4 className="font-serif text-xl mb-3 text-background">{review.title}</h4>
                <p className="text-background/80 font-light mb-6 leading-relaxed">"{review.body}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center font-serif text-background">
                    {review.authorName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-background">{review.authorName}</p>
                    <p className="text-xs text-background/50 flex items-center gap-1">
                      Verified Buyer • <img src={`https://flagcdn.com/16x12/${review.authorCountry === 'UK' ? 'gb' : review.authorCountry === 'USA' ? 'us' : 'ca'}.png`} alt={review.authorCountry} className="inline w-3" />
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-[#EAE5D9]">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">Join The Atelier</h2>
          <p className="text-muted-foreground font-light mb-8">
            Subscribe to receive exclusive access to new collections, private sales, and stories of craftsmanship.
          </p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 bg-transparent border-b border-foreground/30 px-4 py-3 focus:outline-none focus:border-foreground transition-colors rounded-none placeholder:text-foreground/40"
              required
            />
            <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90 rounded-none px-8 py-6 uppercase tracking-widest text-xs font-medium">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
