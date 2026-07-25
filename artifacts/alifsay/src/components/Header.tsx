import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, ShoppingBag, Heart, Menu, X, User } from 'lucide-react';
import { useCartDrawer } from '@/contexts/CartDrawerContext';
import { useGetCart, getGetCartQueryKey, useGetWishlist, getGetWishlistQueryKey } from '@workspace/api-client-react';
import { useCurrency } from '@/contexts/CurrencyContext';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openCart } = useCartDrawer();
  const [location] = useLocation();
  const { currency, setCurrency } = useCurrency();

  const { data: cart } = useGetCart({ query: { queryKey: getGetCartQueryKey() } });
  const { data: wishlist } = useGetWishlist({ query: { queryKey: getGetWishlistQueryKey() } });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'New Arrivals', href: '/shop?sort=newest' },
    { name: 'Bridal', href: '/category/bridal' },
    { name: 'Pret', href: '/category/pret' },
    { name: 'Unstitched', href: '/category/unstitched' },
    { name: 'Sale', href: '/shop?onSale=true' },
  ];

  const currencies = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'AED', 'PKR'] as const;

  return (
    <>
      <div className="bg-primary text-primary-foreground text-xs py-2 px-4 text-center overflow-hidden whitespace-nowrap border-b border-primary/20">
        <div className="animate-[marquee_20s_linear_infinite] inline-block">
          <span className="mx-4">COMPLIMENTARY WORLDWIDE SHIPPING ON ORDERS OVER $300</span>
          <span className="mx-4 text-primary-foreground/60">•</span>
          <span className="mx-4">EASY RETURNS WITHIN 14 DAYS</span>
          <span className="mx-4 text-primary-foreground/60">•</span>
          <span className="mx-4">NEW EID COLLECTION LAUNCHED</span>
        </div>
      </div>
      
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-background'}`}>
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <div className="flex-1 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-foreground">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Left Nav */}
          <nav className="hidden md:flex flex-1 items-center gap-6 text-sm font-medium">
            {navLinks.slice(0, 3).map((link) => (
              <Link key={link.name} href={link.href} className="text-foreground/80 hover:text-foreground transition-colors uppercase tracking-wider text-[11px]">
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <div className="flex-1 text-center md:flex-none">
            <Link href="/" className="font-serif text-3xl md:text-4xl tracking-tight font-bold text-foreground">
              ALIFSAY
            </Link>
          </div>

          {/* Desktop Right Nav & Icons */}
          <div className="flex-1 flex items-center justify-end gap-4 md:gap-6">
            <div className="hidden md:flex gap-6 text-sm font-medium mr-4">
              {navLinks.slice(3).map((link) => (
                <Link key={link.name} href={link.href} className={`transition-colors uppercase tracking-wider text-[11px] ${link.name === 'Sale' ? 'text-destructive font-bold' : 'text-foreground/80 hover:text-foreground'}`}>
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:block">
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value as any)}
                className="bg-transparent text-xs font-medium border-none outline-none cursor-pointer p-0"
              >
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button className="text-foreground hover:text-primary transition-colors hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            
            <Link href="/wishlist" className="text-foreground hover:text-primary transition-colors relative hidden sm:block">
              <Heart className="w-5 h-5" />
              {wishlist && wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-secondary text-secondary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button onClick={openCart} className="text-foreground hover:text-primary transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-serif text-2xl font-bold tracking-tight">ALIFSAY</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full bg-muted border-none rounded-md py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`text-xl font-serif border-b border-border/50 pb-4 ${link.name === 'Sale' ? 'text-destructive' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            
            <div className="mt-auto space-y-4 border-t pt-6">
              <Link href="/wishlist" className="flex items-center gap-3 text-lg">
                <Heart className="w-5 h-5" /> Wishlist {wishlist && wishlist.length > 0 ? `(${wishlist.length})` : ''}
              </Link>
              <Link href="/my-orders" className="flex items-center gap-3 text-lg">
                <User className="w-5 h-5" /> My Account
              </Link>
              <div className="flex items-center gap-3 text-lg mt-4">
                <span className="text-muted-foreground text-sm uppercase mr-2">Currency:</span>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="bg-transparent font-medium border-b outline-none cursor-pointer py-1"
                >
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
