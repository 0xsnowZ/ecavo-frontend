import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import router from './router';
import { useLocaleStore } from './store/useLocaleStore';

export default function App() {
  const { fetchRates, language } = useLocaleStore();

  // Fetch live exchange rates once on app start (cached for 60 min)
  useEffect(() => {
    fetchRates();
  }, []);

  // Sync dir/lang attribute on language change
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}
