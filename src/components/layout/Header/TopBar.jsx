import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLocaleStore, CURRENCIES, LANGUAGES } from '../../../store/useLocaleStore';
import { useAuthStore } from '../../../store/useAuthStore';

export default function TopBar() {
  const { t } = useTranslation();
  const { language, currency, setLanguage, setCurrency } = useLocaleStore();
  const { isAuthenticated, user } = useAuthStore();

  const handleLang = (e) => {
    setLanguage(e.target.value);
  };

  const handleCurrency = (e) => {
    setCurrency(e.target.value);
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
            value={currency.code}
            onChange={handleCurrency}
            className="bg-white/10 border border-white/20 text-white text-xs rounded-md px-2 py-1 
                       focus:outline-none cursor-pointer hover:bg-white/20 transition-colors"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="text-dark bg-white">
                {c.flag} {c.code} ({c.symbol})
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
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="text-dark bg-white">
                {l.flag} {l.label}
              </option>
            ))}
          </select>

          <div className="w-px h-3 bg-white/30" />

          {/* Account links */}
          <Link to="/wishlist" className="opacity-80 hover:opacity-100 transition-opacity">
            {t('header.my_wishlist')}
          </Link>
          {isAuthenticated ? (
            <Link to="/account" className="opacity-80 hover:opacity-100 transition-opacity">
              {user?.name}
            </Link>
          ) : (
            <Link to="/login" className="opacity-80 hover:opacity-100 transition-opacity">
              {t('header.sign_in')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
