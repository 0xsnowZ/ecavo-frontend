import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function MobileNav({ onCartOpen }) {
  const { t } = useTranslation();
  const location = useLocation();
  const count = useCartStore((s) => s.getCount());
  const { isAuthenticated } = useAuthStore();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      icon: Home,
      label: t('nav.home'),
      to: '/',
      exact: true,
    },
    {
      icon: Search,
      label: t('header.search_button') || 'Search',
      to: '/products',
    },
    {
      icon: Heart,
      label: t('header.my_wishlist') || 'Wishlist',
      to: '/wishlist',
    },
    {
      icon: User,
      label: isAuthenticated ? t('nav.account') || 'Account' : t('header.sign_in'),
      to: isAuthenticated ? '/account' : '/login',
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 start-0 end-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-stretch">
        {/* Left nav items */}
        {navItems.slice(0, 2).map(({ icon: Icon, label, to, exact }) => {
          const active = exact ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] transition-colors
                ${active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-semibold leading-tight ${active ? 'text-primary' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Center Cart button */}
        <div className="flex-1 flex items-center justify-center py-1">
          <button
            onClick={onCartOpen}
            aria-label="Open cart"
            className="relative -mt-5 w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white
                       flex items-center justify-center shadow-lg shadow-primary/40
                       transition-all duration-200 active:scale-95"
          >
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-1 -end-1 bg-secondary text-white text-[10px] font-bold
                               w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        </div>

        {/* Right nav items */}
        {navItems.slice(2).map(({ icon: Icon, label, to }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] transition-colors
                ${active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-semibold leading-tight ${active ? 'text-primary' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
