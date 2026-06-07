import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, UserPlus, X } from 'lucide-react';
import TopBar from './TopBar';
import SearchBar from './SearchBar';
import CartIcon from './CartIcon';
import NavMenu from './NavMenu';
import SidebarDrawer from './SidebarDrawer';
import { useCartStore } from '../../../store/useCartStore';
import { useAuthStore } from '../../../store/useAuthStore';

export default function Header({ onCartOpen }) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="bg-white sticky top-0 z-40 shadow-nav">
        {/* Top bar */}
        <TopBar />

        {/* Info bar: Logo + Search + Cart */}
        <div className="container-main py-3 flex items-center justify-between gap-4">
          {/* Left: Burger + Logo */}
          <div className="flex items-center gap-2 flex-1">
            {/* Mobile burger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-dark hover:text-primary transition-colors -ms-2"
            >
              <Menu size={22} />
            </button>
            <Link to="/" className="text-2xl lg:text-3xl font-black text-secondary shrink-0">
              E<span className="text-primary">CAVO</span>
            </Link>
          </div>

          {/* SearchBar (Desktop) */}
          <div className="hidden lg:flex flex-[2] justify-center w-full">
            <SearchBar />
          </div>

          {/* Cart */}
          <div className="flex flex-1 justify-end shrink-0">
            <CartIcon onOpen={onCartOpen} />
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="lg:hidden px-4 pb-3 bg-white">
          <SearchBar />
        </div>

        {/* Bottom bar: Nav + Create Account (Desktop Only) */}
        <div className="hidden lg:block border-t border-border bg-white">
          <div className="container-main flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <NavMenu />
            </div>

            {!isAuthenticated && (
              <Link
                to="/register"
                className="btn-primary text-sm py-2 px-4"
              >
                <UserPlus size={16} />
                {t('header.create_account')}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar Drawer */}
      <SidebarDrawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
