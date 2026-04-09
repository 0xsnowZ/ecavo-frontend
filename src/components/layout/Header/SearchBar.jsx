import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-xl">
      <div className="flex rounded-lg overflow-hidden border-2 border-primary/30 focus-within:border-primary transition-colors">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('header.search_placeholder')}
          className="flex-1 px-4 py-2.5 text-sm focus:outline-none bg-white"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 font-semibold text-sm transition-colors flex items-center gap-1.5"
        >
          <Search size={16} />
          <span className="hidden sm:inline">{t('header.search_button')}</span>
        </button>
      </div>
    </form>
  );
}
