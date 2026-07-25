import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { useGetProduct, useGetRelatedProducts, useAddToCart, getGetCartQueryKey } from '@workspace/api-client-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCartDrawer } from '@/contexts/CartDrawerContext';
import { useQueryClient } from '@tanstack/react-query';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StarRating } from '@/components/StarRating';
import { ProductCard } from '@/components/ProductCard';
import { Minus, Plus, Heart, Share2, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function ProductDetail() {
  const [, params] = useRoute('/product/:id');
  const id = parseInt(params?.id || '0');
  
  const { data: product, isLoading } = useGetProduct(id);
  const { data: relatedProducts } = useGetRelatedProducts(id);
  
  const { formatPrice } = useCurrency();
  const { openCart } = useCartDrawer();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-muted w-48 mb-8"></div>
      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/2 aspect-[3/4] bg-muted"></div>
        <div className="w-full md:w-1/2 space-y-6 pt-10">
          <div className="h-10 bg-muted w-3/4"></div>
          <div className="h-6 bg-muted w-1/4"></div>
          <div className="h-20 bg-muted w-full"></div>
          <div className="h-12 bg-muted w-full mt-10"></div>
        </div>
      </div>
    </div>;
  }

  if (!product) return <div className="container mx-auto py-20 text-center text-2xl font-serif">Product not found</div>;

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      alert("Please select a size");
      return;
    }
    if (product.colors?.length && !selectedColor) {
      alert("Please select a color");
      return;
    }
    
    addToCart.mutate({
      data: {
        productId: product.id,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        openCart();
      }
    });
  };

  const images = product.images?.length ? product.images : [
    `/assets/products/product-${(product.id % 10) + 1}.jpg`,
    `/assets/products/product-${((product.id+1) % 10) + 1}.jpg`
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { label: 'Shop', href: '/shop' },
        { label: product.categoryName || 'Category', href: `/category/${product.categoryId}` },
        { label: product.name }
      ]} />
      
      <div className="flex flex-col md:flex-row gap-10 lg:gap-16 mt-8">
        {/* Image Gallery */}
        <div className="w-full md:w-1/2 flex flex-col-reverse lg:flex-row gap-4">
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:w-24 shrink-0 no-scrollbar">
            {images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImageIndex(idx)}
                className={`w-20 lg:w-full aspect-[3/4] shrink-0 border-2 transition-colors ${activeImageIndex === idx ? 'border-foreground' : 'border-transparent'}`}
              >
                <img src={img} alt={`${product.name} - view ${idx+1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          
          <div className="flex-1 aspect-[3/4] bg-muted relative group overflow-hidden cursor-crosshair">
            <img 
              src={images[activeImageIndex]} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-125 origin-center"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col py-2 lg:py-6">
          <div className="mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{product.brand}</p>
            <h1 className="font-serif text-3xl lg:text-4xl leading-tight mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                {product.salePrice ? (
                  <>
                    <span className="text-2xl font-medium text-destructive">{formatPrice(product.salePrice)}</span>
                    <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  </>
                ) : (
                  <span className="text-2xl font-medium">{formatPrice(product.price)}</span>
                )}
              </div>
              <div className="h-5 w-px bg-border"></div>
              <StarRating rating={product.rating || 4.5} count={product.reviewCount || 12} />
            </div>
            
            <p className="text-muted-foreground leading-relaxed font-light">{product.description || 'Premium craftsmanship meets contemporary design in this exquisite piece. Detailed specifications and fabric information available below.'}</p>
          </div>

          <div className="space-y-8 py-8 border-y border-border">
            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium uppercase tracking-wider">Size</span>
                  <button onClick={() => setIsSizeGuideOpen(true)} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
                    <Ruler className="w-3 h-3" /> Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`border py-2 px-5 text-sm font-medium transition-colors ${selectedSize === size ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground/50 text-foreground'}`}
                    >
                      {size}
                    </button>
                  ))}
                  <button 
                    onClick={() => setSelectedSize('Custom')}
                    className={`border py-2 px-5 text-sm font-medium transition-colors ${selectedSize === 'Custom' ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground/50 text-foreground'}`}
                  >
                    Custom Size
                  </button>
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <span className="text-sm font-medium uppercase tracking-wider block mb-3">Color</span>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`border py-2 px-5 text-sm font-medium transition-colors ${selectedColor === color ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground/50 text-foreground'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="flex gap-4">
              <div className="flex items-center border border-border h-14">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-muted-foreground hover:text-foreground h-full">-</button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 text-muted-foreground hover:text-foreground h-full">+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="flex-1 bg-foreground text-background h-14 uppercase tracking-widest text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
              </button>
              
              <button className="h-14 w-14 border border-border flex items-center justify-center hover:bg-muted transition-colors text-foreground">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Truck className="w-4 h-4 text-foreground" /> 
              <span>Free worldwide shipping on orders over $300. Estimated delivery: 5-7 business days.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-foreground" /> 
              <span>100% authentic. Secure payment. 14-day global return policy.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground pt-4">
              <Share2 className="w-4 h-4 text-foreground" /> 
              <button className="hover:text-foreground underline underline-offset-4">Share this product</button>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-24 pt-10 border-t">
        <div className="flex justify-center gap-8 border-b mb-8 overflow-x-auto no-scrollbar">
          {['description', 'specifications', 'shipping', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="max-w-3xl mx-auto py-4">
          {activeTab === 'description' && (
            <div className="prose prose-sm max-w-none font-light leading-relaxed">
              <p>{product.description}</p>
              <p>An epitome of classic elegance, this ALIFSAY ensemble is hand-crafted by master artisans. The meticulous attention to detail and premium fabric selection makes it a timeless addition to your wardrobe, perfect for special occasions anywhere in the world.</p>
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-b pb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Fabric</span>
                <span className="font-medium">{product.fabric || 'Premium Silk/Chiffon'}</span>
              </div>
              <div className="border-b pb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Work/Embroidery</span>
                <span className="font-medium">Zardozi, Resham, Sequins</span>
              </div>
              <div className="border-b pb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Care Instructions</span>
                <span className="font-medium">Dry Clean Only. Do not use bleach.</span>
              </div>
              <div className="border-b pb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">SKU</span>
                <span className="font-medium">{product.sku || `ALF-${product.id}00${product.categoryId}`}</span>
              </div>
            </div>
          )}
          
          {activeTab === 'shipping' && (
            <div className="prose prose-sm max-w-none font-light leading-relaxed">
              <h4 className="font-serif text-lg mb-2">Global Delivery</h4>
              <p>We deliver worldwide via DHL Express. Delivery timeline varies by region:</p>
              <ul>
                <li>UK & Europe: 3-5 business days</li>
                <li>USA & Canada: 4-6 business days</li>
                <li>Middle East: 2-4 business days</li>
                <li>Australia: 5-7 business days</li>
              </ul>
              <p>Custom sized orders require an additional 14-21 days for production.</p>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="font-serif text-2xl mb-2">Customer Reviews</h4>
                  <StarRating rating={4.8} count={24} size="lg" />
                </div>
                <button className="border border-foreground px-6 py-3 text-sm font-medium uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors">
                  Write a Review
                </button>
              </div>
              
              <div className="space-y-6">
                {[1,2,3].map(i => (
                  <div key={i} className="border-b pb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <StarRating rating={5} />
                        <h5 className="font-medium mt-1">Stunning quality</h5>
                      </div>
                      <span className="text-xs text-muted-foreground">Oct {10+i}, 2024</span>
                    </div>
                    <p className="text-sm font-light text-muted-foreground mb-3">Absolutely beautiful outfit. The embroidery is flawless and it fits perfectly. Customer service was excellent.</p>
                    <div className="text-xs font-medium">Zara M. - Verified Buyer, USA</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-24">
          <h3 className="font-serif text-3xl mb-8 text-center">You May Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <Dialog open={isSizeGuideOpen} onOpenChange={setIsSizeGuideOpen}>
        <DialogContent className="max-w-4xl p-8 bg-background border-none rounded-none">
          <h2 className="font-serif text-3xl mb-6 text-center">Size Guide</h2>
          <p className="text-center text-muted-foreground mb-8">Measurements are in inches. Our garments are designed with a tailored fit.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-foreground/20">
                  <th className="py-4 font-medium uppercase tracking-wider">Size</th>
                  <th className="py-4 font-medium uppercase tracking-wider">UK/AU</th>
                  <th className="py-4 font-medium uppercase tracking-wider">US</th>
                  <th className="py-4 font-medium uppercase tracking-wider">EU</th>
                  <th className="py-4 font-medium uppercase tracking-wider">Chest</th>
                  <th className="py-4 font-medium uppercase tracking-wider">Waist</th>
                  <th className="py-4 font-medium uppercase tracking-wider">Hips</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { size: 'XS', uk: '6-8', us: '2-4', eu: '34-36', chest: '32-33', waist: '26-27', hips: '35-36' },
                  { size: 'S', uk: '8-10', us: '4-6', eu: '36-38', chest: '34-35', waist: '28-29', hips: '37-38' },
                  { size: 'M', uk: '10-12', us: '6-8', eu: '38-40', chest: '36-37', waist: '30-31', hips: '39-40' },
                  { size: 'L', uk: '12-14', us: '8-10', eu: '40-42', chest: '38-39', waist: '32-33', hips: '41-42' },
                  { size: 'XL', uk: '14-16', us: '10-12', eu: '42-44', chest: '40-41', waist: '34-35', hips: '43-44' },
                  { size: 'XXL', uk: '16-18', us: '12-14', eu: '44-46', chest: '42-43', waist: '36-37', hips: '45-46' },
                ].map((row) => (
                  <tr key={row.size}>
                    <td className="py-4 font-medium">{row.size}</td>
                    <td className="py-4 text-muted-foreground">{row.uk}</td>
                    <td className="py-4 text-muted-foreground">{row.us}</td>
                    <td className="py-4 text-muted-foreground">{row.eu}</td>
                    <td className="py-4">{row.chest}</td>
                    <td className="py-4">{row.waist}</td>
                    <td className="py-4">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 bg-muted p-6 text-sm flex gap-4 items-start">
            <Ruler className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Custom Sizing</h4>
              <p className="text-muted-foreground">Select "Custom Size" when ordering and our concierge team will reach out via WhatsApp to collect your exact measurements for a bespoke fit.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
