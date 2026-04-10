import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, Grid2X2, List, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { productsService, categoriesService } from '../services';
import ProductCard from '../components/product/ProductCard';
import Skeleton from '../components/ui/Skeleton';
import SEO from '../components/common/SEO';
import { resolveImages } from '../utils/imageUrl';

const SORT_OPTIONS = [
  { value: 'latest',     labelAr: 'الأحدث',        labelEn: 'Latest' },
  { value: 'price_asc',  labelAr: 'السعر: الأقل',  labelEn: 'Price: Low to High' },
  { value: 'price_desc', labelAr: 'السعر: الأعلى', labelEn: 'Price: High to Low' },
  { value: 'popular',    labelAr: 'الأكثر شعبية',  labelEn: 'Most Popular' },
  { value: 'discount',   labelAr: 'أكبر خصم',      labelEn: 'Biggest Discount' },
];

export default function Products() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAr = i18n.language === 'ar';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid | list

  // Params from URL
  const page     = parseInt(searchParams.get('page') || '1');
  const sort     = searchParams.get('sort') || 'latest';
  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) { p.set(key, value); } else { p.delete(key); }
    if (key !== 'page') p.delete('page');
    setSearchParams(p);
  };

  // Load categories once
  useEffect(() => {
    categoriesService.all().then(r => setCategories(r.data.data || []));
  }, []);

  // Load products when params change
  useEffect(() => {
    setLoading(true);
    productsService.list({ page, sort, category, search, min_price: minPrice, max_price: maxPrice, per_page: 16 })
      .then(r => {
        setProducts(r.data.data || []);
        setMeta(r.data.meta || { total: 0, current_page: 1, last_page: 1 });
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [page, sort, category, search, minPrice, maxPrice]);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold text-sm text-secondary mb-3 uppercase tracking-wide">
          {t('common.categories')}
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => setParam('category', '')}
            className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors
              ${!category ? 'bg-primary/10 text-primary font-semibold' : 'text-dark hover:bg-gray-100'}`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          {categories.map(c => (
            <button
              key={c.slug}
              onClick={() => setParam('category', c.slug)}
              className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors
                ${category === c.slug ? 'bg-primary/10 text-primary font-semibold' : 'text-dark hover:bg-gray-100'}`}
            >
              {isAr ? c.name_ar : c.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-sm text-secondary mb-3 uppercase tracking-wide">
          {isAr ? 'نطاق السعر' : 'Price Range'}
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={isAr ? 'من' : 'Min'}
            value={minPrice}
            onChange={e => setParam('min_price', e.target.value)}
            className="input-field w-full"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            placeholder={isAr ? 'إلى' : 'Max'}
            value={maxPrice}
            onChange={e => setParam('max_price', e.target.value)}
            className="input-field w-full"
          />
        </div>
      </div>

      {/* Reset */}
      {(category || minPrice || maxPrice) && (
        <button
          onClick={() => setSearchParams({})}
          className="w-full btn-outline text-sm py-2 justify-center"
        >
          <X size={14} />
          {isAr ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
        </button>
      )}
    </div>
  );

  return (
    <>
      <SEO
        titleAr={search ? `نتائج: "${search}"` : (category ? category : 'كل المنتجات')}
        titleEn={search ? `Results: "${search}"` : (category ? category : 'All Products')}
        descriptionAr="تصفح أفضل المنتجات بأسعار مميزة مع إيكافو."
        descriptionEn="Browse top products at great prices with ECAVO."
        lang={isAr ? 'ar' : 'en'}
      />
      <div className="container-main py-8">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Sidebar Filters (desktop) ── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="section-title text-lg mb-4">
              {isAr ? 'تصفية النتائج' : 'Filter Results'}
            </h2>
            <FilterPanel />
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">

          {/* Top bar: results count + sort + view toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              {search && (
                <p className="text-sm text-muted mb-1">
                  {isAr ? `نتائج البحث عن: "${search}"` : `Results for: "${search}"`}
                </p>
              )}
              <p className="text-sm text-muted">
                {isAr ? `${meta.total} منتج` : `${meta.total} products`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile filter button */}
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden btn-ghost text-sm py-2 border border-border"
              >
                <SlidersHorizontal size={16} />
                {isAr ? 'فلتر' : 'Filter'}
              </button>

              {/* Sort */}
              <select
                value={sort}
                onChange={e => setParam('sort', e.target.value)}
                className="input-field w-auto text-sm"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>
                    {isAr ? o.labelAr : o.labelEn}
                  </option>
                ))}
              </select>

              {/* View toggle */}
              <div className="hidden sm:flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted hover:bg-gray-100'}`}
                >
                  <Grid2X2 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted hover:bg-gray-100'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }, (_, i) => <Skeleton.Card key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-2xl text-gray-300 mb-2">🔍</p>
              <p className="text-muted">{isAr ? 'لا توجد منتجات' : 'No products found'}</p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col gap-4'
            }>
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    slug: p.slug,
                    name: isAr ? p.name_ar : p.name_en,
                    price: parseFloat(p.price),
                    originalPrice: p.original_price ? parseFloat(p.original_price) : null,
                    discountPercent: p.discount_percent,
                    images: resolveImages(p.images),
                    rating: parseFloat(p.avg_rating) || 0,
                    reviewCount: p.review_count || 0,
                    dealEndsAt: p.deal_ends_at,
                  }}
                  showCountdown={!!p.deal_ends_at}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setParam('page', page - 1)}
                className="btn-ghost p-2 disabled:opacity-40"
              >
                <ChevronLeft size={18} className="rtl-flip" />
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setParam('page', p)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors
                    ${p === page ? 'bg-primary text-white' : 'text-muted hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= meta.last_page}
                onClick={() => setParam('page', page + 1)}
                className="btn-ghost p-2 disabled:opacity-40"
              >
                <ChevronRight size={18} className="rtl-flip" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filters Drawer ── */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="relative ms-auto w-72 h-full bg-white shadow-2xl p-5 overflow-y-auto animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-secondary">{isAr ? 'الفلاتر' : 'Filters'}</h2>
              <button onClick={() => setFiltersOpen(false)} className="text-muted hover:text-dark">
                <X size={20} />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
      </div>
    </>
  );
}
