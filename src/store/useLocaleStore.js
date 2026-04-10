import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';

// Static fallback rates (USD base). Refreshed from open.er-api.com on mount.
const FALLBACK_RATES = {
  USD: 1,
  MAD: 10.06,  // Moroccan Dirham
  EGP: 30.9,   // Egyptian Pound
  SAR: 3.75,   // Saudi Riyal
  AED: 3.67,   // UAE Dirham
  EUR: 0.92,   // Euro
  GBP: 0.79,   // British Pound
};

const CURRENCIES = [
  { code: 'USD', symbol: '$',  flag: '🇺🇸', label: 'US Dollar' },
  { code: 'MAD', symbol: 'DH', flag: '🇲🇦', label: 'Dirham Marocain' },
  { code: 'EGP', symbol: 'ج.م', flag: '🇪🇬', label: 'الجنيه المصري' },
  { code: 'SAR', symbol: 'ر.س', flag: '🇸🇦', label: 'الريال السعودي' },
  { code: 'AED', symbol: 'د.إ', flag: '🇦🇪', label: 'الدرهم الإماراتي' },
  { code: 'EUR', symbol: '€',  flag: '🇪🇺', label: 'Euro' },
  { code: 'GBP', symbol: '£',  flag: '🇬🇧', label: 'British Pound' },
];

const LANGUAGES = [
  { code: 'ar', label: 'العربية',  flag: '🇲🇦', dir: 'rtl' },
  { code: 'en', label: 'English',  flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
];

const useLocaleStore = create(
  persist(
    (set, get) => ({
      language:   'ar',
      currency:   { code: 'USD', symbol: '$', rate: 1, flag: '🇺🇸' },
      rates:      FALLBACK_RATES,
      ratesUpdatedAt: null,

      languages:  LANGUAGES,
      currencies: CURRENCIES,

      setLanguage(code) {
        const lang = LANGUAGES.find(l => l.code === code);
        if (!lang) return;
        set({ language: code });
        i18n.changeLanguage(code);
        document.documentElement.setAttribute('dir', lang.dir);
        document.documentElement.setAttribute('lang', code);
      },

      setCurrency(code) {
        const found = CURRENCIES.find(c => c.code === code);
        if (!found) return;
        const rate = get().rates[code] ?? 1;
        set({ currency: { code, symbol: found.symbol, rate, flag: found.flag, label: found.label } });
      },

      /** Fetch live rates from free open-source API (no key required) */
      async fetchRates() {
        const now = Date.now();
        const updatedAt = get().ratesUpdatedAt;
        // Only re-fetch every 60 minutes
        if (updatedAt && now - updatedAt < 60 * 60 * 1000) return;

        try {
          const res  = await fetch('https://open.er-api.com/v6/latest/USD');
          const data = await res.json();
          if (data.result === 'success') {
            const rates = data.rates;
            const currentCode = get().currency.code;
            set({
              rates,
              ratesUpdatedAt: now,
              // Update current currency rate live
              currency: {
                ...get().currency,
                rate: rates[currentCode] ?? 1,
              },
            });
          }
        } catch {
          // Silently fall back to static rates
        }
      },
    }),
    {
      name: 'ecavo-locale',
      partialize: (s) => ({
        language: s.language,
        currency: s.currency,
        rates: s.rates,
        ratesUpdatedAt: s.ratesUpdatedAt,
      }),
    }
  )
);

export { CURRENCIES, LANGUAGES };
export { useLocaleStore };
export default useLocaleStore;
