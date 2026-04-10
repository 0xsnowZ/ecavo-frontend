import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Package, Truck, MapPin, ChevronRight } from 'lucide-react';
import { ordersService } from '../services';
import { useAuthStore } from '../store/useAuthStore';
import { useLocaleStore } from '../store/useLocaleStore';
import Spinner from '../components/ui/Spinner';

const STATUS_STEPS = [
  { status: 'placed',            icon: CheckCircle2, labelAr: 'تم الطلب',            labelEn: 'Order Placed' },
  { status: 'preparing',         icon: Package,      labelAr: 'يتم التجهيز',          labelEn: 'Preparing' },
  { status: 'awaiting_shipment', icon: Package,      labelAr: 'في انتظار الشحن',      labelEn: 'Awaiting Shipment' },
  { status: 'shipped',           icon: Truck,        labelAr: 'تم الشحن',             labelEn: 'Shipped' },
  { status: 'in_transit',        icon: Truck,        labelAr: 'في الطريق إليك',       labelEn: 'In Transit' },
  { status: 'delivered',         icon: CheckCircle2, labelAr: 'تم الاستلام',          labelEn: 'Delivered' },
];

export default function OrderConfirm() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { isAuthenticated } = useAuthStore();
  const { currency } = useLocaleStore();
  const fmt = (usd) => `${currency.symbol}${(usd * currency.rate).toFixed(2)}`;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    ordersService.detail(id)
      .then(r => setOrder(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="container-main py-12 max-w-2xl mx-auto">
      {/* Success banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-500 mb-4 animate-fade-in">
          <CheckCircle2 size={44} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-black text-secondary">
          {isAr ? '🎉 تم تقديم طلبك بنجاح!' : '🎉 Order Placed Successfully!'}
        </h1>
        <p className="text-muted text-sm mt-2">
          {isAr
            ? `رقم الطلب: #${id} — سيتم التواصل معك قريباً.`
            : `Order #${id} — We'll contact you shortly.`}
        </p>
      </div>

      {/* Status timeline */}
      <div className="card p-6 mb-5">
        <h2 className="font-bold text-secondary mb-6">{isAr ? 'حالة الطلب' : 'Order Status'}</h2>
        <div className="flex items-start justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 start-0 end-0 h-0.5 bg-gray-200 z-0" />
          <div
            className="absolute top-5 start-0 h-0.5 bg-primary z-0 transition-all duration-700"
            style={{ width: '0%' }}
          />
          {STATUS_STEPS.map(({ icon: Icon, labelAr, labelEn }, i) => (
            <div key={i} className="flex flex-col items-center gap-2 z-10 flex-1">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                ${i === 0 ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                <Icon size={18} />
              </div>
              <span className="text-[10px] text-center text-muted leading-tight max-w-14">
                {isAr ? labelAr : labelEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order items (if authenticated) */}
      {order && (
        <div className="card p-6 mb-5">
          <h2 className="font-bold text-secondary mb-4">{isAr ? 'المنتجات' : 'Items'}</h2>
          <div className="space-y-3">
            {order.items?.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                {item.product?.images?.[0] && (
                  <img src={item.product.images[0]} className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1" alt="" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-dark">{item.product_name}</p>
                  <p className="text-xs text-muted">×{item.qty}</p>
                </div>
                <span className="text-sm font-bold text-primary">{fmt(item.total)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border space-y-1 text-sm">
            <div className="flex justify-between text-muted">
              <span>{t('cart.subtotal')}</span><span>{fmt(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>{t('cart.delivery')}</span><span>{fmt(order.delivery_fee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{isAr ? 'الخصم' : 'Discount'}</span><span>- {fmt(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-dark text-base pt-1 border-t border-border">
              <span>{t('cart.total')}</span>
              <span className="text-primary">{fmt(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/products" className="btn-primary flex-1 justify-center py-3">
          {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
        </Link>
        {isAuthenticated && (
          <Link to={`/orders/${id}/track`} className="btn-outline flex-1 justify-center py-3">
            <Truck size={18} />
            {isAr ? 'تتبع الطلب' : 'Track Order'}
          </Link>
        )}
      </div>
    </div>
  );
}
