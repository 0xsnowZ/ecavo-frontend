import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

import payment1 from '../../assets/img/payment-1.png';
import payment2 from '../../assets/img/payment-2.png';
import payment3 from '../../assets/img/payment-3.png';
import payment4 from '../../assets/img/payment-4.png';

const FOOTER_SECTIONS = [
  {
    titleKey: 'footer.about_us',
    links: [
      { labelKey: 'footer.about_ecavo', to: '/about' },
      { labelKey: 'footer.shipping', to: '/shipping' },
    ],
  },
  {
    titleKey: 'footer.shop_with_us',
    links: [
      { labelKey: 'footer.account', to: '/account' },
      { labelKey: 'footer.purchases', to: '/account' },
      { labelKey: 'footer.addresses', to: '/account' },
      { labelKey: 'footer.lists', to: '/wishlist' },
    ],
  },
  {
    titleKey: 'footer.help',
    links: [
      { labelKey: 'footer.support', to: '/support' },
      { labelKey: 'footer.track_order', to: '/account' },
      { labelKey: 'footer.returns', to: '/returns' },
      { labelKey: 'footer.terms', to: '/terms' },
    ],
  },
];

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const isFr = i18n.language === 'fr';

  const brandDesc = isAr
    ? 'وجهتكم الأولى للتسوق الإلكتروني الراقي في المنطقة. منتجات أصلية 100%، وتوصيل سريع موثوق مع تجربة دفع آمنة وسلسة.'
    : isFr
    ? "Votre destination privilégiée pour l'électronique de pointe, la maison et la mode. Produits 100% authentiques avec livraison rapide et sécurisée."
    : 'Your premier destination for curated electronics, home appliances, and lifestyle fashion. 100% authentic quality with swift delivery and verified checkout.';

  return (
    <footer className="bg-dark text-white">
      {/* Trust & Guarantees bar */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="container-main py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Truck size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('features.free_shipping')}</p>
              <p className="text-[11px] text-gray-400">{t('features.free_shipping_desc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('features.secure_payment')}</p>
              <p className="text-[11px] text-gray-400">256-Bit SSL Encrypted</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <RotateCcw size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('features.money_guarantee')}</p>
              <p className="text-[11px] text-gray-400">{t('features.money_guarantee_desc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Headphones size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('features.support')}</p>
              <p className="text-[11px] text-gray-400">{t('features.support_desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <BrandLogo size="lg" variant="white" />
            <p className="text-xs text-gray-400 leading-relaxed">
              {brandDesc}
            </p>

            {/* Hotline card */}
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Phone size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400">{t('footer.hotline')}</p>
                <a href="tel:+212522987654" className="font-bold text-sm text-white hover:text-primary transition-colors">
                  +212 522 98 76 54
                </a>
              </div>
            </div>

            {/* Email info */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Mail size={14} className="text-primary" />
              <a href="mailto:support@ecavo.com" className="hover:text-white transition-colors">
                support@ecavo.com
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-all flex items-center justify-center text-gray-400 hover:scale-110"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-all flex items-center justify-center text-gray-400 hover:scale-110"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-all flex items-center justify-center text-gray-400 hover:scale-110"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-all flex items-center justify-center text-gray-400 hover:scale-110"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                  <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link sections */}
          {FOOTER_SECTIONS.map(({ titleKey, links }) => (
            <div key={titleKey}>
              <h6 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">
                {t(titleKey)}
              </h6>
              <ul className="space-y-2.5">
                {links.map(({ labelKey, to }) => (
                  <li key={labelKey}>
                    <Link
                      to={to}
                      className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-primary/60 rounded-full group-hover:bg-primary group-hover:w-2.5 transition-all" />
                      {t(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="container-main py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} <span className="text-primary font-bold">ECAVO</span>. {t('footer.copyright')} &mdash; {t('footer.powered_by')}{' '}
            <span className="text-white font-medium">Mohamed EL GAROUANI</span>
          </p>
          <div className="flex items-center gap-2">
            {[payment1, payment2, payment3, payment4].map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`payment-${i + 1}`}
                className="h-6 object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
