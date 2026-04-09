import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLocaleStore } from '../../../store/useLocaleStore';
import { useAuthStore } from '../../../store/useAuthStore';
import i18n from '../../../i18n';

const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1, country: 'US', label: 'USA' },
  { code: 'EGP', symbol: 'ج', rate: 47, country: 'EG', label: 'Egypt' },
  { code: 'GBP', symbol: '£', rate: 0.79, country: 'UK', label: 'UK' },
  { code: 'AED', symbol: 'د.إ', rate: 3.67, country: 'AE', label: 'UAE' },
];

export default function TopBar() {
  const { t } = useTranslation();
  const { language, currency, setLanguage, setCurrency } = useLocaleStore();
  const { isAuthenticated, user } = useAuthStore();

  const handleLang = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleCurrency = (e) => {
    const cur = CURRENCIES.find((c) => c.country === e.target.value);
    if (cur) setCurrency(cur);
  };

  return (
    <div className="bg-secondary text-white py-1.5">
      <div className="container-main flex items-center justify-between text-xs">
        {/* Welcome message */}
        <p className="hidden sm:block opacity-90">{t('header.welcome')}</p>

        {/* Right side controls */}
        <div className="flex items-center gap-3 ms-auto">
          {/* Currency selector */}
          <select
            value={currency.country}
            onChange={handleCurrency}
            className="bg-white/10 border border-white/20 text-white text-xs rounded-md px-2 py-1 
                       focus:outline-none cursor-pointer hover:bg-white/20 transition-colors"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.country} className="text-dark bg-white">
                {c.label} ({c.symbol})
              </option>
            ))}
          </select>

          {/* Language selector */}
          <select
            value={language}
            onChange={handleLang}
            className="bg-white/10 border border-white/20 text-white text-xs rounded-md px-2 py-1
                       focus:outline-none cursor-pointer hover:bg-white/20 transition-colors"
          >
            <option value="ar" className="text-dark bg-white">العربية</option>
            <option value="en" className="text-dark bg-white">English</option>
          </select>

          <div className="w-px h-3 bg-white/30" />

          {/* Account links */}
          {isAuthenticated ? (
            <Link to="/account" className="opacity-80 hover:opacity-100 transition-opacity">
              {user?.name}
            </Link>
          ) : (
            <>
              <Link to="/login" className="opacity-80 hover:opacity-100 transition-opacity">
                {t('header.sign_in')}
              </Link>
              <Link to="/wishlist" className="opacity-80 hover:opacity-100 transition-opacity">
                {t('header.my_wishlist')}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
