import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar.json';
import en from './en.json';
import fr from './fr.json';

// Read persisted language from Zustand localStorage (before store loads)
function getPersistedLanguage() {
  try {
    const stored = localStorage.getItem('ecavo-locale');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.language || 'ar';
    }
  } catch {/* ignore */}
  return 'ar';
}

const initialLanguage = getPersistedLanguage();

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
