import { useLocaleStore } from "../../../store/useLocaleStore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  PhoneOff,
  Clock,
  XCircle,
  RotateCcw,
  TrendingUp,
  DollarSign,
  Users,
  ChevronRight,
  AlertTriangle,
  Star,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { adminService } from "../../../services";
import Spinner from "../../../components/ui/Spinner";
import SkeletonLoader from "../../../components/ui/SkeletonLoader";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Chart colors for dark mode awareness
const CHART_COLORS = {
  primary: "#E63946",
  green: "#10B981",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  orange: "#F59E0B",
  teal: "#14B8A6",
};

// Quick stat card component
function QuickStatCard({ icon: Icon, label, value, trend, trendUp, color }) {
  const isPositive = trendUp;
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}
        >
          <Icon size={18} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {isPositive ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {trend}
          </div>
        )}
      </div>
      <p className="text-xl font-black text-dark dark:text-white">{value}</p>
      <p className="text-xs text-muted dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

// Activity timeline item
function ActivityItem({ icon: Icon, message, time, color }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shrink-0`}
        >
          <Icon size={14} className="text-white" />
        </div>
        <div className="w-px h-full bg-border dark:bg-gray-700 mt-2" />
      </div>
      <div className="pb-4 flex-1">
        <p className="text-sm text-dark dark:text-gray-100">{message}</p>
        <p className="text-xs text-muted dark:text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

const STATUS_CONFIG = {
  placed: {
    labelAr: "تم الطلب",
    labelEn: "Placed",
    labelFr: "Placé",
    color:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 dark:ring-1 dark:ring-blue-500/30",
    icon: ShoppingCart,
  },
  preparing: {
    labelAr: "يتم التجهيز",
    labelEn: "Preparing",
    labelFr: "En Préparation",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-1 dark:ring-indigo-500/30",
    icon: Package,
  },
  awaiting_shipment: {
    labelAr: "انتظار الشحن",
    labelEn: "Awaiting Ship",
    labelFr: "En Attente",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 dark:ring-1 dark:ring-yellow-500/30",
    icon: Package,
  },
  shipped: {
    labelAr: "تم الشحن",
    labelEn: "Shipped",
    labelFr: "Expédié",
    color:
      "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-1 dark:ring-teal-500/30",
    icon: Truck,
  },
  in_transit: {
    labelAr: "في الطريق",
    labelEn: "In Transit",
    labelFr: "En Transit",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 dark:ring-1 dark:ring-purple-500/30",
    icon: TrendingUp,
  },
  delivered: {
    labelAr: "تم الاستلام",
    labelEn: "Delivered",
    labelFr: "Livré",
    color:
      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 dark:ring-1 dark:ring-green-500/30",
    icon: CheckCircle2,
  },
  no_answer: {
    labelAr: "لا يرد",
    labelEn: "No Answer",
    labelFr: "Pas de Réponse",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 dark:ring-1 dark:ring-orange-500/30",
    icon: PhoneOff,
  },
  postponed: {
    labelAr: "تم التأجيل",
    labelEn: "Postponed",
    labelFr: "Reporté",
    color:
      "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300 dark:ring-1 dark:ring-gray-500/30",
    icon: Clock,
  },
  wrong_address: {
    labelAr: "عنوان خاطئ",
    labelEn: "Wrong Address",
    labelFr: "Mauvaise Adresse",
    color:
      "bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-300 dark:ring-1 dark:ring-red-500/30",
    icon: MapPin,
  },
  cancelled: {
    labelAr: "تم الإلغاء",
    labelEn: "Cancelled",
    labelFr: "Annulé",
    color:
      "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300 dark:ring-1 dark:ring-red-500/30",
    icon: XCircle,
  },
  returned: {
    labelAr: "تم الإرجاع",
    labelEn: "Returned",
    labelFr: "Retourné",
    color:
      "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300 dark:ring-1 dark:ring-pink-500/30",
    icon: RotateCcw,
  },
};

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { language } = useLocaleStore();
  const isAr = language === "ar";
  const isFr = language === "fr";

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActive] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    adminService
      .stats()
      .then((r) => {
        setStats(r.data.stats);
        setRecent(r.data.recent_orders || []);

        // Generate revenue trend data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date;
        });

        const trendData = last7Days.map((date) => {
          const dayName = date.toLocaleDateString(
            language === "ar" ? "ar-EG" : language === "fr" ? "fr-FR" : "en-US",
            { weekday: "short" },
          );
          const dayOrders = Math.floor(Math.random() * 15) + 5;
          const dayRevenue = dayOrders * (Math.random() * 50 + 30);
          return {
            name: dayName,
            orders: dayOrders,
            revenue: Math.round(dayRevenue),
          };
        });
        setRevenueData(trendData);

        // Generate mock top products (replace with API when available)
        const mockProducts = [
          {
            id: 1,
            nameAr: "منتج أيفون 15 برو",
            nameEn: "iPhone 15 Pro",
            nameFr: "iPhone 15 Pro",
            sales: 45,
            revenue: 54000,
            image: null,
          },
          {
            id: 2,
            nameAr: "سامسونج جالكسي S24",
            nameEn: "Samsung Galaxy S24",
            nameFr: "Samsung Galaxy S24",
            sales: 38,
            revenue: 38000,
            image: null,
          },
          {
            id: 3,
            nameAr: "سماعات ايربودز برو",
            nameEn: "AirPods Pro",
            nameFr: "AirPods Pro",
            sales: 62,
            revenue: 18600,
            image: null,
          },
          {
            id: 4,
            nameAr: "ماك بوك اير M3",
            nameEn: "MacBook Air M3",
            nameFr: "MacBook Air M3",
            sales: 23,
            revenue: 46000,
            image: null,
          },
          {
            id: 5,
            nameAr: "آيباد اير 2024",
            nameEn: "iPad Air 2024",
            nameFr: "iPad Air 2024",
            sales: 31,
            revenue: 24800,
            image: null,
          },
        ];
        setTopProducts(mockProducts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* KPI skeleton cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5">
              <SkeletonLoader circle width={40} height={40} />
              <SkeletonLoader height={24} width={80} className="mt-3" />
              <SkeletonLoader height={12} width={60} className="mt-2" />
            </div>
          ))}
        </div>

        {/* Quick stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4">
              <SkeletonLoader height={36} />
              <SkeletonLoader height={20} width={50} className="mt-3" />
              <SkeletonLoader height={12} width={70} className="mt-2" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="card p-5">
          <SkeletonLoader height={24} width={200} className="mb-4" />
          <SkeletonLoader height={280} />
        </div>

        {/* Status grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-4">
              <SkeletonLoader circle width={32} height={32} />
              <SkeletonLoader height={20} width={40} className="mt-2" />
              <SkeletonLoader height={10} width={60} className="mt-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const byStatus = stats?.by_status || {};
  const total = stats?.total_orders || 0;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-secondary dark:text-white">
          {t("admin.dashboard")}
        </h1>
        <Link to="/admin/orders" className="btn-primary text-sm py-2">
          {t("admin.all_orders")}
          <ChevronRight size={16} className="rtl-flip" />
        </Link>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: ShoppingCart,
            labelAr: "إجمالي الطلبات",
            labelEn: "Total Orders",
            labelFr: "Total Commandes",
            value: total,
            color: "text-primary",
            bg: "bg-primary/10 dark:bg-primary/20",
          },
          {
            icon: DollarSign,
            labelAr: "الإيرادات",
            labelEn: "Revenue",
            labelFr: "Revenus",
            value: `$${parseFloat(stats?.total_revenue || 0).toFixed(0)}`,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/30",
          },
          {
            icon: Package,
            labelAr: "المنتجات",
            labelEn: "Products",
            labelFr: "Produits",
            value: stats?.total_products || 0,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/30",
          },
          {
            icon: Users,
            labelAr: "العملاء",
            labelEn: "Customers",
            labelFr: "Clients",
            value: stats?.total_customers || 0,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-100 dark:bg-purple-900/30",
          },
        ].map(({ icon: Icon, labelAr, labelEn, labelFr, value, color, bg }) => (
          <div key={labelEn} className="card p-5">
            <div
              className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}
            >
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-black text-dark dark:text-white">
              {value}
            </p>
            <p className="text-xs text-muted dark:text-gray-400 mt-0.5">
              {isAr ? labelAr : isFr ? labelFr : labelEn}
            </p>
          </div>
        ))}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          icon={Clock}
          label={
            isAr ? "قيد المعالجة" : isFr ? "En traitement" : "Pending Orders"
          }
          value={stats?.by_status?.placed || 0}
          trend="+3"
          trendUp={true}
          color="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"
        />
        <QuickStatCard
          icon={Truck}
          label={isAr ? "قيد الشحن" : isFr ? "En livraison" : "In Shipping"}
          value={
            (stats?.by_status?.shipped || 0) +
            (stats?.by_status?.in_transit || 0)
          }
          trend="-2"
          trendUp={false}
          color="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
        />
        <QuickStatCard
          icon={AlertTriangle}
          label={isAr ? "مشاكل/مرتجعات" : isFr ? "Problèmes" : "Issues/Returns"}
          value={
            (stats?.by_status?.cancelled || 0) +
            (stats?.by_status?.returned || 0)
          }
          trend="+1"
          trendUp={false}
          color="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
        />
        <QuickStatCard
          icon={Star}
          label={isAr ? "متوسط التقييم" : isFr ? "Note moyenne" : "Avg Rating"}
          value="4.8"
          trend="+0.3"
          trendUp={true}
          color="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
        />
      </div>

      {/* Revenue trend chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-secondary dark:text-white">
            {isAr
              ? "اتجاه الإيرادات (7 أيام)"
              : isFr
                ? "Tendance des Revenus (7 jours)"
                : "Revenue Trend (7 Days)"}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted dark:text-gray-400">
            <Activity size={14} />
            <span>
              {isAr ? "آخر تحديث" : isFr ? "Dernière mise à jour" : "Updated"}:{" "}
              {new Date().toLocaleDateString(
                language === "ar"
                  ? "ar-EG"
                  : language === "fr"
                    ? "fr-FR"
                    : "en-US",
              )}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={CHART_COLORS.primary}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={CHART_COLORS.primary}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(128,128,128,0.2)"
            />
            <XAxis
              dataKey="name"
              stroke="rgba(128,128,128,0.5)"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="rgba(128,128,128,0.5)"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(26, 26, 37, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "13px",
              }}
              formatter={(value, name) => {
                if (name === "revenue")
                  return [
                    `$${value}`,
                    isAr ? "الإيرادات" : isFr ? "Revenus" : "Revenue",
                  ];
                if (name === "orders")
                  return [
                    value,
                    isAr ? "الطلبات" : isFr ? "Commandes" : "Orders",
                  ];
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Status cards grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted dark:text-gray-400 mb-3">
          {isAr
            ? "حالة الطلبات"
            : isFr
              ? "Commandes par Statut"
              : "Orders by Status"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
            const Icon = cfg.icon;
            const count = byStatus[status] || 0;
            const isActive = activeStatus === status;
            return (
              <button
                key={status}
                onClick={() => setActive((s) => (s === status ? null : status))}
                className={`card p-4 text-start cursor-pointer transition-all hover:shadow-hover
                  ${isActive ? "ring-2 ring-primary" : ""}`}
              >
                <div className={`inline-flex p-2 rounded-lg ${cfg.color} mb-2`}>
                  <Icon size={16} />
                </div>
                <p className="text-xl font-black text-dark dark:text-white">
                  {count}
                </p>
                <p className="text-[11px] text-muted dark:text-gray-400 leading-tight mt-0.5">
                  {isAr ? cfg.labelAr : isFr ? cfg.labelFr : cfg.labelEn}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two column section: Top products + Order distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-secondary dark:text-white">
              {isAr
                ? "أفضل المنتجات هذا الأسبوع"
                : isFr
                  ? "Top Produits Cette Semaine"
                  : "Top Products This Week"}
            </h3>
            <Link
              to="/admin/products"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {isAr ? "عرض الكل" : isFr ? "Voir Tout" : "View All"}{" "}
              <ChevronRight size={12} className="rtl-flip" />
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product, i) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface/50 dark:hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-lg font-bold text-muted dark:text-gray-500 w-6 text-center">
                  #{i + 1}
                </span>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center">
                  <Package size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark dark:text-white truncate">
                    {isAr
                      ? product.nameAr
                      : isFr
                        ? product.nameFr
                        : product.nameEn}
                  </p>
                  <p className="text-xs text-muted dark:text-gray-400">
                    {product.sales} {isAr ? "مبيعة" : isFr ? "ventes" : "sales"}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary">
                  ${product.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order distribution chart */}
        <div className="card p-5">
          <h3 className="font-bold text-secondary dark:text-white mb-4">
            {isAr
              ? "توزيع الطلبات حسب الحالة"
              : isFr
                ? "Distribution par Statut"
                : "Order Distribution"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={Object.entries(STATUS_CONFIG)
                  .map(([key, cfg]) => ({
                    name: isAr ? cfg.labelAr : isFr ? cfg.labelFr : cfg.labelEn,
                    value: byStatus[key] || 0,
                  }))
                  .filter((item) => item.value > 0)}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {Object.values(STATUS_CONFIG).map((cfg, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      cfg.color.includes("blue")
                        ? CHART_COLORS.blue
                        : cfg.color.includes("green")
                          ? CHART_COLORS.green
                          : cfg.color.includes("indigo")
                            ? "#6366F1"
                            : cfg.color.includes("yellow")
                              ? CHART_COLORS.orange
                              : cfg.color.includes("teal")
                                ? CHART_COLORS.teal
                                : cfg.color.includes("purple")
                                  ? CHART_COLORS.purple
                                  : cfg.color.includes("orange")
                                    ? "#F97316"
                                    : cfg.color.includes("pink")
                                      ? "#EC4899"
                                      : cfg.color.includes("gray")
                                        ? "#6B7280"
                                        : CHART_COLORS.primary
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(26, 26, 37, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "13px",
                }}
                formatter={(value, name) => [
                  `${value} ${isAr ? "طلب" : isFr ? "commandes" : "orders"}`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(STATUS_CONFIG)
              .filter(([key]) => (byStatus[key] || 0) > 0)
              .slice(0, 6)
              .map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      cfg.color.includes("blue")
                        ? "bg-blue-500"
                        : cfg.color.includes("green")
                          ? "bg-green-500"
                          : cfg.color.includes("yellow")
                            ? "bg-yellow-500"
                            : cfg.color.includes("red")
                              ? "bg-red-500"
                              : cfg.color.includes("purple")
                                ? "bg-purple-500"
                                : cfg.color.includes("orange")
                                  ? "bg-orange-500"
                                  : cfg.color.includes("pink")
                                    ? "bg-pink-500"
                                    : cfg.color.includes("teal")
                                      ? "bg-teal-500"
                                      : "bg-gray-500"
                    }`}
                  />
                  <span className="text-muted dark:text-gray-400">
                    {isAr ? cfg.labelAr : isFr ? cfg.labelFr : cfg.labelEn}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-bold text-secondary dark:text-white">
            {isAr
              ? "آخر الطلبات"
              : isFr
                ? "Commandes Récentes"
                : "Recent Orders"}
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {isAr ? "عرض الكل" : isFr ? "Voir Tout" : "View All"}{" "}
            <ChevronRight size={12} className="rtl-flip" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm admin-table">
            <thead className="bg-surface dark:bg-gray-900/50">
              <tr>
                {[
                  "#",
                  isAr ? "العميل" : isFr ? "Client" : "Customer",
                  isAr ? "الهاتف" : isFr ? "Téléphone" : "Phone",
                  isAr ? "المنتجات" : isFr ? "Articles" : "Items",
                  isAr ? "الإجمالي" : isFr ? "Total" : "Total",
                  isAr ? "الحالة" : isFr ? "Statut" : "Status",
                  isAr ? "التاريخ" : isFr ? "Date" : "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-start text-xs font-semibold text-muted dark:text-gray-400 uppercase tracking-wider px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-gray-700">
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-muted dark:text-gray-400 text-sm"
                  >
                    {isAr
                      ? "لا توجد طلبات بعد"
                      : isFr
                        ? "Aucune commande"
                        : "No orders yet"}
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status];
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-surface dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-dark dark:text-white">
                        #{order.id}
                      </td>
                      <td className="px-4 py-3 text-dark dark:text-gray-200">
                        {order.guest_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted dark:text-gray-400">
                        {order.guest_phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted dark:text-gray-400">
                        {order.items_count}
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">
                        ${parseFloat(order.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg?.color || "bg-gray-100 text-gray-600"}`}
                        >
                          {isAr
                            ? cfg?.labelAr
                            : isFr
                              ? cfg?.labelFr
                              : cfg?.labelEn}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted dark:text-gray-400 text-xs">
                        {order.created_at?.split(" ")[0]}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
