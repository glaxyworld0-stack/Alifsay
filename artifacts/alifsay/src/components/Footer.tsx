import React from 'react';
import { Link } from 'wouter';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcApplePay } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          
          <div className="space-y-6">
            <Link href="/" className="font-serif text-3xl font-bold tracking-tight inline-block text-background">
              ALIFSAY
            </Link>
            <p className="text-background/70 text-sm leading-relaxed max-w-xs">
              The digital destination for premium Pakistani fashion. Bridging heritage craftsmanship with contemporary luxury for the global diaspora.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6 uppercase tracking-wider text-background">Shop</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li><Link href="/shop?sort=newest" className="hover:text-background transition-colors">New Arrivals</Link></li>
              <li><Link href="/category/bridal" className="hover:text-background transition-colors">Bridal Collection</Link></li>
              <li><Link href="/category/pret" className="hover:text-background transition-colors">Ready to Wear</Link></li>
              <li><Link href="/category/unstitched" className="hover:text-background transition-colors">Unstitched Fabric</Link></li>
              <li><Link href="/category/accessories" className="hover:text-background transition-colors">Accessories</Link></li>
              <li><Link href="/shop?onSale=true" className="hover:text-background transition-colors text-red-400">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6 uppercase tracking-wider text-background">Customer Care</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li><Link href="/contact" className="hover:text-background transition-colors">Contact Us</Link></li>
              <li><Link href="/track-order" className="hover:text-background transition-colors">Track Your Order</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-background transition-colors">Shipping Info</Link></li>
              <li><Link href="/return-policy" className="hover:text-background transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/size-guide" className="hover:text-background transition-colors">Size Guide</Link></li>
              <li><Link href="/faq" className="hover:text-background transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6 uppercase tracking-wider text-background">Contact</h4>
            <ul className="space-y-4 text-sm text-background/70">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 shrink-0 text-background/50" />
                <span>124 Atelier Avenue, Fashion District<br />London, W1 4XY, United Kingdom</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="w-5 h-5 shrink-0 text-background/50" />
                <span>+44 20 7946 0958</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="w-5 h-5 shrink-0 text-background/50" />
                <span>concierge@alifsay.com</span>
              </li>
            </ul>
            <div className="mt-8">
              <h5 className="text-xs uppercase tracking-wider text-background/50 mb-3">Secure Payments</h5>
              <div className="flex gap-2 text-2xl text-background/50">
                <FaCcVisa />
                <FaCcMastercard />
                <FaCcPaypal />
                <FaCcApplePay />
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-background/50">
          <p>© {new Date().getFullYear()} ALIFSAY. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-background transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
