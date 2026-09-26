import { Link } from 'react-router-dom';

/**
 * BrandLogo — Official ECAVO brand emblem and typography.
 *
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} variant - 'default' | 'white' | 'dark' | 'icon-only'
 * @param {string} subtitle - optional badge or subtitle under the name (e.g. 'ADMIN')
 * @param {boolean} linkTo - path to navigate to, defaults to '/'
 * @param {string} className - extra classes on wrapper
 */
export default function BrandLogo({
  size = 'md',
  variant = 'default',
  subtitle = null,
  linkTo = '/',
  className = '',
  showIcon = false,
}) {
  const sizeConfig = {
    sm: { icon: 24, text: 'text-lg', dot: 'w-1.5 h-1.5', badge: 'text-[9px]' },
    md: { icon: 30, text: 'text-2xl', dot: 'w-2 h-2', badge: 'text-[10px]' },
    lg: { icon: 38, text: 'text-3xl', dot: 'w-2.5 h-2.5', badge: 'text-xs' },
    xl: { icon: 48, text: 'text-4xl', dot: 'w-3.5 h-3.5', badge: 'text-xs' },
  }[size] || { icon: 30, text: 'text-2xl', dot: 'w-2 h-2', badge: 'text-[10px]' };

  const isWhite = variant === 'white';
  const isDark = variant === 'dark';
  const isIconOnly = variant === 'icon-only';
  const shouldRenderIcon = showIcon || isIconOnly;

  const logoContent = (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Brand Icon SVG (only when showIcon or icon-only is requested) */}
      {shouldRenderIcon && (
        <svg
          width={sizeConfig.icon}
          height={sizeConfig.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-300 hover:scale-105"
        >
          {/* Handle in warm orange/peach */}
          <path
            d="M17 17V10C17 6.134 20.134 3 24 3C27.866 3 31 6.134 31 10V17"
            stroke="#F4A261"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Main Bag Body */}
          <rect
            x="6"
            y="15"
            width="36"
            height="30"
            rx="9"
            fill="#E63946"
          />
          {/* White Monogram E Stripes */}
          <rect x="15" y="22" width="16" height="3.5" rx="1.75" fill="#FFFFFF" />
          <rect x="15" y="28" width="11" height="3.5" rx="1.75" fill="#FFFFFF" />
          <rect x="15" y="34" width="16" height="3.5" rx="1.75" fill="#FFFFFF" />
          {/* White Accent Dot */}
          <circle cx="34" cy="20" r="1.8" fill="#FFFFFF" />
        </svg>
      )}

      {/* Typography */}
      {!isIconOnly && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span
              className={`${sizeConfig.text} font-black tracking-tight ${
                isWhite
                  ? 'text-white'
                  : isDark
                  ? 'text-gray-900 dark:text-white'
                  : 'text-secondary dark:text-white'
              }`}
            >
              E<span className="text-primary">CAVO</span>
            </span>
            <span
              className={`inline-block rounded-full bg-primary ms-1 shrink-0 ${sizeConfig.dot}`}
            />
          </div>
          {subtitle && (
            <span
              className={`${sizeConfig.badge} font-bold uppercase tracking-wider text-muted dark:text-gray-400 mt-1`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!linkTo) {
    return logoContent;
  }

  return (
    <Link to={linkTo} className="inline-flex items-center focus:outline-none">
      {logoContent}
    </Link>
  );
}
