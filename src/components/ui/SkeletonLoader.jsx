import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * Reusable skeleton loader component
 * Wraps react-loading-skeleton with dark mode support
 */
export default function SkeletonLoader({ count = 1, height, width, circle, className }) {
  return (
    <Skeleton
      count={count}
      height={height}
      width={width}
      circle={circle}
      baseColor="rgba(128, 128, 128, 0.2)"
      highlightColor="rgba(128, 128, 128, 0.1)"
      className={className}
    />
  );
}
