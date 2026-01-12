import NodeCache from 'node-cache';

/**
 * In-memory cache for frequently accessed data
 * TTL (Time To Live) is set per cache instance
 */

// Metadata cache - 1 hour TTL
export const metadataCache = new NodeCache({
  stdTTL: 3600, // 1 hour
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false, // Don't clone objects (better performance)
});

// Companies cache - 30 minutes TTL
export const companiesCache = new NodeCache({
  stdTTL: 1800, // 30 minutes
  checkperiod: 300,
  useClones: false,
});

// User profile cache - 10 minutes TTL
export const userCache = new NodeCache({
  stdTTL: 600, // 10 minutes
  checkperiod: 120,
  useClones: false,
});

/**
 * Helper function to clear all caches
 */
export const clearAllCaches = (): void => {
  metadataCache.flushAll();
  companiesCache.flushAll();
  userCache.flushAll();
  console.log('✅ All caches cleared');
};

/**
 * Cache middleware factory
 * Usage: app.get('/api/route', cacheMiddleware('cache-key', 600), handler)
 */
export const cacheMiddleware = (cache: NodeCache, keyPrefix: string) => {
  return (req: any, res: any, next: any) => {
    // Generate cache key from URL and query params
    const key = `${keyPrefix}:${req.originalUrl}`;
    
    // Try to get cached response
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      console.log(`✅ Cache HIT: ${key}`);
      return res.json(cachedResponse);
    }
    
    // Cache miss - store original res.json
    const originalJson = res.json.bind(res);
    
    res.json = (data: any) => {
      // Cache the response
      cache.set(key, data);
      console.log(`💾 Cache MISS - Stored: ${key}`);
      
      // Send the response
      return originalJson(data);
    };
    
    next();
  };
};
