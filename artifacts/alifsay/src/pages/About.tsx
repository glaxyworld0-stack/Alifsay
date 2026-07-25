import React from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function About() {
  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] w-full flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/assets/products/product-4.jpg" 
            alt="ALIFSAY Atelier" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4">Our Heritage</h1>
          <p className="text-lg md:text-xl text-white/80 font-light tracking-widest uppercase">The Story of Alifsay</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <Breadcrumbs items={[{ label: 'About Us' }]} />
        
        <div className="prose prose-lg max-w-none mt-12 font-light leading-relaxed text-muted-foreground">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-8 text-center">Bridging Worlds Through Craft</h2>
          
          <p className="text-xl text-foreground text-center italic mb-16">
            "ALIFSAY was born from a simple desire: to make the unparalleled craftsmanship of Pakistani couture accessible to the global diaspora, without compromising on luxury or authenticity."
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="font-serif text-2xl text-foreground mb-4">The Atelier</h3>
              <p className="mb-4">
                Based in the heart of London with our production ateliers in Lahore and Karachi, ALIFSAY operates at the intersection of Western contemporary luxury and Eastern heritage craft. 
              </p>
              <p>
                We bypass the fragmented boutique system to bring premium, designer-quality garments directly to your doorstep, whether you're in New York, Toronto, or Sydney.
              </p>
            </div>
            <div className="aspect-square bg-muted">
              <img src="/assets/products/product-9.jpg" alt="Fabric details" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center flex-row-reverse">
            <div className="aspect-[4/5] bg-muted md:order-2">
              <img src="/assets/products/product-7.jpg" alt="Artisan work" className="w-full h-full object-cover" />
            </div>
            <div className="md:order-1">
              <h3 className="font-serif text-2xl text-foreground mb-4">The Art of Zardozi</h3>
              <p className="mb-4">
                Our garments are not merely manufactured; they are crafted. We employ master artisans who have learned techniques like Zardozi, Mukesh, and Aari work passed down through generations.
              </p>
              <p>
                A single bridal piece can take up to 400 hours of hand-embroidery. We believe in slow fashion—creating heirlooms that can be passed down, preserving our cultural identity through thread and fabric.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Values */}
      <div className="bg-foreground text-background py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl mb-16 text-center">Our Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-5xl mx-auto">
            <div>
              <span className="text-4xl font-serif text-secondary block mb-4">01</span>
              <h3 className="text-xl font-serif mb-4 uppercase tracking-widest">Authenticity</h3>
              <p className="text-background/70 font-light text-sm leading-relaxed">Sourcing only pure fabrics—raw silks, pure organza, and French net. No synthetic substitutes in our premium lines.</p>
            </div>
            <div>
              <span className="text-4xl font-serif text-secondary block mb-4">02</span>
              <h3 className="text-xl font-serif mb-4 uppercase tracking-widest">Global Accessibility</h3>
              <p className="text-background/70 font-light text-sm leading-relaxed">Providing a seamless, luxury e-commerce experience tailored for the international customer with transparent sizing and shipping.</p>
            </div>
            <div>
              <span className="text-4xl font-serif text-secondary block mb-4">03</span>
              <h3 className="text-xl font-serif mb-4 uppercase tracking-widest">Ethical Craft</h3>
              <p className="text-background/70 font-light text-sm leading-relaxed">Ensuring our artisans are paid above-market wages and work in safe, empowering environments that preserve their craft.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
