import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useLocaleStore } from '../store/useLocaleStore';
import StarRating from '../components/ui/StarRating';
import { getLocalized } from '../utils/localize';

export default function Wishlist() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { items, toggle } = useWishlistStore();
  const addItem = useCartStore(s => s.addItem);
  const { currency } = useLocaleStore();

  const fmt = (usd) => `${currency.symbol}${(usd * currency.rate).toFixed(2)}`;

  const handleMoveToCart = (product) => {
    addItem(product);
    toggle(product); // remove from wishlist
  };

  if (items.length === 0) return (
    <div className="container-main py-24 flex flex-col items-center text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
        <Heart size={36} className="text-red-300" />
      </div>
      <h1 className="text-2xl font-bold text-secondary">
        {isAr ? 'قائمة الأمنيات فارغة' : 'Your wishlist is empty'}
      </h1>
      <p className="text-muted text-sm max-w-xs">
        {isAr
          ? 'اضغط على أيقونة القلب في أي منتج لإضافته إلى قائمة أمنياتك.'
          : 'Click the heart icon on any product to save it here.'}
      </p>
      <Link to="/products" className="btn-primary mt-2">
        {isAr ? 'تصفح المنتجات' : 'Browse Products'}
      </Link>
    </div>
  );

  return (
    <div className="container-main py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary">{t('header.my_wishlist')}</h1>
          <p className="text-sm text-muted mt-1">
            {isAr ? `${items.length} منتج` : `${items.length} item${items.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((product) => (
          <div key={product.id} className="card group relative overflow-hidden flex flex-col animate-fade-in">
            {/* Remove button */}
            <button
              onClick={() => toggle(product)}
              className="absolute top-2 end-2 z-10 bg-white rounded-full p-1.5 shadow-md
                         text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200
                         opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>

            {/* Image */}
            <Link to={`/products/${product.slug}`} className="block h-44 bg-gray-50 p-4 overflow-hidden">
              <img
                src={product.images?.[0]}
                alt={getLocalized(product, 'name', i18n.language)}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </Link>

            {/* Info */}
            <div className="p-3 flex flex-col gap-2 flex-1">
              <Link
                to={`/products/${product.slug}`}
                className="text-sm font-semibold text-dark hover:text-primary transition-colors line-clamp-2"
              >
                {getLocalized(product, 'name', i18n.language)}
              </Link>

              {product.rating !== undefined && (
                <StarRating rating={product.rating} size={12} />
              )}

              <div className="flex items-center gap-2 mt-auto">
                <span className="font-bold text-primary text-base">{fmt(product.price)}</span>
                {product.originalPrice && (
                  <del className="text-xs text-muted">{fmt(product.originalPrice)}</del>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => handleMoveToCart(product)}
                  className="btn-primary flex-1 justify-center text-xs py-2 gap-1"
                >
                  <ShoppingCart size={14} />
                  {t('products.add_to_cart')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
