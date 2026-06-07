import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { reviewsService } from '../../services';
import Spinner from '../ui/Spinner';

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          className="p-1 transition-transform hover:scale-110"
          onMouseEnter={() => setHover(num)}
          onClick={() => onChange(num)}
        >
          <Star
            size={24}
            className={`transition-colors ${
              num <= (hover || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewForm({ orderItemId, onSuccess }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const isFr = i18n.language === 'fr';
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error(
        isAr ? 'يرجى اختيار تقييم' :
        isFr ? 'Veuillez sélectionner une note' :
        'Please select a rating'
      );
      return;
    }

    setSubmitting(true);
    try {
      await reviewsService.submit({ order_item_id: orderItemId, rating, comment });
      toast.success(
        isAr ? 'تم إرسال تقييمك! سيظهر بعد المراجعة.' :
        isFr ? 'Avis soumis ! Il apparaîtra après modération.' :
        'Review submitted! It will appear after moderation.'
      );
      onSuccess?.();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(
          isAr ? 'لقد قمت بتقييم هذا المنتج مسبقاً.' :
          isFr ? 'Vous avez déjà évalué ce produit.' :
          'You already reviewed this product.'
        );
      } else {
        toast.error(
          isAr ? 'فشل في إرسال التقييم.' :
          isFr ? 'Échec de la soumission de l\'avis.' :
          'Failed to submit review.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">
          {isAr ? 'تقييمك' : isFr ? 'Votre note' : 'Your Rating'}
        </label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          {isAr ? 'تعليقك (اختياري)' : isFr ? 'Votre commentaire (optionnel)' : 'Your Review (optional)'}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            isAr ? 'شارك تجربتك مع هذا المنتج...' :
            isFr ? 'Partagez votre expérience avec ce produit...' :
            'Share your experience with this product...'
          }
          className="input-field min-h-[100px] resize-y"
          maxLength={1000}
        />
        <div className="text-xs text-muted text-end mt-1">
          {comment.length}/1000
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !rating}
        className="btn-primary w-full sm:w-auto px-8"
      >
        {submitting ? (
          <Spinner size="sm" className="text-white" />
        ) : (
          isAr ? 'إرسال التقييم' : isFr ? 'Soumettre l\'avis' : 'Submit Review'
        )}
      </button>
    </form>
  );
}
