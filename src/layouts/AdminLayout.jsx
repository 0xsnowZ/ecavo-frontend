import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Users,
  BarChart2,
  Store,
  Bell,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, labelKey: 'admin.dashboard', end: true },
  { to: '/admin/orders', icon: ShoppingCart, labelKey: 'admin.all_orders' },
  { to: '/admin/products', icon: Package, labelKey: 'admin.add_product' },
  { to: '/admin/categories', icon: Tag, labelKey: 'common.categories' },
  { to: '/', icon: Store, labelKey: 'admin.store' },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-nav flex flex-col fixed h-full z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <a href="/admin" className="text-2xl font-black text-secondary">
            E<span className="text-primary">CAVO</span>
          </a>
          <p className="text-xs text-muted mt-0.5">{t('admin.dashboard')}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {adminLinks.map(({ to, icon: Icon, labelKey, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.[0] ?? 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-dark">{user?.name ?? 'Admin'}</p>
              <p className="text-xs text-muted">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            {t('auth.login')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ms-64">
        {/* Top bar */}
        <header className="bg-white shadow-nav px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-lg font-bold text-secondary">{t('admin.dashboard')}</h1>
          <div className="flex items-center gap-3">
            <button className="relative text-muted hover:text-dark transition-colors p-2 rounded-lg hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute top-1 end-1 w-2 h-2 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
