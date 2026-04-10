import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/useCartStore';
import { useLocaleStore } from '../../store/useLocaleStore';
import { Link } from 'react-router-dom';
import { getLocalized } from '../../utils/localize';

export default function CartDrawer({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { items, removeItem, updateQty, getSubtotal, getTotal, deliveryFee } = useCartStore();
  const { currency } = useLocaleStore();

  const fmt = (usd) => `${currency.symbol}${(usd * currency.rate).toFixed(2)}`;

  // In RTL the drawer slides in from the LEFT (start), in LTR from the RIGHT (end)
  // We use physical translateX to avoid RTL mirror issues
  const slideClass = open
    ? 'translate-x-0'
    : isRTL ? '-translate-x-full' : 'translate-x-full';

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
                    ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 end-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl
                    flex flex-col transform transition-all duration-300 ease-in-out
                    ${open
                      ? 'translate-x-0 visible'
                      : isRTL ? '-translate-x-full invisible' : 'translate-x-full invisible'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            <h2 className="font-bold text-secondary">{t('cart.title')}</h2>
            {items.length > 0 && (
              <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="p-2 rounded-lg hover:bg-gray-100 text-muted hover:text-dark transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag size={48} className="text-gray-200" />
              <p className="text-muted">{t('cart.empty')}</p>
              <button type="button" onClick={onClose} className="btn-primary text-sm">
                {t('cart.continue')}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.key} className="flex gap-3 bg-surface rounded-xl p-3">
                <img
                  src={item.product.images?.[0]}
                  alt={getLocalized(item.product, 'name', i18n.language)}
                  className="w-16 h-16 object-contain rounded-lg bg-white"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-dark line-clamp-2">
                    {getLocalized(item.product, 'name', i18n.language)}
                  </p>
                  <p className="text-sm font-bold text-primary mt-1">{fmt(item.product.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => updateQty(item.key, item.qty - 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="ms-auto text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer totals */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted">
                <span>{t('cart.subtotal')}</span>
                <span>{fmt(getSubtotal())}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{t('cart.delivery')}</span>
                <span>{fmt(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-dark text-base pt-1 border-t border-border">
                <span>{t('cart.total')}</span>
                <span className="text-primary">{fmt(getTotal())}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="btn-primary w-full justify-center"
            >
              {t('cart.checkout')}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost w-full justify-center text-sm"
            >
              {t('cart.continue')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
