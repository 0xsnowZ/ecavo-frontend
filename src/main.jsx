import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App.jsx';
import { useLocaleStore } from './store/useLocaleStore';

// Apply stored locale on boot
const { language, direction } = useLocaleStore.getState();
document.documentElement.lang = language;
document.documentElement.dir = direction;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
