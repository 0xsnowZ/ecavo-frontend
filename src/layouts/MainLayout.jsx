import { useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer';
import CartDrawer from '../features/cart/CartDrawer';
import MobileNav from '../components/layout/MobileNav';

export default function MainLayout() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileNav onCartOpen={() => setCartOpen(true)} />
      <ScrollRestoration />
    </div>
  );
}
