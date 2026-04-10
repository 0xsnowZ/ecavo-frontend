import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, ShoppingCart, Package, Tag,
  Store, Bell, LogOut, Moon, Sun,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { useLocaleStore } from '../store/useLocaleStore';

const adminLinks = [
  { to: '/admin',            icon: LayoutDashboard, labelKey: 'admin.dashboard',  end: true },
  { to: '/admin/orders',     icon: ShoppingCart,    labelKey: 'admin.all_orders' },
  { to: '/admin/products',   icon: Package,         labelKey: 'admin.add_product' },
  { to: '/admin/categories', icon: Tag,             labelKey: 'common.categories' },
  { to: '/',                 icon: Store,           labelKey: 'admin.store' },
];

const PAGE_TITLES = {
  '/admin':            { ar: 'لوحة التحكم',    en: 'Dashboard', fr: 'Tableau de Bord' },
  '/admin/orders':     { ar: 'إدارة الطلبات',  en: 'Orders', fr: 'Commandes' },
  '/admin/products':   { ar: 'إدارة المنتجات', en: 'Products', fr: 'Produits' },
  '/admin/categories': { ar: 'إدارة الأقسام',  en: 'Categories', fr: 'Catégories' },
};

export default function AdminLayout() {
  const { t, i18n }                          = useTranslation();
  const { user, logout }                     = useAuthStore();
  const { dark, toggle }                     = useThemeStore();
  const { language } = useLocaleStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isAr      = language === 'ar';

  const handleLogout = () => { logout(); navigate('/login'); };

  const pageTitle = PAGE_TITLES[location.pathname];
  const titleText = pageTitle ? (pageTitle[language] || pageTitle.en) : '';

  /* ── Colour tokens ────────────────────────────────────────
     All surfaces are expressed as dark:/light: Tailwind pairs.
     The `dark` class lives ONLY on this root div — never on <html>.
  ─────────────────────────────────────────────────────────── */
  return (
    <div className={`${dark ? 'dark' : ''} flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300`}>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="w-64 shrink-0 flex flex-col fixed h-full z-30
                        bg-white dark:bg-gray-900
                        border-e border-gray-200 dark:border-gray-800
                        transition-colors duration-300">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <a href="/admin" className="text-2xl font-black text-gray-900 dark:text-white">
            E<span className="text-primary">CAVO</span>
          </a>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {isAr ? 'لوحة التحكم' : 'Admin Panel'}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminLinks.map(({ to, icon: Icon, labelKey, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-primary text-white shadow-sm'
                   : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                 }`
              }
            >
              <Icon size={18} />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Dark toggle + user + logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">

          {/* Dark/Light toggle */}
          <button
            type="button"
            onClick={toggle}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium
                       text-gray-600 dark:text-gray-400
                       hover:bg-gray-100 dark:hover:bg-gray-800
                       hover:text-gray-900 dark:hover:text-white
                       transition-all group"
          >
            <span className="flex items-center gap-3">
              {dark
                ? <Sun  size={18} className="text-yellow-400" />
                : <Moon size={18} className="text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white" />
              }
              <span>
                {dark
                  ? (isAr ? 'الوضع الفاتح'  : 'Light Mode')
                  : (isAr ? 'الوضع الداكن' : 'Dark Mode')
                }
              </span>
            </span>

            {/* Animated pill */}
            <span className={`relative w-10 h-5 rounded-full transition-colors duration-300
                              ${dark ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300
                                ${dark ? 'left-5' : 'left-0.5'}`}
              />
            </span>
          </button>

          {/* User card */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center
                            text-primary font-bold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-1 text-sm text-gray-500 dark:text-gray-400
                       hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={15} />
            {isAr ? 'تسجيل الخروج' : 'Log out'}
          </button>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────── */}
      <div className="flex-1 ms-64 flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3
                           bg-white dark:bg-gray-900
                           border-b border-gray-200 dark:border-gray-800
                           transition-colors duration-300">

          <h1 className="text-base font-bold text-gray-900 dark:text-white">{titleText}</h1>

          <div className="flex items-center gap-2">


            {/* Bell */}
            <button
              type="button"
              className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800
                         hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
