import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone } from 'lucide-react';

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
  const { t } = useTranslation();

  return (
    <footer className="bg-dark text-white">
      {/* Main footer */}
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="text-3xl font-black text-white">
              E<span className="text-primary">CAVO</span>
            </Link>
            <div className="flex items-center gap-3 mt-4 bg-white/5 rounded-xl p-4">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Phone size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{t('footer.hotline')}</p>
                <p className="font-bold text-sm">(+100) 123 456 7890</p>
              </div>
            </div>
          </div>

          {/* Link sections */}
          {FOOTER_SECTIONS.map(({ titleKey, links }) => (
            <div key={titleKey}>
              <h6 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">
                {t(titleKey)}
              </h6>
              <ul className="space-y-2">
                {links.map(({ labelKey, to }) => (
                  <li key={labelKey}>
                    <Link
                      to={to}
                      className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-primary rounded-full group-hover:w-2 transition-all" />
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
      <div className="border-t border-white/10">
        <div className="container-main py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} <span className="text-primary font-semibold">ECAVO</span>.{' '}
            {t('footer.copyright')} &mdash; {t('footer.powered_by')}{' '}
            <span className="text-white font-semibold">Mohamed EL GAROUANI</span>
          </p>
          <div className="flex items-center gap-2">
            {[payment1, payment2, payment3, payment4].map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`payment-${i + 1}`}
                className="h-7 object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
