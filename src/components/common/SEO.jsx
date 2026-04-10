import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'ECAVO';
const DEFAULT_DESC = 'تسوق أفضل المنتجات بأسعار لا تُقاوم. أجهزة كهربائية، ملابس، موبايلات، أدوات منزلية وأكثر.';

/**
 * SEO — injects <title>, <meta description>, Open Graph tags
 *
 * Usage:
 *   <SEO title="Products" descriptionAr="..." />
 *   <SEO title="Product Name" image="/img/product.jpg" noIndex />
 */
export default function SEO({
  titleAr,
  titleEn,
  descriptionAr = DEFAULT_DESC,
  descriptionEn = 'Shop the best products at unbeatable prices.',
  image = '/og-image.jpg',
  noIndex = false,
  lang = 'ar',
}) {
  const title  = lang === 'ar' ? titleAr : titleEn;
  const desc   = lang === 'ar' ? descriptionAr : descriptionEn;
  const full   = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url    = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Helmet>
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      <title>{full}</title>
      <meta name="description" content={desc} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={full} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={full} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
