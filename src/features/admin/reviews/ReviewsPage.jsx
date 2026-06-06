import { useEffect, useState, useCallback } from 'react';
import { useLocaleStore } from '../../../store/useLocaleStore';
import { Search, RefreshCw, Check, Trash2, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '../../../services';
import SkeletonLoader from '../../../components/ui/SkeletonLoader';
import Spinner from '../../../components/ui/Spinner';

const FILTER_OPTIONS = [
  { value: '',      labelAr: 'جميع التقييمات', labelEn: 'All Reviews',    labelFr: 'Tous les avis' },
  { value: 'false', labelAr: 'في الانتظار',    labelEn: 'Pending',        labelFr: 'En attente' },
  { value: 'true',  labelAr: 'معتمدة',          labelEn: 'Approved',       labelFr: 'Approuvés' },
];

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}
        />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const { language } = useLocaleStore();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const [reviews, setReviews]           = useState([]);
  const [meta, setMeta]                 = useState({ total: 0, last_page: 1, current_page: 1 });
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterApproved, setFilter]     = useState('');
  const [page, setPage]                 = useState(1);
  const [actionLoading, setActionLoading] = useState(null); // review id being acted on

  const fetchReviews = useCallback(() => {
    setLoading(true);
    const params = { page, per_page: 20, search };
    if (filterApproved !== '') params.approved = filterApproved;
    adminService.reviews
      .list(params)
      .then((r) => {
        setReviews(r.data.data || []);
        setMeta(r.data.meta || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, filterApproved, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleApprove = async (id) => {
    setActionLoading(id + '-approve');
    try {
      await adminService.reviews.approve(id);
      toast.success(isAr ? 'تمت الموافقة على التقييم ✓' : isFr ? 'Avis approuvé ✓' : 'Review approved ✓');
      fetchReviews();
    } catch {
      toast.error(isAr ? 'حدث خطأ' : 'Error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isAr ? 'هل تريد حذف هذا التقييم؟' : 'Delete this review?')) return;
    setActionLoading(id + '-delete');
    try {
      await adminService.reviews.delete(id);
      toast.success(isAr ? 'تم حذف التقييم' : isFr ? 'Avis supprimé' : 'Review deleted');
      fetchReviews();
    } catch {
      toast.error(isAr ? 'حدث خطأ' : 'Error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      {loading ? (
        <>
          <SkeletonLoader height={28} width={200} />
          <div className="card p-4 flex flex-col sm:flex-row gap-3">
            <SkeletonLoader height={42} className="flex-1" />
            <SkeletonLoader height={42} width={160} />
            <SkeletonLoader height={42} width={42} />
          </div>
          <div className="card p-6 space-y-4">
            {[...Array(5)].map((_, i) => <SkeletonLoader key={i} height={64} />)}
          </div>
        </>
      ) : (
        <>
          <h1 className="text-xl font-black text-secondary dark:text-white">
            {isAr ? 'إدارة التقييمات' : isFr ? 'Modération des Avis' : 'Reviews Moderation'}
          </h1>

          {/* Filters */}
          <div className="card p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder={isAr ? 'بحث في التعليقات أو الأسماء...' : isFr ? 'Rechercher...' : 'Search comments or names...'}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-field ps-9"
              />
            </div>
            <select
              value={filterApproved}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="input-field w-auto"
            >
              {FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {isAr ? o.labelAr : isFr ? o.labelFr : o.labelEn}
                </option>
              ))}
            </select>
            <button onClick={fetchReviews} className="btn-ghost px-3" title="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm admin-table">
                <thead className="bg-surface dark:bg-gray-900/50">
                  <tr>
                    {[
                      isAr ? 'المنتج' : isFr ? 'Produit' : 'Product',
                      isAr ? 'المستخدم' : isFr ? 'Utilisateur' : 'User',
                      isAr ? 'التقييم' : isFr ? 'Note' : 'Rating',
                      isAr ? 'التعليق' : isFr ? 'Commentaire' : 'Comment',
                      isAr ? 'الحالة' : isFr ? 'Statut' : 'Status',
                      isAr ? 'التاريخ' : isFr ? 'Date' : 'Date',
                      isAr ? 'إجراء' : isFr ? 'Actions' : 'Actions',
                    ].map((h) => (
                      <th key={h} className="text-start px-4 py-3 text-xs font-semibold text-muted dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-gray-700">
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted dark:text-gray-400 text-sm">
                        {isAr ? 'لا توجد تقييمات' : isFr ? 'Aucun avis' : 'No reviews found'}
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-surface/60 dark:hover:bg-gray-700/30 transition-colors">
                        {/* Product */}
                        <td className="px-4 py-3 font-medium text-dark dark:text-gray-200 max-w-[140px] truncate">
                          {isAr ? review.product?.name_ar : review.product?.name_en || '—'}
                        </td>
                        {/* User */}
                        <td className="px-4 py-3 text-muted dark:text-gray-400 whitespace-nowrap">
                          {review.user?.name || '—'}
                        </td>
                        {/* Rating */}
                        <td className="px-4 py-3">
                          <StarRating rating={review.rating} />
                        </td>
                        {/* Comment */}
                        <td className="px-4 py-3 text-dark dark:text-gray-200 max-w-[200px]">
                          <span className="line-clamp-2 text-xs">{review.comment || '—'}</span>
                        </td>
                        {/* Status badge */}
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                            review.approved
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300'
                          }`}>
                            {review.approved
                              ? (isAr ? 'معتمد' : isFr ? 'Approuvé' : 'Approved')
                              : (isAr ? 'انتظار' : isFr ? 'En attente' : 'Pending')}
                          </span>
                        </td>
                        {/* Date */}
                        <td className="px-4 py-3 text-muted dark:text-gray-400 text-xs whitespace-nowrap">
                          {review.created_at?.split('T')[0] || review.created_at?.split(' ')[0] || '—'}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {!review.approved && (
                              <button
                                onClick={() => handleApprove(review.id)}
                                disabled={actionLoading === review.id + '-approve'}
                                title={isAr ? 'موافقة' : 'Approve'}
                                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === review.id + '-approve'
                                  ? <Loader2 size={14} className="animate-spin" />
                                  : <Check size={14} />}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(review.id)}
                              disabled={actionLoading === review.id + '-delete'}
                              title={isAr ? 'حذف' : 'Delete'}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === review.id + '-delete'
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Trash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
              <div className="px-4 py-3 border-t border-border dark:border-gray-700 flex items-center justify-between text-xs text-muted dark:text-gray-400">
                <span>
                  {isAr ? `${meta.total} تقييم` : isFr ? `${meta.total} avis` : `${meta.total} reviews`}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg font-semibold transition-colors
                        ${p === page ? 'bg-primary text-white' : 'text-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
