import React from 'react';
import { Route, Switch } from 'wouter';
import { Layout } from './components/Layout';
import { CartDrawerProvider } from './contexts/CartDrawerContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

// Pages
import Homepage from './pages/Homepage';
import Shop from './pages/Shop';
import Category from './pages/Category';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import TrackOrder from './pages/TrackOrder';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';


function PolicyPage({ title }: { title: string }) {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <h1 className="font-serif text-4xl mb-8 text-center">{title}</h1>
      <div className="prose prose-sm max-w-none text-muted-foreground font-light leading-relaxed">
        <p>This is a placeholder policy page.</p>
      </div>
    </div>
  );
}


function NotFound() {
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <h1 className="font-serif text-6xl mb-4">404</h1>
      <h2 className="text-2xl mb-6">Page Not Found</h2>
      <a href="/" className="bg-foreground text-background px-8 py-3">
        Return Home
      </a>
    </div>
  );
}


function StoreRoutes() {
  return (
    <Layout>
      <Switch>

        <Route path="/" component={Homepage} />
        <Route path="/shop" component={Shop} />
        <Route path="/category/:slug" component={Category} />
        <Route path="/product/:id" component={ProductDetail} />

        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />

        <Route path="/order-confirmation/:id" component={OrderConfirmation} />
        <Route path="/track-order" component={TrackOrder} />

        <Route path="/wishlist" component={Wishlist} />

        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/faq" component={FAQ} />

        <Route path="/shipping-policy">
          <PolicyPage title="Shipping Policy" />
        </Route>

        <Route path="/return-policy">
          <PolicyPage title="Return Policy" />
        </Route>

        <Route path="/terms">
          <PolicyPage title="Terms & Conditions" />
        </Route>

        <Route path="/privacy">
          <PolicyPage title="Privacy Policy" />
        </Route>

        <Route path="/size-guide">
          <PolicyPage title="Global Size Guide" />
        </Route>

        <Route path="/my-orders">
          <PolicyPage title="My Account" />
        </Route>

        <Route path="/blog">
          <PolicyPage title="Editorial" />
        </Route>

        <Route component={NotFound} />

      </Switch>
    </Layout>
  );
}



function Router() {
  return (
    <Switch>

      {/* ADMIN */}
      <Route path="/admin/login" component={AdminLogin} />

      <Route path="/admin/dashboard" component={AdminDashboard} />


      {/* STORE */}
      <Route>
        <StoreRoutes />
      </Route>


    </Switch>
  );
}



export function App() {
  return (
    <CurrencyProvider>
      <CartDrawerProvider>
        <Router />
      </CartDrawerProvider>
    </CurrencyProvider>
  );
}
