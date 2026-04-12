/**
 * resolveImageUrl
 *
 * Ensures a product image URL is absolute and serves from the API origin.
 *
 * Handles three cases:
 *   1. Already absolute (http/https)           → returned as-is
 *   2. Relative storage path (/storage/...)    → prepend API base URL
 *   3. Null / undefined                        → return fallback placeholder
 */
const API_ORIGIN = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8001';

export function resolveImageUrl(url, fallback = '/placeholder-product.png') {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/storage/') || url.startsWith('/images/')) return `${API_ORIGIN}${url}`;
  return url;
}

/**
 * resolveImages — maps an images array through resolveImageUrl
 */
export function resolveImages(images = [], fallback) {
  if (!Array.isArray(images) || images.length === 0) return fallback ? [fallback] : [];
  return images.map(u => resolveImageUrl(u, fallback)).filter(Boolean);
}
