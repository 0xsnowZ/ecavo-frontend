import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import StarRating from '../ui/StarRating';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useLocaleStore } from '../../store/useLocaleStore';
import { useTranslation } from 'react-i18next';
import CountdownTimer from '../ui/CountdownTimer';
import { getLocalized } from '../../utils/localize';
import { resolveImageUrl } from '../../utils/imageUrl';

export default function ProductCard({ product, showCountdown = false }) {
  const { t, i18n } = useTranslation();
  const { currency } = useLocaleStore();
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const { toggle, isInWishlist } = useWishlistStore();

  // Pages normalize API data to camelCase; raw API uses snake_case — support both
  const id = product.id;
  const slug = product.slug;
  const price = product.price;
  const images = product.images;
  const originalPrice = product.originalPrice ?? product.original_price ?? null;
  const discountPercent = product.discountPercent ?? product.discount_percent ?? null;
  const avgRating = product.rating ?? product.avg_rating ?? 0;
  const reviewCount = product.reviewCount ?? product.review_count ?? 0;
  const dealEndsAt = product.dealEndsAt ?? product.deal_ends_at ?? null;

  const name = getLocalized(product, 'name', i18n.language);
  const description = getLocalized(product, 'description', i18n.language);

  const displayPrice = `${currency.symbol}${(price * currency.rate).toFixed(2)}`;
  const displayOriginal = originalPrice
    ? `${currency.symbol}${(originalPrice * currency.rate).toFixed(2)}`
    : null;
  const wishlisted = isInWishlist(id);
  const qtyInCart = items.find((i) => i.product.id === id)?.qty || 0;

  return (
    <div className="card group relative overflow-hidden flex flex-col h-full">
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
      <Link
        to={`/products/${slug}`}
        className="product-img-wrapper h-[240px] w-full shrink-0 flex-none bg-white flex items-center justify-center overflow-hidden"
      >
        <img
          src={resolveImageUrl(images?.[0])}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link
          to={`/products/${slug}`}
          className="text-sm font-semibold text-dark hover:text-primary transition-colors line-clamp-2 leading-snug"
        >
          {name}
        </Link>

        {description && (
          <p className="text-xs text-muted line-clamp-2 leading-relaxed">
            {description.replace(/[#*\n]/g, ' ').trim()}
          </p>
        )}

        <StarRating rating={avgRating} count={reviewCount} />

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-dark">{displayPrice}</span>
            {displayOriginal && (
              <del className="text-xs text-muted">{displayOriginal}</del>
            )}
          </div>

          <button
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="w-8 h-8 rounded-full border border-dark flex items-center justify-center text-dark hover:bg-dark hover:text-white transition-colors relative flex-shrink-0"
            aria-label={t('products.add_to_cart')}
          >
            <ShoppingCart size={16} />
            {qtyInCart > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF6600] text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold border border-white">
                {qtyInCart}
              </span>
            )}
          </button>
        </div>

        {showCountdown && dealEndsAt && (
          <CountdownTimer targetDate={dealEndsAt} />
        )}
      </div>
    </div>
  );
}
