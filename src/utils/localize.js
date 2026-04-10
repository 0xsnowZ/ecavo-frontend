/**
 * Helper to get a localized string from an object based on the current language
 * Fallback order: Requested Lang -> English -> Arabic
 * 
 * @param {Object} item The product, category, or object containing _ar, _en, _fr fields
 * @param {string} field The field base name (e.g., 'name', 'description')
 * @param {string} lang The current language code ('ar', 'en', 'fr')
 * @returns {string} The localized value or empty string
 */
export const getLocalized = (item, field, lang) => {
  if (!item) return '';

  const arVal = item[`${field}_ar`];
  const enVal = item[`${field}_en`];
  const frVal = item[`${field}_fr`];

  if (lang === 'ar') return arVal || enVal || '';
  if (lang === 'fr') return frVal || enVal || arVal || '';
  
  // Default to English
  return enVal || arVal || '';
};
