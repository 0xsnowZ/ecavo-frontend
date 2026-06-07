import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Store,
  Star,
  Bell,
  LogOut,
  Moon,
  Sun,
  Menu,
  X as XIcon,
  Ticket,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import useThemeStore from "../store/useThemeStore";
import { useLocaleStore } from "../store/useLocaleStore";
import ToastProvider from "../components/ui/ToastProvider";
import { adminNotificationsService } from "../services";

const adminLinks = [
  {
    to: "/admin",
    icon: LayoutDashboard,
    labelKey: "admin.dashboard",
    end: true,
  },
  { to: "/admin/orders", icon: ShoppingCart, labelKey: "admin.all_orders" },
  { to: "/admin/products", icon: Package, labelKey: "admin.add_product" },
  { to: "/admin/categories", icon: Tag, labelKey: "common.categories" },
  { to: "/admin/coupons", icon: Ticket, labelKey: "admin.coupons" },
  { to: "/admin/reviews", icon: Star, labelKey: "admin.reviews" },
  { to: "/admin/banners", icon: ImageIcon, labelKey: "admin.banners" },
  { to: "/", icon: Store, labelKey: "admin.store" },
];

const PAGE_TITLES = {
  "/admin": { ar: "لوحة التحكم", en: "Dashboard", fr: "Tableau de Bord" },
  "/admin/orders": { ar: "إدارة الطلبات", en: "Orders", fr: "Commandes" },
  "/admin/products": { ar: "إدارة المنتجات", en: "Products", fr: "Produits" },
  "/admin/categories": { ar: "إدارة الأقسام", en: "Categories", fr: "Catégories" },
  "/admin/coupons": { ar: "إدارة الكوبونات", en: "Coupons", fr: "Coupons" },
  "/admin/reviews": { ar: "التقييمات", en: "Reviews", fr: "Avis" },
  "/admin/banners": { ar: "البنرات الإعلانية", en: "Banners", fr: "Bannières" },
};

const formatTimeAgo = (dateString, lang) => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return lang === "ar" ? "منذ أكثر من سنة" : lang === "fr" ? "il y a plus d'un an" : "more than a year ago";
  interval = seconds / 2592000;
  if (interval > 1) return lang === "ar" ? `منذ ${Math.floor(interval)} شهر` : lang === "fr" ? `il y a ${Math.floor(interval)} mois` : `${Math.floor(interval)} months ago`;
  interval = seconds / 86400;
  if (interval > 1) return lang === "ar" ? `منذ ${Math.floor(interval)} يوم` : lang === "fr" ? `il y a ${Math.floor(interval)} jours` : `${Math.floor(interval)} days ago`;
  interval = seconds / 3600;
  if (interval > 1) return lang === "ar" ? `منذ ${Math.floor(interval)} ساعة` : lang === "fr" ? `il y a ${Math.floor(interval)} heures` : `${Math.floor(interval)} hours ago`;
  interval = seconds / 60;
  if (interval > 1) return lang === "ar" ? `منذ ${Math.floor(interval)} دقيقة` : lang === "fr" ? `il y a ${Math.floor(interval)} min` : `${Math.floor(interval)} mins ago`;
  return lang === "ar" ? "الآن" : lang === "fr" ? "à l'instant" : "just now";
};

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const { language } = useLocaleStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isAr = language === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await adminNotificationsService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pageTitle = PAGE_TITLES[location.pathname];
  const titleText = pageTitle ? pageTitle[language] || pageTitle.en : "";

  /* ── Colour tokens ────────────────────────────────────────
     All surfaces are expressed as dark:/light: Tailwind pairs.
     The `dark` class lives ONLY on this root div — never on <html>.
  ─────────────────────────────────────────────────────────── */
  return (
    <div
      className={`${dark ? "dark" : ""} flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300`}
    >
      {/* ── Mobile overlay ──────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside
        className={`
          w-64 shrink-0 flex flex-col fixed top-0 start-0 h-full z-40 shadow-2xl lg:shadow-none
          bg-white dark:bg-gray-900
          border-e border-gray-200 dark:border-gray-800
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileMenuOpen 
            ? "translate-x-0" 
            : isAr ? "translate-x-full" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <a
            href="/admin"
            className="text-2xl font-black text-gray-900 dark:text-white"
          >
            E<span className="text-primary">CAVO</span>
          </a>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {isAr ? "لوحة التحكم" : "Admin Panel"}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminLinks.map(({ to, icon: LinkIcon, labelKey, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                 ${isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              <LinkIcon size={18} />
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
              {dark ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon
                  size={18}
                  className="text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white"
                />
              )}
              <span>
                {dark
                  ? isAr
                    ? "الوضع الفاتح"
                    : "Light Mode"
                  : isAr
                    ? "الوضع الداكن"
                    : "Dark Mode"}
              </span>
            </span>

            {/* Animated pill */}
            <span
              className={`relative w-10 h-5 rounded-full transition-colors duration-300
                              ${dark ? "bg-primary" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300
                                ${dark ? "left-5" : "left-0.5"}`}
              />
            </span>
          </button>

          {/* User card */}
          <div className="flex items-center gap-3 px-1">
            <div
              className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center
                            text-primary font-bold text-sm shrink-0"
            >
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.name ?? "Admin"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
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
            {isAr ? "تسجيل الخروج" : "Log out"}
          </button>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────── */}
      <div className="flex-1 lg:ms-64 flex flex-col w-full">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-3
                           bg-white dark:bg-gray-900
                           border-b border-gray-200 dark:border-gray-800
                           transition-colors duration-300"
        >
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400
                       hover:bg-gray-100 dark:hover:bg-gray-800
                       hover:text-gray-900 dark:hover:text-white transition-all"
          >
            {mobileMenuOpen ? <XIcon size={20} /> : <Menu size={20} />}
          </button>

          <h1 className="text-base font-bold text-gray-900 dark:text-white">
            {titleText}
          </h1>

          <div className="flex items-center gap-2">
            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400
                           hover:bg-gray-100 dark:hover:bg-gray-800
                           hover:text-gray-900 dark:hover:text-white transition-all"
              >
                <Bell size={20} />
                {notifications.filter(n => !n.read_at).length > 0 && (
                  <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute end-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-slide-down">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {t("admin.notifications") || (isAr ? "الإشعارات" : "Notifications")}
                    </h3>
                    <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold tracking-wide">
                      {notifications.filter(n => !n.read_at).length} {isAr ? "جديد" : "New"}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                        {isAr ? "لا توجد إشعارات جديدة" : "No new notifications"}
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const isRead = !!notification.read_at;

                        return (
                          <div
                            key={notification.id}
                            onClick={async () => {
                              if (!isRead) {
                                await adminNotificationsService.markAsRead(notification.id);
                                fetchNotifications();
                              }
                              navigate(`/admin/orders`);
                            }}
                            className={`p-4 transition-colors cursor-pointer relative ${isRead ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                          >
                            {!isRead && (
                              <div className="absolute top-5 start-4 w-2 h-2 bg-primary rounded-full" />
                            )}
                            <div className="ms-5">
                              <p className={`text-sm font-semibold mb-0.5 ${isRead ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>
                                {isAr ? notification.data.message_ar : notification.data.message_en}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                {isAr ? notification.data.desc_ar : notification.data.desc_en}
                              </p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-bold uppercase tracking-wider">
                                {formatTimeAgo(notification.created_at, language)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await adminNotificationsService.markAsRead('all');
                        await fetchNotifications();
                        setShowNotifications(false);
                      }}
                      className="w-full text-center text-xs font-bold text-primary hover:text-primary-hover transition-colors py-2 rounded-lg hover:bg-primary/5"
                    >
                      {isAr ? "مسح كل الإشعارات" : "Clear all notifications"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <ToastProvider />
    </div>
  );
}
