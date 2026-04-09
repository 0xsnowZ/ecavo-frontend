import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLocaleStore = create(
  persist(
    (set) => ({
      language: 'ar',
      currency: {
        code: 'USD',
        symbol: '$',
        rate: 1,
        country: 'US',
      },
      direction: 'rtl',

      setLanguage: (lang) => {
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        document.documentElement.dir = dir;
        set({ language: lang, direction: dir });
      },

      setCurrency: (currencyObj) => {
        set({ currency: currencyObj });
      },

      formatPrice: (priceInUSD) => {
        // will be called as selector, not stored
        return priceInUSD;
      },
    }),
    {
      name: 'ecavo-locale',
    }
  )
);

// Utility hook for formatted prices
export const useFormattedPrice = (priceInUSD) => {
  const { currency } = useLocaleStore();
  const converted = (priceInUSD * currency.rate).toFixed(2);
  return `${currency.symbol}${converted}`;
};
