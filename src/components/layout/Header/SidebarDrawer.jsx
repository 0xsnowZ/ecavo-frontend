import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

  // Physical slide: sidebar is anchored at start-0.
  // In LTR (start = left): close → -translate-x-full (push left off screen)
  // In RTL (start = right): close → translate-x-full  (push right off screen)
  const slideClass = open
    ? 'translate-x-0'
    : isRTL ? 'translate-x-full' : '-translate-x-full';

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
        className={`fixed top-0 start-0 h-full w-72 bg-white z-50 shadow-2xl
                    transform transition-all duration-300 ease-in-out
                    ${open
                      ? 'translate-x-0 visible'
                      : isRTL ? 'translate-x-full invisible' : '-translate-x-full invisible'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">
              {t('sidebar.shop_by')}
            </p>
            <a href="/" className="text-xl font-black text-secondary">
              E<span className="text-primary">CAVO</span>
            </a>
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
        <nav className="p-4 space-y-1 overflow-y-auto">
          {DEPARTMENTS.map(({ label, to }) => (
            <NavLink
              key={`${label}-${to}`}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-primary/10 text-primary'
                   : 'text-dark hover:bg-gray-100 hover:text-primary'
                 }`
              }
            >
              {t(label)}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
