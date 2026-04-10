/**
 * Skeleton — shimmer loading placeholder components
 * Usage: <Skeleton className="h-4 w-32" />
 *        <Skeleton.Card />   — product card skeleton
 *        <Skeleton.Row />    — table row skeleton
 */

function Skeleton({ className = '' }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded-lg animate-pulse ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

Skeleton.Card = function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

Skeleton.Row = function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={`h-4 ${i === 0 ? 'w-20' : 'w-full'}`} />
        </td>
      ))}
    </tr>
  );
};

Skeleton.Text = function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
};

Skeleton.ProductDetail = function SkeletonProductDetail() {
  return (
    <div className="container-main py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton.Text lines={4} />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
