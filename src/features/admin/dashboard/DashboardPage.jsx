import { useLocaleStore } from '../../../store/useLocaleStore';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, CheckCircle2, Package, Truck, MapPin,
  PhoneOff, Clock, XCircle, RotateCcw, TrendingUp,
  DollarSign, Users, ChevronRight,
} from 'lucide-react';
import { adminService } from '../../../services';
import Spinner from '../../../components/ui/Spinner';

const STATUS_CONFIG = {
  placed: { labelAr: 'تم الطلب', labelEn: 'Placed', labelFr: 'Placé', color: 'bg-blue-100 text-blue-700', icon: ShoppingCart },
  preparing: { labelAr: 'يتم التجهيز', labelEn: 'Preparing', labelFr: 'En Préparation', color: 'bg-indigo-100 text-indigo-700', icon: Package },
  awaiting_shipment: { labelAr: 'انتظار الشحن', labelEn: 'Awaiting Ship', labelFr: 'En Attente', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  shipped: { labelAr: 'تم الشحن', labelEn: 'Shipped', labelFr: 'Expédié', color: 'bg-teal-100 text-teal-700', icon: Truck },
  in_transit: { labelAr: 'في الطريق', labelEn: 'In Transit', labelFr: 'En Transit', color: 'bg-purple-100 text-purple-700', icon: TrendingUp },
  delivered: { labelAr: 'تم الاستلام', labelEn: 'Delivered', labelFr: 'Livré', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  no_answer: { labelAr: 'لا يرد', labelEn: 'No Answer', labelFr: 'Pas de Réponse', color: 'bg-orange-100 text-orange-700', icon: PhoneOff },
  postponed: { labelAr: 'تم التأجيل', labelEn: 'Postponed', labelFr: 'Reporté', color: 'bg-gray-100 text-gray-600', icon: Clock },
  wrong_address: { labelAr: 'عنوان خاطئ', labelEn: 'Wrong Address', labelFr: 'Mauvaise Adresse', color: 'bg-red-100 text-red-500', icon: MapPin },
  cancelled: { labelAr: 'تم الإلغاء', labelEn: 'Cancelled', labelFr: 'Annulé', color: 'bg-red-100 text-red-600', icon: XCircle },
  returned: { labelAr: 'تم الإرجاع', labelEn: 'Returned', labelFr: 'Retourné', color: 'bg-pink-100 text-pink-700', icon: RotateCcw },
};

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { language } = useLocaleStore();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActive] = useState(null);

  useEffect(() => {
    adminService.stats()
      .then(r => {
        setStats(r.data.stats);
        setRecent(r.data.recent_orders || []);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const byStatus = stats?.by_status || {};
  const total = stats?.total_orders || 0;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-secondary">{t('admin.dashboard')}</h1>
        <Link to="/admin/orders" className="btn-primary text-sm py-2">
          {t('admin.all_orders')}
          <ChevronRight size={16} className="rtl-flip" />
        </Link>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ShoppingCart, labelAr: 'إجمالي الطلبات', labelEn: 'Total Orders', labelFr: 'Total Commandes', value: total, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: DollarSign, labelAr: 'الإيرادات', labelEn: 'Revenue', labelFr: 'Revenus', value: `$${parseFloat(stats?.total_revenue || 0).toFixed(0)}`, color: 'text-green-600', bg: 'bg-green-100' },
          { icon: Package, labelAr: 'المنتجات', labelEn: 'Products', labelFr: 'Produits', value: stats?.total_products || 0, color: 'text-blue-600', bg: 'bg-blue-100' },
          { icon: Users, labelAr: 'العملاء', labelEn: 'Customers', labelFr: 'Clients', value: stats?.total_customers || 0, color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map(({ icon: Icon, labelAr, labelEn, labelFr, value, color, bg }) => (
          <div key={labelEn} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-black text-dark">{value}</p>
            <p className="text-xs text-muted mt-0.5">{isAr ? labelAr : isFr ? labelFr : labelEn}</p>
          </div>
        ))}
      </div>

      {/* Status cards grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">
          {isAr ? 'حالة الطلبات' : isFr ? 'Commandes par Statut' : 'Orders by Status'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
            const Icon = cfg.icon;
            const count = byStatus[status] || 0;
            const isActive = activeStatus === status;
            return (
              <button
                key={status}
                onClick={() => setActive(s => s === status ? null : status)}
                className={`card p-4 text-start cursor-pointer transition-all hover:shadow-hover
                  ${isActive ? 'ring-2 ring-primary' : ''}`}
              >
                <div className={`inline-flex p-2 rounded-lg ${cfg.color} mb-2`}>
                  <Icon size={16} />
                </div>
                <p className="text-xl font-black text-dark">{count}</p>
                <p className="text-[11px] text-muted leading-tight mt-0.5">
                  {isAr ? cfg.labelAr : isFr ? cfg.labelFr : cfg.labelEn}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent orders table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-secondary">{isAr ? 'آخر الطلبات' : isFr ? 'Commandes Récentes' : 'Recent Orders'}</h2>
          <Link to="/admin/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
            {isAr ? 'عرض الكل' : isFr ? 'Voir Tout' : 'View All'} <ChevronRight size={12} className="rtl-flip" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                {['#', isAr ? 'العميل' : isFr ? 'Client' : 'Customer',
                  isAr ? 'الهاتف' : isFr ? 'Téléphone' : 'Phone',
                  isAr ? 'المنتجات' : isFr ? 'Articles' : 'Items',
                  isAr ? 'الإجمالي' : isFr ? 'Total' : 'Total',
                  isAr ? 'الحالة' : isFr ? 'Statut' : 'Status',
                  isAr ? 'التاريخ' : isFr ? 'Date' : 'Date'].map(h => (
                    <th key={h} className="text-start text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted text-sm">
                    {isAr ? 'لا توجد طلبات بعد' : isFr ? 'Aucune commande' : 'No orders yet'}
                  </td>
                </tr>
              ) : recentOrders.map(order => {
                const cfg = STATUS_CONFIG[order.status];
                return (
                  <tr key={order.id} className="hover:bg-surface transition-colors">
                    <td className="px-4 py-3 font-bold text-dark">#{order.id}</td>
                    <td className="px-4 py-3 text-dark">{order.guest_name || '—'}</td>
                    <td className="px-4 py-3 text-muted">{order.guest_phone || '—'}</td>
                    <td className="px-4 py-3 text-muted">{order.items_count}</td>
                    <td className="px-4 py-3 font-bold text-primary">${parseFloat(order.total).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg?.color || 'bg-gray-100 text-gray-600'}`}>
                        {isAr ? cfg?.labelAr : isFr ? cfg?.labelFr : cfg?.labelEn}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{order.created_at?.split(' ')[0]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
