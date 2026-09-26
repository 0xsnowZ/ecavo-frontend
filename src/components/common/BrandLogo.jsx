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
}) {
  const sizeConfig = {
    sm: { icon: 24, text: 'text-lg', badge: 'text-[9px]' },
    md: { icon: 30, text: 'text-2xl', badge: 'text-[10px]' },
    lg: { icon: 38, text: 'text-3xl', badge: 'text-xs' },
    xl: { icon: 48, text: 'text-4xl', badge: 'text-xs' },
  }[size] || { icon: 30, text: 'text-2xl', badge: 'text-[10px]' };

  const isWhite = variant === 'white';
  const isDark = variant === 'dark';
  const isIconOnly = variant === 'icon-only';

  const logoContent = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon SVG */}
      <svg
        width={sizeConfig.icon}
        height={sizeConfig.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id={`ecavo-grad-${size}`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF525D" />
            <stop offset="100%" stopColor="#E63946" />
          </linearGradient>
          <linearGradient id={`ecavo-handle-${size}`} x1="16" y1="4" x2="32" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isWhite ? "#E2E8F0" : "#1D3557"} />
            <stop offset="100%" stopColor={isWhite ? "#CBD5E1" : "#0F1F38"} />
          </linearGradient>
        </defs>
        {/* Handle */}
        <path
          d="M17 16V11C17 7.134 20.134 4 24 4C27.866 4 31 7.134 31 11V16"
          stroke={`url(#ecavo-handle-${size})`}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Main Bag Body */}
        <rect
          x="7"
          y="15"
          width="34"
          height="28"
          rx="8"
          fill={`url(#ecavo-grad-${size})`}
        />
        {/* Monogram E */}
        <path
          d="M18 24H30M18 29H27M18 34H30"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Accent Sparkle */}
        <circle cx="34" cy="20.5" r="1.8" fill="#FFF2F3" />
      </svg>

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
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary ms-0.5 mb-2" />
          </div>
          {subtitle && (
            <span
              className={`${sizeConfig.badge} font-bold uppercase tracking-wider text-muted dark:text-gray-400 -mt-0.5`}
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
