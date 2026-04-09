import { useTranslation } from 'react-i18next';
import HeroSlider from '../components/common/HeroSlider';
import FeatureBar from '../components/common/FeatureBar';
import BannerGrid from '../components/common/BannerGrid';
import SectionTitle from '../components/common/SectionTitle';
import ProductCard from '../components/product/ProductCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Sidebar category list
import banner1 from '../assets/img/banner-1.jpg';
import banner2 from '../assets/img/banner-2.jpg';
import banner3 from '../assets/img/banner-3.jpg';
import banner4 from '../assets/img/banner-4.jpg';
import banner5 from '../assets/img/banner-5.jpg';
import bannerSm1 from '../assets/img/banner-sm-1.jpg';

// Mock product data that maps to the static site's product cards
const MOCK_DEAL_PRODUCTS = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  slug: `product-deal-${i + 1}`,
  name: 'Original Mobile Android Dual SIM Smart Phone G3',
  price: 120,
  originalPrice: 155,
  discountPercent: 34,
  images: [
    new URL(`../assets/img/product-${14 - i}.jpg`, import.meta.url).href,
    new URL(`../assets/img/product-${i + 1}.jpg`, import.meta.url).href,
  ],
  rating: 4.5,
  reviewCount: 32,
  dealEndsAt: new Date(Date.now() + 86400000 * 2).toISOString(),
}));

const MOCK_SALE_PRODUCTS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 10,
  slug: `product-sale-${i + 1}`,
  name: 'Original Mobile Android Dual SIM Smart Phone G3',
  price: 120,
  originalPrice: 155,
  discountPercent: 34,
  images: [
    new URL(`../assets/img/product-${(i % 8) + 1}.jpg`, import.meta.url).href,
    new URL(`../assets/img/product-${((i + 4) % 8) + 9}.jpg`, import.meta.url).href,
  ],
  rating: 4,
  reviewCount: 18,
}));

const SIDEBAR_CATEGORIES = [
  'الاجهزة المنزلية', 'العاب الأطفال', 'الشواحن', 'المفروشات',
  'الهواتف', 'الملابس', 'الأحذية', 'اكسسوارات', 'مستحضرات التجميل', 'التلفزيونات'
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hero section: Sidebar + Slider */}
      <section className="container-main py-4">
        <div className="flex gap-4">
          {/* Category Sidebar */}
          <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white rounded-2xl shadow-card p-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted px-2 mb-2">
              {t('sidebar.shop_by')}
            </h5>
            <nav className="space-y-0.5 flex-1">
              {SIDEBAR_CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  to={`/products?search=${cat}`}
                  className="block px-3 py-2 text-sm text-dark hover:bg-primary/5 hover:text-primary rounded-lg transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Hero Slider */}
          <HeroSlider />
        </div>
      </section>

      {/* Feature Bar */}
      <FeatureBar />

      {/* Banner row 1 */}
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

      {/* Featured Deals (with countdown) */}
      <section className="container-main py-6">
        <div className="flex items-center justify-between mb-2">
          <SectionTitle title={t('products.featured_deals')} />
          <Link to="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
            {t('products.view_all')} <ChevronRight size={14} className="rtl-flip" />
          </Link>
        </div>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }}
          navigation
          autoplay={{ delay: 5000 }}
          loop
        >
          {MOCK_DEAL_PRODUCTS.map((p) => (
            <SwiperSlide key={p.id}>
              <ProductCard product={p} showCountdown />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Banner row 2 */}
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
        <div className="flex items-center justify-between mb-2">
          <SectionTitle title={t('products.sale')} />
          <Link to="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
            {t('products.view_all')} <ChevronRight size={14} className="rtl-flip" />
          </Link>
        </div>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 }, 1280: { slidesPerView: 5 } }}
          navigation
          autoplay={{ delay: 6000 }}
          loop
        >
          {MOCK_SALE_PRODUCTS.map((p) => (
            <SwiperSlide key={p.id}>
              <ProductCard product={p} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Electronics section with side image */}
      <section className="container-main py-6">
        <SectionTitle title={t('products.electronics')} />
        <div className="flex gap-4">
          {/* Side banner */}
          <Link
            to="/categories/electronics"
            className="hidden lg:block w-48 shrink-0 rounded-xl overflow-hidden"
          >
            <img
              src={bannerSm1}
              alt="electronics"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Products */}
          <div className="flex-1 overflow-hidden">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={16}
              slidesPerView={2}
              breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
              navigation
              autoplay={{ delay: 5500 }}
              loop
            >
              {MOCK_SALE_PRODUCTS.slice(0, 6).map((p) => (
                <SwiperSlide key={p.id}>
                  <ProductCard product={p} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </div>
  );
}
