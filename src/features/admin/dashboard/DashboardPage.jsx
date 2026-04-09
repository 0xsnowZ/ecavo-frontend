import { useTranslation } from 'react-i18next';
import { ShoppingCart, CheckCircle, Package, Truck, MapPin, PhoneOff, Clock, AlertCircle, XCircle, RotateCcw, TrendingUp } from 'lucide-react';

const STATS = [
  { icon: ShoppingCart, labelKey: 'admin.all_orders', count: 480, color: 'bg-primary/10 text-primary', active: true },
  { icon: CheckCircle, labelKey: 'orders.status_placed', count: 180, color: 'bg-green-100 text-green-600' },
  { icon: Package, labelKey: 'orders.status_preparing', count: 64, color: 'bg-blue-100 text-blue-600' },
  { icon: Truck, labelKey: 'orders.status_awaiting_ship', count: 38, color: 'bg-yellow-100 text-yellow-600' },
  { icon: TrendingUp, labelKey: 'orders.status_shipped', count: 90, color: 'bg-purple-100 text-purple-600' },
  { icon: Truck, labelKey: 'orders.status_in_transit', count: 45, color: 'bg-indigo-100 text-indigo-600' },
  { icon: CheckCircle, labelKey: 'orders.status_delivered', count: 220, color: 'bg-emerald-100 text-emerald-600' },
  { icon: PhoneOff, labelKey: 'orders.status_no_answer', count: 12, color: 'bg-orange-100 text-orange-600' },
  { icon: Clock, labelKey: 'orders.status_postponed', count: 8, color: 'bg-gray-100 text-gray-600' },
  { icon: MapPin, labelKey: 'orders.status_wrong_address', count: 5, color: 'bg-red-100 text-red-500' },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-secondary">{t('admin.dashboard')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map(({ icon: Icon, labelKey, count, color, active }) => (
          <div key={labelKey} className={`card p-4 cursor-pointer hover:shadow-hover transition-shadow ${active ? 'ring-2 ring-primary' : ''}`}>
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-black text-dark">{count}</p>
            <p className="text-xs text-muted mt-0.5">{t(labelKey)}</p>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h3 className="font-bold text-secondary mb-4">Recent Orders</h3>
        <p className="text-muted text-sm">Full orders table with search, filters, edit & detail modals — Sprint 4</p>
      </div>
    </div>
  );
}
