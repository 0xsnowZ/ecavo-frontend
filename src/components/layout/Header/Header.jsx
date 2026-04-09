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

export default function Header({ onCartOpen }) {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  return (
    <>
      <header className="bg-white sticky top-0 z-40 shadow-nav">
        {/* Top bar */}
        <TopBar />

        {/* Info bar: Logo + Search + Cart */}
        <div className="container-main py-3 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="text-3xl font-black text-secondary shrink-0">
            E<span className="text-primary">CAVO</span>
          </Link>

          <SearchBar />

          {/* Cart */}
          <CartIcon onOpen={onCartOpen} />
        </div>

        {/* Bottom bar: Nav + Create Account */}
        <div className="border-t border-border bg-white">
          <div className="container-main flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              {/* Mobile burger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-dark hover:text-primary transition-colors"
              >
                <Menu size={22} />
              </button>

              <div className="hidden lg:block">
                <NavMenu />
              </div>
            </div>

            <Link
              to="/register"
              className="btn-primary text-sm py-2 px-4"
            >
              <UserPlus size={16} />
              {t('header.create_account')}
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar Drawer */}
      <SidebarDrawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
