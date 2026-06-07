import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { bannersService } from '../../services';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function HeroSlider() {
  const { i18n } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await bannersService.getAll();
        setBanners(data);
      } catch (error) {
        console.error('Failed to load banners', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 rounded-lg overflow-hidden shadow-card">
        <Skeleton height={400} className="w-full h-full" borderRadius="0.5rem" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null; // or a fallback static image if preferred
  }

  return (
    <div className="hero-slider-wrapper rounded-lg overflow-hidden shadow-card flex-1">
      <Swiper
        key={i18n.language}
        dir={i18n.dir()}
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop={banners.length > 1}
        className="w-full rounded-lg"
      >
        {banners.map((banner, i) => (
          <SwiperSlide key={banner.id}>
            <div className="w-full relative bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-lg" style={{ aspectRatio: '1280 / 575' }}>
              <img
                src={banner.image_url}
                alt={`slide-${i + 1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
