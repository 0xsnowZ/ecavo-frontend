import { Star, StarHalf } from 'lucide-react';

export default function StarRating({ rating = 0, count = null, size = 14 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Star key={i} size={size} className="text-yellow-400 fill-yellow-400" />);
    } else if (i - rating < 1) {
      stars.push(<StarHalf key={i} size={size} className="text-yellow-400 fill-yellow-400" />);
    } else {
      stars.push(<Star key={i} size={size} className="text-gray-300" />);
    }
  }
  return (
    <div className="flex items-center gap-0.5">
      {stars}
      {count !== null && (
        <span className="text-xs text-muted ms-1">({count})</span>
      )}
    </div>
  );
}
