import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  RefreshCcw,
  ShieldCheck,
  Minus,
  Plus,
  Share2,
} from "lucide-react";
import { productsService, recentlyViewedService, reviewsService } from "../services";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useLocaleStore } from "../store/useLocaleStore";
import { useAuthStore } from "../store/useAuthStore";
import { pushRvId } from "../utils/recentlyViewed";
import StarRating from "../components/ui/StarRating";
import Spinner from "../components/ui/Spinner";
import CountdownTimer from "../components/ui/CountdownTimer";
import ProductCard from "../components/product/ProductCard";
import ReviewForm from "../components/product/ReviewForm";
import { resolveImages } from "../utils/imageUrl";
import { resolveImageUrl } from "../utils/imageUrl";
import { getLocalized } from "../utils/localize";

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isAr = i18n.language === "ar";
  const isFr = i18n.language === "fr";

  const { currency } = useLocaleStore();
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isInWishlist } = useWishlistStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description"); // description | specifications | reviews
  const [addedToCart, setAddedToCart] = useState(false);
  const [eligibleItem, setEligibleItem] = useState(null);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);

  // Auto-switch to reviews tab if coming from "Leave a Review" button
  useEffect(() => {
    if (searchParams.get("review") || location.hash === "#reviews") {
      setActiveTab("reviews");
      // Scroll to reviews section smoothly after a short delay
      setTimeout(() => {
        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [searchParams, location]);

  useEffect(() => {
    setLoading(true);
    productsService
      .detail(slug)
      .then((r) => {
        const p = r.data.data;
        setProduct(p);
        // Auto-select first variant if exists
        if (p.variants?.length > 0) {
            const defaults = {};
            p.variants.forEach(v => {
                if (!defaults[v.attribute]) defaults[v.attribute] = v;
            });
            setSelectedVariants(defaults);
        }
        
        // Auto-select first specs if available
        if (p.specifications?.colors) setSelectedColor(p.specifications.colors.split(',').map(s=>s.trim())[0]);
        if (p.specifications?.sizes) setSelectedSize(p.specifications.sizes.split(',').map(s=>s.trim())[0]);
        if (p.specifications?.storage) setSelectedStorage(p.specifications.storage.split(',').map(s=>s.trim())[0]);
        if (p.specifications?.material) setSelectedMaterial(p.specifications.material.split(',').map(s=>s.trim())[0]);

        // ── Track recently viewed ────────────────────────────────────────
        // Always push to localStorage (works for guests and logged-in users)
        pushRvId(p.id);
        // Additionally persist to the DB for logged-in users (fire-and-forget)
        if (isAuthenticated) {
          recentlyViewedService.track(p.id).catch(() => {});
        }
      })
      .catch(() => navigate("/products"))
      .finally(() => setLoading(false));
  }, [slug, isAuthenticated]);

  // Fetch eligible items to check if user can review this product
  useEffect(() => {
    if (!isAuthenticated || !product) return;
    
    // Check if the URL requested a specific order item to review
    const targetOrderItemId = searchParams.get("review");
    
    reviewsService.eligible()
      .then(res => {
        const items = res.data.data || [];
        // If a specific order item was requested, try to find it
        if (targetOrderItemId) {
          const item = items.find(i => i.id == targetOrderItemId && i.product.id === product.id);
          if (item) setEligibleItem(item);
        } else {
          // Otherwise just see if they have *any* eligible order item for this product
          const item = items.find(i => i.product.id === product.id);
          if (item) setEligibleItem(item);
        }
      })
      .catch(console.error);
  }, [isAuthenticated, product, searchParams]);

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );

  if (!product) return null;

  const name = getLocalized(product, "name", i18n.language);
  const description = getLocalized(product, "description", i18n.language);
  const extraPriceSum = Object.values(selectedVariants).reduce((sum, v) => sum + parseFloat(v.extra_price || 0), 0);
  const basePrice = parseFloat(product.price) + extraPriceSum;
  const displayPrice = `${currency.symbol}${(basePrice * currency.rate).toFixed(2)}`;
  const displayOriginal = product.original_price
    ? `${currency.symbol}${(parseFloat(product.original_price) * currency.rate).toFixed(2)}`
    : null;
  const wishlisted = isInWishlist(product.id);
  const images = resolveImages(product.images, "/placeholder.jpg");

  const handleAddToCart = () => {
    let customVariant = null;
    
    if (Object.keys(selectedVariants).length > 0) {
       const labels = Object.values(selectedVariants).map(v => v.value);
       const ids = Object.values(selectedVariants).map(v => v.id).join('-');
       customVariant = {
          id: `var-${ids}`,
          value: labels.join(' / '),
          extra_price: extraPriceSum
       };
    } else if (selectedColor || selectedSize || selectedStorage || selectedMaterial) {
       // If no explicit variant but we have specs selected, create synthetic variant
       const labels = [];
       if (selectedColor) labels.push(selectedColor);
       if (selectedSize) labels.push(selectedSize);
       if (selectedStorage) labels.push(selectedStorage);
       if (selectedMaterial) labels.push(selectedMaterial);
       customVariant = {
          id: `opt-${selectedColor||'x'}-${selectedSize||'x'}-${selectedStorage||'x'}-${selectedMaterial||'x'}`,
          value: labels.join(' / '),
          extra_price: 0
       };
    }

    addItem({ ...product, price: basePrice }, qty, customVariant);
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
        alert(isAr ? "تم نسخ الرابط!" : "Link copied to clipboard!");
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  // Group variants by attribute type
  const variantGroups =
    product.variants?.reduce((acc, v) => {
      if (!acc[v.attribute]) acc[v.attribute] = [];
      acc[v.attribute].push(v);
      return acc;
    }, {}) ?? {};

  return (
    <div className="container-main py-8 pb-24 sm:pb-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">
          {t("nav.home")}
        </Link>
        <ChevronRight size={12} className="rtl-flip" />
        <Link to="/products" className="hover:text-primary">
          {isAr ? "المنتجات" : "Products"}
        </Link>
        <ChevronRight size={12} className="rtl-flip" />
        <span className="text-dark">{name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── Image Gallery ── */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-gray-50 group">
            <img
              src={resolveImageUrl(images[activeImg])}
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
                  onClick={() =>
                    setActiveImg((i) => (i - 1 + images.length) % images.length)
                  }
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-dark/50 hover:text-dark transition-colors z-10"
                >
                  <ChevronLeft
                    size={32}
                    strokeWidth={1.5}
                    className="rtl-flip"
                  />
                </button>
                <button
                  onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-dark/50 hover:text-dark transition-colors z-10"
                >
                  <ChevronRight
                    size={32}
                    strokeWidth={1.5}
                    className="rtl-flip"
                  />
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
                    ${i === activeImg ? "ring-2 ring-offset-2 ring-black" : "hover:opacity-80"}`}
                >
                  <img
                    src={resolveImageUrl(src)}
                    className="w-full h-full object-cover bg-gray-50 bg-center"
                    alt=""
                  />
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
              {getLocalized(product.category, "name", i18n.language)}
            </Link>
          )}

          <h1 className="text-2xl font-bold text-dark leading-snug">{name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating
              rating={parseFloat(product.avg_rating) || 0}
              count={product.review_count}
            />
            <span className="text-xs text-muted">
              {isAr ? `${product.stock} متوفر` : `${product.stock} in stock`}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-primary">
              {displayPrice}
            </span>
            {displayOriginal && (
              <del className="text-base text-muted">{displayOriginal}</del>
            )}
          </div>

          {/* Countdown for deals */}
          {product.deal_ends_at && (
            <div>
              <p className="text-sm font-semibold text-dark mb-1">
                {t("products.hurry_up")}
              </p>
              <CountdownTimer targetDate={product.deal_ends_at} />
            </div>
          )}

          {/* Variants */}
          {Object.entries(variantGroups).map(([attribute, variants]) => (
            <div key={attribute}>
              <p className="text-sm font-semibold text-dark mb-2 capitalize">
                {attribute}:{" "}
                <span className="text-primary">{selectedVariants[attribute]?.value}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariants(prev => ({ ...prev, [attribute]: v }))}
                    className={`px-4 py-1.5 rounded-lg border-2 text-sm font-medium transition-all
                      ${
                        selectedVariants[attribute]?.id === v.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-dark hover:border-primary"
                      }`}
                  >
                    {v.value}
                    {v.extra_price > 0 &&
                      ` (+${currency.symbol}${v.extra_price})`}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Color Selection */}
          {product.specifications?.colors && (
            <div>
              <p className="text-sm font-semibold text-dark mb-2">
                {isAr ? "اللون" : "Color"}:{" "}
                <span className="text-primary">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.specifications.colors.split(',').map(s=>s.trim()).filter(Boolean).map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-1.5 rounded-lg border-2 text-sm font-medium transition-all
                      ${
                        selectedColor === color
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-dark hover:border-primary"
                      }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.specifications?.sizes && (
            <div>
              <p className="text-sm font-semibold text-dark mb-2">
                {isAr ? "المقاس" : "Size"}:{" "}
                <span className="text-primary">{selectedSize}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.specifications.sizes.split(',').map(s=>s.trim()).filter(Boolean).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-1.5 rounded-lg border-2 text-sm font-medium transition-all
                      ${
                        selectedSize === size
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-dark hover:border-primary"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Storage Selection */}
          {product.specifications?.storage && (
            <div>
              <p className="text-sm font-semibold text-dark mb-2">
                {isAr ? "السعة" : "Storage"}:{" "}
                <span className="text-primary">{selectedStorage}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.specifications.storage.split(',').map(s=>s.trim()).filter(Boolean).map((storage) => (
                  <button
                    key={storage}
                    onClick={() => setSelectedStorage(storage)}
                    className={`px-4 py-1.5 rounded-lg border-2 text-sm font-medium transition-all
                      ${
                        selectedStorage === storage
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-dark hover:border-primary"
                      }`}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Material Selection */}
          {product.specifications?.material && (
            <div>
              <p className="text-sm font-semibold text-dark mb-2">
                {isAr ? "الخامة" : "Material"}:{" "}
                <span className="text-primary">{selectedMaterial}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.specifications.material.split(',').map(s=>s.trim()).filter(Boolean).map((mat) => (
                  <button
                    key={mat}
                    onClick={() => setSelectedMaterial(mat)}
                    className={`px-4 py-1.5 rounded-lg border-2 text-sm font-medium transition-all
                      ${
                        selectedMaterial === mat
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-dark hover:border-primary"
                      }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions: Qty, Add to Cart, Wishlist, Share */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Qty */}
            <div className="flex items-center justify-between border-2 border-border rounded-xl overflow-hidden shrink-0 flex-1 sm:flex-none">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-3 hover:bg-gray-100 transition-colors text-muted hover:text-dark"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold text-dark">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
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
                ${addedToCart ? "bg-green-500 hover:bg-green-600" : ""}`}
            >
              <ShoppingCart size={20} />
              {addedToCart
                ? isAr
                  ? "✓ تمت الإضافة!"
                  : "✓ Added!"
                : t("products.add_to_cart")}
            </button>

            {/* Wishlist */}
            <button
              onClick={() =>
                toggle({ id: product.id, slug, name, price: basePrice, images })
              }
              className={`p-3 rounded-xl border-2 transition-all shrink-0
                ${
                  wishlisted
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted hover:border-primary hover:text-primary"
                }`}
              aria-label={t("products.add_to_wishlist") || "Wishlist"}
            >
              <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
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
            <p className="text-sm text-red-500 font-medium">
              {t("products.out_of_stock")}
            </p>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
            {[
              {
                icon: Truck,
                titleKey: "features.free_shipping",
                descKey: "features.free_shipping_desc",
              },
              {
                icon: RefreshCcw,
                titleKey: "features.money_guarantee",
                descKey: "features.money_guarantee_desc",
              },
              {
                icon: ShieldCheck,
                titleKey: "features.secure_payment",
                descKey: "features.secure_payment_desc",
              },
            ].map(({ icon: Icon, titleKey, descKey }) => (
              <div
                key={titleKey}
                className="flex flex-col items-center text-center gap-1 p-3 rounded-xl bg-surface"
              >
                <Icon size={20} className="text-secondary" />
                <span className="text-xs font-semibold text-dark">
                  {t(titleKey)}
                </span>
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
            { id: "description", labelAr: "الوصف", labelEn: "Description" },
            {
              id: "specifications",
              labelAr: "المواصفات",
              labelEn: "Specifications",
            },
            { id: "reviews", labelAr: "التقييمات", labelEn: "Reviews" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors
                ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-dark"
                }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === "description" && (
            <p className="text-sm text-dark leading-relaxed whitespace-pre-line">
              {description ||
                (isAr ? "لا يوجد وصف." : "No description available.")}
            </p>
          )}

          {activeTab === "specifications" && (
            <div className="max-w-xl">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <table className="w-full text-sm">
                  <tbody>
                    {Array.isArray(product.specifications)
                      ? product.specifications.map((spec, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-surface" : ""}>
                            <td className="py-2 px-4 font-semibold text-secondary w-40 capitalize">
                              {spec.label}
                            </td>
                            <td className="py-2 px-4 text-dark">{spec.value}</td>
                          </tr>
                        ))
                      : Object.entries(product.specifications).map(([key, val], i) => val ? (
                          <tr key={i} className={i % 2 === 0 ? "bg-surface" : ""}>
                            <td className="py-2 px-4 font-semibold text-secondary w-40 capitalize">
                              {key}
                            </td>
                            <td className="py-2 px-4 text-dark">{val}</td>
                          </tr>
                        ) : null)}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted text-sm">
                  {isAr ? "لا توجد مواصفات." : "No specifications listed."}
                </p>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div id="reviews-section" className="space-y-4 max-w-2xl">
              {/* Review Form for Eligible Buyers */}
              {isAuthenticated && eligibleItem && (
                <div className="border border-border rounded-xl p-5 mb-8 bg-blue-50/50 dark:bg-blue-900/10">
                  <h4 className="font-bold text-dark mb-4">
                    {isAr ? "اكتب تقييمك" : isFr ? "Écrivez votre avis" : "Write Your Review"}
                  </h4>
                  <ReviewForm 
                    orderItemId={eligibleItem.id} 
                    onSuccess={() => {
                      setEligibleItem(null);
                      setHasSubmittedReview(true);
                    }} 
                  />
                </div>
              )}
              {hasSubmittedReview && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-6 border border-green-200">
                  {isAr 
                    ? "شكراً لك! تقييمك قيد المراجعة وسوف يظهر قريباً."
                    : isFr 
                      ? "Merci ! Votre avis est en attente de modération."
                      : "Thank you! Your review is pending moderation and will appear shortly."}
                </div>
              )}
              {isAuthenticated && !eligibleItem && !hasSubmittedReview && (
                <p className="text-sm text-muted mb-6 italic">
                  {isAr 
                    ? "يمكن فقط للمشترين الذين استلموا هذا المنتج ترك تقييم."
                    : isFr 
                      ? "Seuls les acheteurs ayant reçu ce produit peuvent laisser un avis."
                      : "Only verified buyers who received this product can leave a review."}
                </p>
              )}

              {/* Existing Reviews List */}
              {product.reviews?.length > 0 ? (
                product.reviews.map((r) => (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm text-dark">
                          {r.user.name}
                        </p>
                        <StarRating rating={r.rating} size={12} />
                      </div>
                      <span className="text-xs text-muted">{r.created_at}</span>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-dark mt-2">{r.comment}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted text-sm">
                  {isAr ? "لا توجد تقييمات بعد." : "No reviews yet."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Add to Cart Bar (Mobile Only) */}
      <div className="sm:hidden fixed bottom-0 start-0 end-0 bg-white border-t border-border p-3 flex gap-3 items-center z-40 shadow-lg">
        {/* Quantity (compacted) */}
        <div className="flex items-center border border-border rounded-xl overflow-hidden bg-white shrink-0">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-2.5 hover:bg-gray-100 transition-colors text-muted hover:text-dark"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center font-bold text-dark text-sm">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="p-2.5 hover:bg-gray-100 transition-colors text-muted hover:text-dark"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`btn-primary flex-1 justify-center py-2.5 text-sm transition-all
            ${addedToCart ? "bg-green-500 hover:bg-green-600" : ""}`}
        >
          <ShoppingCart size={16} />
          {addedToCart
            ? isAr
              ? "✓ تمت الإضافة!"
              : "✓ Added!"
            : t("products.add_to_cart")}
        </button>
      </div>
    </div>
  );
}
