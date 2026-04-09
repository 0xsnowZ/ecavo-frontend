import { useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer';
import CartDrawer from '../features/cart/CartDrawer';

export default function MainLayout() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ScrollRestoration />
    </div>
  );
}
