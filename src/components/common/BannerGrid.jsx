import { Link } from 'react-router-dom';

export default function BannerGrid({ banners, cols = 3 }) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
  };

  return (
    <div className={`grid ${gridCols[cols] || gridCols[3]} gap-4`}>
      {banners.map(({ src, to, alt }, i) => (
        <Link
          key={i}
          to={to || '/products'}
          className="relative rounded-lg overflow-hidden group block"
        >
          <img
            src={src}
            alt={alt || ''}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </Link>
      ))}
    </div>
  );
}
