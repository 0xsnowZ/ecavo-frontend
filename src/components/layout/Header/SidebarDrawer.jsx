import { X, User, Heart, Globe, DollarSign } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocaleStore, CURRENCIES, LANGUAGES } from '../../../store/useLocaleStore';
import { useAuthStore } from '../../../store/useAuthStore';

const DEPARTMENTS = [
  { label: 'sidebar.home_appliances', to: '/categories/appliances' },
  { label: 'sidebar.toys',            to: '/categories/toys' },
  { label: 'sidebar.chargers',        to: '/categories/accessories' },
  { label: 'sidebar.furniture',       to: '/categories/furniture' },
  { label: 'sidebar.phones',          to: '/categories/mobiles' },
  { label: 'sidebar.clothes',         to: '/categories/clothes' },
  { label: 'sidebar.shoes',           to: '/categories/shoes' },
  { label: 'sidebar.accessories',     to: '/categories/accessories' },
  { label: 'sidebar.beauty',          to: '/categories/beauty' },
  { label: 'sidebar.tvs',             to: '/categories/tvs' },
];

export default function SidebarDrawer({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { language, currency, setLanguage, setCurrency } = useLocaleStore();
  const { isAuthenticated, user } = useAuthStore();

  const handleLang = (e) => {
    setLanguage(e.target.value);
  };

  const handleCurrency = (e) => {
    setCurrency(e.target.value);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
                    ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 start-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col
                    transform transition-all duration-300 ease-in-out
                    ${open
                      ? 'translate-x-0 visible'
                      : isRTL ? 'translate-x-full invisible' : '-translate-x-full invisible'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">
              {t('sidebar.shop_by')}
            </p>
            <Link to="/" onClick={onClose} className="text-xl font-black text-secondary">
              E<span className="text-primary">CAVO</span>
            </Link>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-lg hover:bg-gray-100 text-muted hover:text-dark transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto pb-2">
          {DEPARTMENTS.map(({ label, to }) => (
            <NavLink
              key={`${label}-${to}`}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-primary/10 text-primary font-bold'
                   : 'text-dark hover:bg-gray-100 hover:text-primary'
                 }`
               }
            >
              {t(label)}
            </NavLink>
          ))}
        </nav>

        {/* Bottom panel (Account & Settings) */}
        <div className="border-t border-border bg-gray-50 p-4 pb-20 shrink-0 space-y-4">
          {/* Account links */}
          <div className="flex flex-col gap-2">
            <Link
              to="/wishlist"
              onClick={onClose}
              className="flex items-center gap-2.5 text-sm text-dark hover:text-primary transition-colors px-2 py-1.5 rounded-md"
            >
              <Heart size={18} className="text-muted" />
              <span>{t('header.my_wishlist')}</span>
            </Link>

            {isAuthenticated ? (
              <Link
                to="/account"
                onClick={onClose}
                className="flex items-center gap-2.5 text-sm text-dark hover:text-primary transition-colors px-2 py-1.5 rounded-md font-semibold"
              >
                <User size={18} className="text-primary" />
                <span>{user?.name}</span>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="btn-outline justify-center text-xs py-2 px-3 rounded-lg font-bold"
                >
                  {t('header.sign_in')}
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="btn-primary justify-center text-xs py-2 px-3 rounded-lg font-bold"
                >
                  {t('header.create_account')}
                </Link>
              </div>
            )}
          </div>

          {/* Currency / Language selects */}
          <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
            {/* Language */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-wider">
                <Globe size={11} />
                {isRTL ? 'اللغة' : 'Language'}
              </label>
              <select
                value={language}
                onChange={handleLang}
                className="w-full bg-white border border-gray-200 text-xs rounded-lg px-2.5 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                           cursor-pointer hover:border-primary/50 transition-colors font-medium"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-wider">
                <DollarSign size={11} />
                {isRTL ? 'العملة' : 'Currency'}
              </label>
              <select
                value={currency.code}
                onChange={handleCurrency}
                className="w-full bg-white border border-gray-200 text-xs rounded-lg px-2.5 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                           cursor-pointer hover:border-primary/50 transition-colors font-medium"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
