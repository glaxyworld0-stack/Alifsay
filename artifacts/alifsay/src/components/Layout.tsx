import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { ScrollRestoration } from './ScrollRestoration';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <ScrollRestoration />
      <Header />
      <main className="flex-1 flex flex-col relative w-full">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
