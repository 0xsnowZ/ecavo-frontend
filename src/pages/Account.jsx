import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User, Mail, Phone, Edit2, LogOut, Package,
  ChevronRight, Loader2, CheckCircle2, Truck,
  ShieldCheck, XCircle,
} from 'lucide-react';
import { authService, ordersService } from '../services';
import { useAuthStore } from '../store/useAuthStore';
import { useLocaleStore } from '../store/useLocaleStore';
import Spinner from '../components/ui/Spinner';

const STATUS_COLOR = {
  placed:            'bg-blue-100 text-blue-700',
  preparing:         'bg-indigo-100 text-indigo-700',
  awaiting_shipment: 'bg-yellow-100 text-yellow-700',
  shipped:           'bg-teal-100 text-teal-700',
  in_transit:        'bg-purple-100 text-purple-700',
  delivered:         'bg-green-100 text-green-700',
  no_answer:         'bg-orange-100 text-orange-700',
  postponed:         'bg-gray-100 text-gray-600',
  wrong_address:     'bg-red-100 text-red-600',
  cancelled:         'bg-red-100 text-red-600',
  returned:          'bg-pink-100 text-pink-700',
};

export default function Account() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { currency } = useLocaleStore();
  const fmt = (usd) => `${currency.symbol}${(usd * currency.rate).toFixed(2)}`;

  const [tab, setTab]         = useState('orders'); // orders | profile
  const [orders, setOrders]   = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving]   = useState(false);
  const [saveOk, setSaveOk]   = useState(false);

  useEffect(() => {
    ordersService.list()
      .then(r => setOrders(r.data.data || []))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    logout();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // In Sprint 4 we'll add a PUT /api/profile endpoint; for now update local store
      updateUser(profileForm);
      setEditMode(false);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'orders',  key: 'tab_orders' },
    { id: 'profile', key: 'tab_profile' },
  ];

  return (
    <div className="container-main py-8">
      <h1 className="text-2xl font-bold text-secondary mb-6">{t('account_page.title')}</h1>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Sidebar ── */}
        <aside className="lg:w-64 shrink-0">
          <div className="card p-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 text-center pb-5 border-b border-border mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <p className="font-bold text-dark">{user?.name}</p>
              <p className="text-xs text-muted">{user?.email}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user?.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                {user?.role === 'admin' ? t('account_page.role_admin') : t('account_page.role_customer')}
              </span>
            </div>

            {/* Nav tabs */}
            <nav className="space-y-1">
              {TABS.map(tabItem => (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-start
                    ${tab === tabItem.id ? 'bg-primary/10 text-primary' : 'text-dark hover:bg-gray-100'}`}
                >
                  {tabItem.id === 'orders' ? <Package size={16} /> : <User size={16} />}
                  {t(`account_page.${tabItem.key}`)}
                </button>
              ))}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-dark hover:bg-gray-100 transition-all"
                >
                  <ShieldCheck size={16} />
                  {t('account_page.admin_panel')}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={16} />
                {t('account_page.logout')}
              </button>
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">

          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-secondary">{t('account_page.order_history')}</h2>
                <span className="text-xs text-muted">{orders.length} {orders.length === 1 ? t('account_page.order') : t('account_page.orders')}</span>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <Package size={48} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-muted text-sm">{t('account_page.no_orders')}</p>
                  <Link to="/products" className="btn-primary mt-4 text-sm">{t('account_page.shop_now')}</Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 hover:bg-surface transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-dark text-sm">
                            {t('account_page.order_id', { id: order.id })}
                          </p>
                          <p className="text-xs text-muted">{order.created_at}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                              {t(`orders.status_${order.status}`, { defaultValue: order.status.replace(/_/g, ' ') })}
                            </span>
                            <span className="text-xs text-muted">
                              {order.items?.length} {t('account_page.items_count')}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-black text-primary">{fmt(order.total)}</span>
                          <Link
                            to={`/orders/${order.id}/track`}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            {t('account_page.track')}
                            <ChevronRight size={12} className="rtl-flip" />
                          </Link>
                        </div>
                      </div>

                      {/* Items preview */}
                      {order.items?.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-hidden">
                          {order.items.slice(0, 4).map(item => (
                            item.product?.images?.[0] && (
                              <img
                                key={item.id}
                                src={item.product.images[0]}
                                alt=""
                                className="w-10 h-10 object-contain rounded-lg bg-gray-50 p-0.5"
                              />
                            )
                          ))}
                          {order.items.length > 4 && (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-muted font-bold">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-secondary">{t('account_page.profile_info')}</h2>
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="btn-ghost text-sm py-1.5 px-3">
                    <Edit2 size={15} />
                    {t('account_page.edit')}
                  </button>
                )}
              </div>

              {saveOk && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2.5 animate-fade-in">
                  <CheckCircle2 size={16} />
                  {t('account_page.saved_success')}
                </div>
              )}

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    {t('account_page.full_name')}
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-2.5 px-3 bg-surface rounded-lg text-sm">
                      <User size={16} className="text-muted" />
                      <span className="text-dark">{user?.name}</span>
                    </div>
                  )}
                </div>

                {/* Email (read only) */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    {t('account_page.email')}
                  </label>
                  <div className="flex items-center gap-2 py-2.5 px-3 bg-surface rounded-lg text-sm opacity-75">
                    <Mail size={16} className="text-muted" />
                    <span className="text-dark">{user?.email}</span>
                    <span className="ms-auto text-xs text-muted">{t('account_page.cannot_change')}</span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                    {t('account_page.phone')}
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+20 100 000 0000"
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-2.5 px-3 bg-surface rounded-lg text-sm">
                      <Phone size={16} className="text-muted" />
                      <span className="text-dark">{user?.phone || t('account_page.not_set')}</span>
                    </div>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : t('account_page.save')}
                  </button>
                  <button onClick={() => { setEditMode(false); setProfileForm({ name: user?.name, phone: user?.phone }); }}
                    className="btn-ghost">
                    {t('account_page.cancel')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
