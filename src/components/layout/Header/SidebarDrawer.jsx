import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DEPARTMENTS = [
  { label: 'sidebar.home_appliances', to: '/categories/appliances' },
  { label: 'sidebar.toys', to: '/categories/toys' },
  { label: 'sidebar.chargers', to: '/categories/chargers' },
  { label: 'sidebar.furniture', to: '/categories/furniture' },
  { label: 'sidebar.phones', to: '/categories/mobiles' },
  { label: 'sidebar.clothes', to: '/categories/clothes' },
  { label: 'sidebar.shoes', to: '/categories/shoes' },
  { label: 'sidebar.accessories', to: '/categories/accessories' },
  { label: 'sidebar.beauty', to: '/categories/beauty' },
  { label: 'sidebar.tvs', to: '/categories/tvs' },
];

export default function SidebarDrawer({ open, onClose }) {
  const { t } = useTranslation();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 start-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-smooth
                    ${open ? 'translate-x-0' : '-translate-x-full'}`}
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
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-muted hover:text-dark transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-1">
          {DEPARTMENTS.map(({ label, to }) => (
            <NavLink
              key={to}
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
