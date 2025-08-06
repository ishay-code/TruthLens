const NodeCache = require('node-cache');
const logger = require('./logger');

class CacheService {
    constructor() {
        // Cache with 1 hour default TTL
        this.cache = new NodeCache({
            stdTTL: 3600,
            checkperiod: 120,
            useClones: false
        });

        this.cache.on('set', (key, value) => {
            logger.debug('Cache set', { key });
        });

        this.cache.on('expired', (key, value) => {
            logger.debug('Cache expired', { key });
        });
    }

    get(key) {
        try {
            const value = this.cache.get(key);
            if (value !== undefined) {
                logger.debug('Cache hit', { key });
                return value;
            }
            logger.debug('Cache miss', { key });
            return null;
        } catch (error) {
            logger.error('Cache get error', { key, error: error.message });
            return null;
        }
    }

    set(key, value, ttl = null) {
        try {
            const result = this.cache.set(key, value, ttl);
            logger.debug('Cache set result', { key, success: result });
            return result;
        } catch (error) {
            logger.error('Cache set error', { key, error: error.message });
            return false;
        }
    }

    delete(key) {
        try {
            const result = this.cache.del(key);
            logger.debug('Cache delete', { key, deletedCount: result });
            return result > 0;
        } catch (error) {
            logger.error('Cache delete error', { key, error: error.message });
            return false;
        }
    }

    flush() {
        try {
            this.cache.flushAll();
            logger.info('Cache flushed');
            return true;
        } catch (error) {
            logger.error('Cache flush error', { error: error.message });
            return false;
        }
    }

    getStats() {
        return this.cache.getStats();
    }
}

module.exports = new CacheService();