import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShoppingCart, Heart, ChevronLeft, ChevronRight,
  Star, Truck, RefreshCcw, ShieldCheck, Minus, Plus, Share2
} from 'lucide-react';
import { productsService, recentlyViewedService } from '../services';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useLocaleStore } from '../store/useLocaleStore';
import { useAuthStore } from '../store/useAuthStore';
import { pushRvId } from '../utils/recentlyViewed';
import StarRating from '../components/ui/StarRating';
import Spinner from '../components/ui/Spinner';
import CountdownTimer from '../components/ui/CountdownTimer';
import ProductCard from '../components/product/ProductCard';
import { resolveImages } from '../utils/imageUrl';
import { getLocalized } from '../utils/localize';

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const { currency } = useLocaleStore();
  const addItem = useCartStore(s => s.addItem);
  const { toggle, isInWishlist } = useWishlistStore();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // description | specifications | reviews
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    setLoading(true);
    productsService.detail(slug)
      .then(r => {
        const p = r.data.data;
        setProduct(p);
        // Auto-select first variant if exists
        if (p.variants?.length > 0) setSelectedVariant(p.variants[0]);

        // ── Track recently viewed ────────────────────────────────────────
        // Always push to localStorage (works for guests and logged-in users)
        pushRvId(p.id);
        // Additionally persist to the DB for logged-in users (fire-and-forget)
        if (isAuthenticated) {
          recentlyViewedService.track(p.id).catch(() => { });
        }
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="flex justify-center py-24">
      <Spinner size="lg" />
    </div>
  );

  if (!product) return null;

  const name = getLocalized(product, 'name', i18n.language);
  const description = getLocalized(product, 'description', i18n.language);
  const basePrice = parseFloat(product.price) + (selectedVariant ? parseFloat(selectedVariant.extra_price) : 0);
  const displayPrice = `${currency.symbol}${(basePrice * currency.rate).toFixed(2)}`;
  const displayOriginal = product.original_price
    ? `${currency.symbol}${(parseFloat(product.original_price) * currency.rate).toFixed(2)}`
    : null;
  const wishlisted = isInWishlist(product.id);
  const images = resolveImages(product.images, '/placeholder.jpg');

  const handleAddToCart = () => {
    addItem({ ...product, price: basePrice }, qty, selectedVariant);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: name,
      text: description,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert(isAr ? 'تم نسخ الرابط!' : 'Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  // Group variants by attribute type
  const variantGroups = product.variants?.reduce((acc, v) => {
    if (!acc[v.attribute]) acc[v.attribute] = [];
    acc[v.attribute].push(v);
    return acc;
  }, {}) ?? {};

  return (
    <div className="container-main py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">{t('nav.home')}</Link>
        <ChevronRight size={12} className="rtl-flip" />
        <Link to="/products" className="hover:text-primary">{isAr ? 'المنتجات' : 'Products'}</Link>
        <ChevronRight size={12} className="rtl-flip" />
        <span className="text-dark">{name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ── Image Gallery ── */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-gray-50 group">
            <img
              src={images[activeImg]}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.discount_percent && (
              <div className="absolute top-4 end-4 w-12 h-12 bg-black text-white rounded-full flex flex-col items-center justify-center text-[11px] font-bold leading-tight shadow-md z-10">
                <span>{product.discount_percent}%</span>
                <span>OFF</span>
              </div>
            )}
            {/* Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-dark/50 hover:text-dark transition-colors z-10"
                >
                  <ChevronLeft size={32} strokeWidth={1.5} className="rtl-flip" />
                </button>
                <button
                  onClick={() => setActiveImg(i => (i + 1) % images.length)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-dark/50 hover:text-dark transition-colors z-10"
                >
                  <ChevronRight size={32} strokeWidth={1.5} className="rtl-flip" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative aspect-square overflow-hidden transition-all
                    ${i === activeImg ? 'ring-2 ring-offset-2 ring-black' : 'hover:opacity-80'}`}
                >
                  <img src={src} className="w-full h-full object-cover bg-gray-50 bg-center" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="space-y-5">
          {/* Category badge */}
          {product.category && (
            <Link
              to={`/categories/${product.category.slug}`}
              className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full inline-block"
            >
              {getLocalized(product.category, 'name', i18n.language)}
            </Link>
          )}

          <h1 className="text-2xl font-bold text-dark leading-snug">{name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={parseFloat(product.avg_rating) || 0} count={product.review_count} />
            <span className="text-xs text-muted">
              {isAr ? `${product.stock} متوفر` : `${product.stock} in stock`}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-primary">{displayPrice}</span>
            {displayOriginal && (
              <del className="text-base text-muted">{displayOriginal}</del>
            )}
          </div>

          {/* Countdown for deals */}
          {product.deal_ends_at && (
            <div>
              <p className="text-sm font-semibold text-dark mb-1">{t('products.hurry_up')}</p>
              <CountdownTimer targetDate={product.deal_ends_at} />
            </div>
          )}

          {/* Variants */}
          {Object.entries(variantGroups).map(([attribute, variants]) => (
            <div key={attribute}>
              <p className="text-sm font-semibold text-dark mb-2 capitalize">
                {attribute}: <span className="text-primary">{selectedVariant?.value}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-1.5 rounded-lg border-2 text-sm font-medium transition-all
                      ${selectedVariant?.id === v.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-dark hover:border-primary'}`}
                  >
                    {v.value}
                    {v.extra_price > 0 && ` (+${currency.symbol}${v.extra_price})`}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Actions: Qty, Add to Cart, Wishlist, Share */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Qty */}
            <div className="flex items-center justify-between border-2 border-border rounded-xl overflow-hidden shrink-0 flex-1 sm:flex-none">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="px-4 py-3 hover:bg-gray-100 transition-colors text-muted hover:text-dark"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold text-dark">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                className="px-4 py-3 hover:bg-gray-100 transition-colors text-muted hover:text-dark"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`btn-primary flex-1 justify-center py-3 text-base transition-all
                order-last sm:order-none min-w-full sm:min-w-0
                ${addedToCart ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              <ShoppingCart size={20} />
              {addedToCart
                ? (isAr ? '✓ تمت الإضافة!' : '✓ Added!')
                : t('products.add_to_cart')}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => toggle({ id: product.id, slug, name, price: basePrice, images })}
              className={`p-3 rounded-xl border-2 transition-all shrink-0
                ${wishlisted
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted hover:border-primary hover:text-primary'}`}
              aria-label={t('products.add_to_wishlist') || 'Wishlist'}
            >
              <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-3 rounded-xl border-2 border-border transition-all text-muted hover:border-primary hover:text-primary shrink-0"
              aria-label="Share product"
            >
              <Share2 size={20} />
            </button>
          </div>

          {product.stock === 0 && (
            <p className="text-sm text-red-500 font-medium">{t('products.out_of_stock')}</p>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
            {[
              { icon: Truck, titleKey: 'features.free_shipping', descKey: 'features.free_shipping_desc' },
              { icon: RefreshCcw, titleKey: 'features.money_guarantee', descKey: 'features.money_guarantee_desc' },
              { icon: ShieldCheck, titleKey: 'features.secure_payment', descKey: 'features.secure_payment_desc' },
            ].map(({ icon: Icon, titleKey, descKey }) => (
              <div key={titleKey} className="flex flex-col items-center text-center gap-1 p-3 rounded-xl bg-surface">
                <Icon size={20} className="text-secondary" />
                <span className="text-xs font-semibold text-dark">{t(titleKey)}</span>
                <span className="text-[10px] text-muted">{t(descKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs: Description / Specs / Reviews ── */}
      <div className="mt-10">
        <div className="flex border-b border-border gap-1">
          {[
            { id: 'description', labelAr: 'الوصف', labelEn: 'Description' },
            { id: 'specifications', labelAr: 'المواصفات', labelEn: 'Specifications' },
            { id: 'reviews', labelAr: 'التقييمات', labelEn: 'Reviews' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-dark'}`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <p className="text-sm text-dark leading-relaxed whitespace-pre-line">
              {description || (isAr ? 'لا يوجد وصف.' : 'No description available.')}
            </p>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-xl">
              {(product.specifications?.length > 0) ? (
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-surface' : ''}>
                        <td className="py-2 px-4 font-semibold text-secondary w-40">{spec.label}</td>
                        <td className="py-2 px-4 text-dark">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted text-sm">
                  {isAr ? 'لا توجد مواصفات.' : 'No specifications listed.'}
                </p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-2xl">
              {product.reviews?.length > 0 ? product.reviews.map(r => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-dark">{r.user.name}</p>
                      <StarRating rating={r.rating} size={12} />
                    </div>
                    <span className="text-xs text-muted">{r.created_at}</span>
                  </div>
                  {r.comment && <p className="text-sm text-dark mt-2">{r.comment}</p>}
                </div>
              )) : (
                <p className="text-muted text-sm">
                  {isAr ? 'لا توجد تقييمات بعد.' : 'No reviews yet.'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
