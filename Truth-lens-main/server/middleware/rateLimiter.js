const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Create limiter
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'Please wait a minute before trying again'
    },
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', { ip: req.ip });
        res.status(429).json({
            error: 'Too many requests',
            message: 'Please wait a minute before trying again'
        });
    }
});

module.exports = limiter;
