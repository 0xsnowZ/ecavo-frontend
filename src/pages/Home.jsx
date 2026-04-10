import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';

import HeroSlider from '../components/common/HeroSlider';
import FeatureBar from '../components/common/FeatureBar';
import BannerGrid from '../components/common/BannerGrid';
import SectionTitle from '../components/common/SectionTitle';
import ProductCard from '../components/product/ProductCard';
import Skeleton from '../components/ui/Skeleton';
import { productsService } from '../services';
import { resolveImages } from '../utils/imageUrl';
import { getLocalized } from '../utils/localize';

// Banners stay static (unchanged)
import banner1 from '../assets/img/banner-1.jpg';
import banner2 from '../assets/img/banner-2.jpg';
import banner3 from '../assets/img/banner-3.jpg';
import banner4 from '../assets/img/banner-4.jpg';
import banner5 from '../assets/img/banner-5.jpg';
import bannerSm1 from '../assets/img/banner-sm-1.jpg';

// Sidebar — matches the 10 seeded categories
const SIDEBAR_CATEGORIES = [
  { labelKey: 'sidebar.home_appliances', slug: 'appliances' },
  { labelKey: 'sidebar.toys',            slug: 'toys' },
  { labelKey: 'sidebar.chargers',        slug: 'accessories' },
  { labelKey: 'sidebar.furniture',       slug: 'furniture' },
  { labelKey: 'sidebar.phones',          slug: 'mobiles' },
  { labelKey: 'sidebar.clothes',         slug: 'clothes' },
  { labelKey: 'sidebar.shoes',           slug: 'shoes' },
  { labelKey: 'sidebar.accessories',     slug: 'accessories' },
  { labelKey: 'sidebar.beauty',          slug: 'beauty' },
  { labelKey: 'sidebar.tvs',             slug: 'tvs' },
];

/** Map a raw API product to the shape ProductCard expects */
function toCard(p) {
  return {
    id:              p.id,
    slug:            p.slug,
    name_ar:         p.name_ar,
    name_en:         p.name_en,
    name_fr:         p.name_fr,
    price:           parseFloat(p.price),
    originalPrice:   p.original_price  ? parseFloat(p.original_price)  : null,
    discountPercent: p.discount_percent ?? null,
    images:          resolveImages(p.images),
    rating:          parseFloat(p.avg_rating) || 0,
    reviewCount:     p.review_count || 0,
    dealEndsAt:      p.deal_ends_at || null,
  };
}

/** Horizontal product carousel with skeleton loading state */
function ProductCarousel({ products, loading, slidesPerView = { base: 2, sm: 3, lg: 4, xl: 5 }, showCountdown = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }, (_, i) => <Skeleton.Card key={i} />)}
      </div>
    );
  }
  return (
    <div className="swiper-container-home">
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={14}
        slidesPerView={slidesPerView.base}
        breakpoints={{
          640:  { slidesPerView: slidesPerView.sm  ?? 3 },
          1024: { slidesPerView: slidesPerView.lg  ?? 4 },
          1280: { slidesPerView: slidesPerView.xl  ?? 5 },
        }}
        navigation
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={products.length > (slidesPerView.lg ?? 4)}
      >
        {products.map(p => (
          <SwiperSlide key={p.id}>
            <ProductCard product={p} showCountdown={showCountdown && !!p.dealEndsAt} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [deals,       setDeals]       = useState([]);
  const [sale,        setSale]        = useState([]);
  const [electronics, setElectronics] = useState([]);
  const [loadingDeals,   setLoadingDeals]   = useState(true);
  const [loadingSale,    setLoadingSale]    = useState(true);
  const [loadingElec,    setLoadingElec]    = useState(true);

  // Featured deals — products with deal_ends_at set
  useEffect(() => {
    productsService.list({ sort: 'discount', per_page: 8, is_featured: 1 })
      .then(r => setDeals((r.data.data || []).map(p => toCard(p))))
      .catch(() => {})
      .finally(() => setLoadingDeals(false));
  }, [isAr]);

  // Sale carousel — latest discounted products
  useEffect(() => {
    productsService.list({ sort: 'discount', per_page: 10 })
      .then(r => setSale((r.data.data || []).map(p => toCard(p))))
      .catch(() => {})
      .finally(() => setLoadingSale(false));
  }, [isAr]);

  // Electronics section — TVs & Appliances
  useEffect(() => {
    productsService.list({ sort: 'latest', per_page: 6, category: 'tvs' })
      .then(r => {
        const tvs = r.data.data || [];
        return productsService.list({ sort: 'latest', per_page: 6, category: 'appliances' })
          .then(r2 => setElectronics([...(r2.data.data || []), ...tvs].map(p => toCard(p))));
      })
      .catch(() => {})
      .finally(() => setLoadingElec(false));
  }, [isAr]);

  return (
    <div>
      {/* Hero: Sidebar + Slider */}
      <section className="container-main py-4">
        <div className="flex gap-4">
          {/* Category Sidebar */}
          <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white rounded-lg shadow-card p-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted px-2 mb-2">
              {t('sidebar.shop_by')}
            </h5>
            <nav className="space-y-0.5 flex-1">
              {SIDEBAR_CATEGORIES.map((cat, i) => (
                <Link
                  key={i}
                  to={`/categories/${cat.slug}`}
                  className="block px-3 py-2 text-sm text-dark hover:bg-primary/5 hover:text-primary rounded-lg transition-colors"
                >
                  {t(cat.labelKey)}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Hero Slider — z-index isolated so nav arrows don't leak */}
          <div className="flex-1 min-w-0 relative z-0">
            <HeroSlider />
          </div>
        </div>
      </section>

      {/* Feature Bar */}
      <FeatureBar />

      {/* Banner row 1 — unchanged */}
      <section className="container-main py-4">
        <BannerGrid
          cols={3}
          banners={[
            { src: banner1, to: '/products' },
            { src: banner2, to: '/products' },
            { src: banner3, to: '/products' },
          ]}
        />
      </section>

      {/* Featured Deals (with countdown timer) */}
      <section className="container-main py-6">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle title={t('products.featured_deals')} />
          <Link to="/products?sort=discount&is_featured=1" className="text-sm text-primary hover:underline flex items-center gap-1">
            {t('products.view_all')} <ChevronRight size={14} className="rtl-flip" />
          </Link>
        </div>
        <ProductCarousel
          products={deals}
          loading={loadingDeals}
          slidesPerView={{ base: 2, sm: 2, lg: 3, xl: 4 }}
          showCountdown
        />
      </section>

      {/* Banner row 2 — unchanged */}
      <section className="container-main py-4">
        <BannerGrid
          cols={2}
          banners={[
            { src: banner4, to: '/products' },
            { src: banner5, to: '/products' },
          ]}
        />
      </section>

      {/* Sale Products */}
      <section className="container-main py-6">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle title={t('products.sale')} />
          <Link to="/products?sort=discount" className="text-sm text-primary hover:underline flex items-center gap-1">
            {t('products.view_all')} <ChevronRight size={14} className="rtl-flip" />
          </Link>
        </div>
        <ProductCarousel
          products={sale}
          loading={loadingSale}
          slidesPerView={{ base: 2, sm: 3, lg: 4, xl: 5 }}
        />
      </section>

      {/* Electronics section with side banner */}
      <section className="container-main py-6">
        <SectionTitle title={t('products.electronics')} />
        <div className="flex gap-4 mt-4">
          {/* Side banner — unchanged */}
          <Link to="/categories/appliances" className="hidden lg:block w-48 shrink-0 rounded-xl overflow-hidden">
            <img
              src={bannerSm1}
              alt="electronics"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Electronics products */}
          <div className="flex-1 min-w-0">
            <ProductCarousel
              products={electronics}
              loading={loadingElec}
              slidesPerView={{ base: 2, sm: 3, lg: 4, xl: 4 }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
