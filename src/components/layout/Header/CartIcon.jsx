import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../../store/useCartStore';
import { useLocaleStore } from '../../../store/useLocaleStore';
import { useTranslation } from 'react-i18next';

export default function CartIcon({ onOpen }) {
  const { t } = useTranslation();
  const count = useCartStore((s) => s.getCount());
  const subtotal = useCartStore((s) => s.getSubtotal());
  const { currency } = useLocaleStore();

  const displayTotal = `${currency.symbol}${(subtotal * currency.rate).toFixed(2)}`;

  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-3 group"
      aria-label="Open cart"
    >
      <div className="hidden sm:flex flex-col items-end">
        <span className="text-xs text-muted">{t('header.cart')}</span>
        <span className="text-sm font-bold text-secondary">{displayTotal}</span>
      </div>
      <div className="relative">
        <ShoppingCart
          size={26}
          className="text-secondary group-hover:text-primary transition-colors"
        />
        {count > 0 && (
          <span className="absolute -top-2 -end-2 bg-primary text-white text-[10px] font-bold
                           w-5 h-5 rounded-full flex items-center justify-center animate-fade-in">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </div>
    </button>
  );
}
