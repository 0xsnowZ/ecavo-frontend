import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Phone, MapPin, FileText, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useLocaleStore } from '../store/useLocaleStore';
import { ordersService } from '../services';

// Payment method icons (placeholder)
const PAYMENT_METHODS = [
  { id: 'cod', labelAr: 'الدفع عند الاستلام', labelEn: 'Cash on Delivery', icon: '💵' },
];

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();

  const { items, getSubtotal, getTotal, deliveryFee, getDiscount, coupon, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { currency } = useLocaleStore();

  const fmt = (usd) => `${currency.symbol}${(usd * currency.rate).toFixed(2)}`;

  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', notes: '',
    coupon_code: coupon?.code || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name)    errs.name    = isAr ? 'الاسم مطلوب' : 'Name required';
    if (!form.phone)   errs.phone   = isAr ? 'الهاتف مطلوب' : 'Phone required';
    if (!form.address) errs.address = isAr ? 'العنوان مطلوب' : 'Address required';
    if (!form.city)    errs.city    = isAr ? 'المدينة مطلوبة' : 'City required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const res = await ordersService.checkout(form);
      const orderId = res.data.order?.id;
      clearCart();
      navigate(`/order-confirm/${orderId}`);
    } catch (err) {
      const msg = err.response?.data?.message
        || (isAr ? 'حدث خطأ أثناء إتمام الطلب' : 'Checkout failed, please try again');
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return (
    <div className="container-main py-24 text-center">
      <p className="text-xl text-muted mb-4">{isAr ? 'السلة فارغة' : 'Your cart is empty'}</p>
      <Link to="/products" className="btn-primary">{isAr ? 'تسوق الآن' : 'Shop Now'}</Link>
    </div>
  );

  return (
    <div className="container-main py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">{t('nav.home')}</Link>
        <ChevronRight size={12} className="rtl-flip" />
        <Link to="/cart" className="hover:text-primary">{t('cart.title')}</Link>
        <ChevronRight size={12} className="rtl-flip" />
        <span className="text-dark">{t('checkout.title')}</span>
      </nav>

      <h1 className="text-2xl font-bold text-secondary mb-6">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left: Shipping + Payment ── */}
          <div className="flex-1 space-y-5">

            {/* Shipping details card */}
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-secondary flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                {isAr ? 'تفاصيل الشحن' : 'Shipping Details'}
              </h2>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">{t('checkout.name')}</label>
                <div className="relative">
                  <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder={isAr ? 'محمد أحمد' : 'John Doe'}
                    className={`input-field ps-9 ${errors.name ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">{t('checkout.phone')}</label>
                <div className="relative">
                  <Phone size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+20 100 000 0000"
                    className={`input-field ps-9 ${errors.phone ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Address + City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">{t('checkout.street')}</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    placeholder={isAr ? 'شارع الجمهورية 45' : '45 Main Street'}
                    className={`input-field ${errors.address ? 'border-red-400' : ''}`}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">{t('checkout.city')}</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    placeholder={isAr ? 'القاهرة' : 'Cairo'}
                    className={`input-field ${errors.city ? 'border-red-400' : ''}`}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">
                  {t('checkout.notes')} <span className="text-muted font-normal">{isAr ? '(اختياري)' : '(Optional)'}</span>
                </label>
                <div className="relative">
                  <FileText size={16} className="absolute start-3 top-3 text-muted" />
                  <textarea
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    rows={3}
                    placeholder={isAr ? 'ملاحظات إضافية للتوصيل...' : 'Any delivery notes...'}
                    className="input-field ps-9 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-6">
              <h2 className="font-bold text-secondary mb-4">{t('checkout.payment')}</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(m => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${paymentMethod === m.id ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="accent-primary"
                    />
                    <span className="text-xl">{m.icon}</span>
                    <span className="font-semibold text-dark text-sm">
                      {isAr ? m.labelAr : m.labelEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:w-80 shrink-0">
            <div className="card p-5 space-y-4 sticky top-24">
              <h2 className="font-bold text-secondary border-b border-border pb-3">
                {isAr ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              {/* Items mini list */}
              <div className="space-y-3 max-h-52 overflow-y-auto">
                {items.map(item => (
                  <div key={item.key} className="flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1"
                      />
                      <span className="absolute -top-1 -end-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-dark line-clamp-1">{item.product.name}</p>
                    </div>
                    <span className="text-xs font-semibold text-dark">
                      {fmt(item.product.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-border pt-3">
                <div className="flex justify-between text-muted">
                  <span>{t('cart.subtotal')}</span>
                  <span>{fmt(getSubtotal())}</span>
                </div>
                {getDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{isAr ? 'الخصم' : 'Discount'}</span>
                    <span>- {fmt(getDiscount())}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>{t('cart.delivery')}</span>
                  <span>{fmt(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-dark text-base pt-1 border-t border-border">
                  <span>{t('cart.total')}</span>
                  <span className="text-primary">{fmt(getTotal())}</span>
                </div>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
                  {apiError}
                </div>
              )}

              {/* Guest warning */}
              {!isAuthenticated && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                  <p className="font-semibold mb-1">
                    {isAr ? 'أنت تتسوق كضيف' : 'Shopping as guest'}
                  </p>
                  <Link to="/login" className="text-primary hover:underline">
                    {isAr ? 'سجل الدخول لتتبع طلباتك' : 'Sign in to track your orders'}
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3"
              >
                {loading
                  ? <Loader2 size={20} className="animate-spin" />
                  : <><CheckCircle2 size={18} /> {t('checkout.place_order')}</>
                }
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
