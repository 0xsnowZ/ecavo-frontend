import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import StarRating from '../ui/StarRating';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useLocaleStore } from '../../store/useLocaleStore';
import { useTranslation } from 'react-i18next';
import CountdownTimer from '../ui/CountdownTimer';

export default function ProductCard({ product, showCountdown = false }) {
  const { t } = useTranslation();
  const { currency } = useLocaleStore();
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isInWishlist } = useWishlistStore();

  const {
    id,
    slug,
    name,
    price,
    originalPrice,
    discountPercent,
    images,
    rating = 4.5,
    reviewCount = 0,
    dealEndsAt,
  } = product;

  const displayPrice = `${currency.symbol}${(price * currency.rate).toFixed(2)}`;
  const displayOriginal = originalPrice
    ? `${currency.symbol}${(originalPrice * currency.rate).toFixed(2)}`
    : null;
  const wishlisted = isInWishlist(id);

  return (
    <div className="card group relative overflow-hidden flex flex-col">
      {/* Discount badge */}
      {discountPercent && (
        <span className="badge-discount">{discountPercent}%</span>
      )}

      {/* Action buttons */}
      <div
        className="absolute top-2 end-2 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100
                   transform translate-x-2 group-hover:translate-x-0 transition-all duration-300"
      >
        <button
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          className={`p-2 rounded-full shadow-md transition-all duration-200 
                     ${wishlisted ? 'bg-primary text-white' : 'bg-white text-muted hover:text-primary'}`}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
        <Link
          to={`/products/${slug}`}
          className="p-2 bg-white text-muted hover:text-primary rounded-full shadow-md transition-colors"
        >
          <Eye size={16} />
        </Link>
      </div>

      {/* Image */}
      <Link to={`/products/${slug}`} className="product-img-wrapper h-52 bg-gray-50">
        <img
          src={images?.[0]}
          alt={name}
          className="primary-img w-full h-full object-contain transition-opacity duration-300 p-4"
          loading="lazy"
        />
        {images?.[1] && (
          <img
            src={images[1]}
            alt={name}
            className="hover-img object-contain p-4"
          />
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link
          to={`/products/${slug}`}
          className="text-sm font-semibold text-dark hover:text-primary transition-colors line-clamp-2 leading-snug"
        >
          {name}
        </Link>

        <StarRating rating={rating} count={reviewCount} />

        <div className="flex items-center gap-2 mt-auto">
          <span className="text-lg font-bold text-primary">{displayPrice}</span>
          {displayOriginal && (
            <del className="text-xs text-muted">{displayOriginal}</del>
          )}
        </div>

        {showCountdown && dealEndsAt && (
          <CountdownTimer targetDate={dealEndsAt} />
        )}

        {/* Add to Cart */}
        <button
          onClick={() => addItem(product)}
          className="btn-primary w-full justify-center mt-2 py-2 text-sm opacity-0 group-hover:opacity-100
                     transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
        >
          <ShoppingCart size={16} />
          {t('products.add_to_cart')}
        </button>
      </div>
    </div>
  );
}
