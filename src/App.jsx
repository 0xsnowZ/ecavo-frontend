import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/common/ErrorFallback';
import router from './router';
import { useLocaleStore } from './store/useLocaleStore';
import { useAuthStore } from './store/useAuthStore';
import { authService } from './services';
import i18n from './i18n';

export default function App() {
  const { fetchRates, language } = useLocaleStore();
  const { setAuth, logout, isAuthenticated } = useAuthStore();

  // ── Session Bootstrap ───────────────────────────────────────────────────────
  // On every app load, silently verify the HTTP-only cookie with the server.
  // This restores Google OAuth sessions (the cookie is set by the callback
  // redirect) and keeps the UI in sync if the cookie expires server-side.
  useEffect(() => {
    // Show a friendly error if Google OAuth failed
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'oauth_failed') {
      // Clean up the URL without a page reload
      window.history.replaceState({}, '', window.location.pathname);
    }

    authService.me()
      .then(res => setAuth(res.data.user))
      .catch(() => {
        // Cookie absent or expired — clear any stale local state
        if (isAuthenticated) logout();
      });
  // Run once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore persisted language into i18n on first mount
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, []);

  // Fetch live exchange rates once per session
  useEffect(() => { fetchRates(); }, []);

  // Sync dir/lang attribute on language change
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </ErrorBoundary>
  );
}

