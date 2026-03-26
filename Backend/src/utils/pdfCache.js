const NodeCache = require('node-cache');

// Initialize cache with TTL of 600 seconds (10 minutes)
const pdfCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

/**
 * Get PDF from cache or null if not found
 * @param {string} certificateId - Certificate ID
 * @returns {Buffer|null} - PDF buffer or null
 */
const getPDF = (certificateId) => {
  const cacheKey = `pdf:${certificateId.toUpperCase()}`;
  return pdfCache.get(cacheKey) || null;
};

/**
 * Store PDF in cache
 * @param {string} certificateId - Certificate ID
 * @param {Buffer} pdfBuffer - PDF buffer to cache
 * @returns {void}
 */
const setPDF = (certificateId, pdfBuffer) => {
  const cacheKey = `pdf:${certificateId.toUpperCase()}`;
  pdfCache.set(cacheKey, pdfBuffer, 600); // TTL: 600 seconds
  console.log(`✓ PDF cached: ${cacheKey}`);
};

/**
 * Invalidate cached PDF (useful when student record is updated)
 * @param {string} certificateId - Certificate ID
 * @returns {void}
 */
const invalidatePDF = (certificateId) => {
  const cacheKey = `pdf:${certificateId.toUpperCase()}`;
  pdfCache.del(cacheKey);
  console.log(`🗑️  Cache invalidated: ${cacheKey}`);
};

/**
 * Get cache statistics for monitoring
 * @returns {object} - Cache keys and statistics
 */
const getCacheStats = () => {
  const keys = pdfCache.keys();
  return {
    cachedCertificates: keys,
    totalCached: keys.length,
    keys: pdfCache.getStats(),
  };
};

module.exports = { getPDF, setPDF, invalidatePDF, getCacheStats };
