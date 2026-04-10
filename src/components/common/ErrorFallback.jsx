import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ErrorFallback({ error, resetErrorBoundary }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        We encountered an unexpected error. Our team has been notified. Please try reloading the page.
      </p>
      
      {import.meta.env.DEV && (
        <pre className="text-sm text-left bg-gray-800 text-red-400 p-4 rounded mb-6 max-w-2xl overflow-auto">
          {error.message}
        </pre>
      )}

      <button
        onClick={resetErrorBoundary}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Reload Application
      </button>
    </div>
  );
}
