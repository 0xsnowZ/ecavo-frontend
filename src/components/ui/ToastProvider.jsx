import { Toaster } from 'sonner';
import { useThemeStore } from '../store/useThemeStore';

/**
 * Toast notification component
 * Uses Sonner for beautiful, modern notifications
 */
export default function ToastProvider() {
  const { dark } = useThemeStore();

  return (
    <Toaster
      position="top-right"
      richColors
      expand={false}
      theme={dark ? 'dark' : 'light'}
      toastOptions={{
        duration: 3000,
        style: {
          background: dark ? '#1a1a25' : '#fff',
          border: '1px solid rgba(128, 128, 128, 0.2)',
        },
      }}
    />
  );
}
