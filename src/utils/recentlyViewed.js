const KEY = 'rv_product_ids'; // recently-viewed product ids
const MAX = 10;

/** Returns the stored list of product IDs (most-recent first). */
export function getRvIds() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]').map(Number);
  } catch {
    return [];
  }
}

/**
 * Pushes a product ID to the front of the list.
 * Deduplicates and truncates to MAX items.
 */
export function pushRvId(productId) {
  const id = Number(productId);
  const existing = getRvIds().filter((i) => i !== id);
  const updated = [id, ...existing].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

/** Clears the list — called on logout so the next user starts fresh. */
export function clearRvIds() {
  localStorage.removeItem(KEY);
}
