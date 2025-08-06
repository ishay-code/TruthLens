const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    // Default error response
    let status = 500;
    let message = 'Internal server error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Invalid input data';
    } else if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized access';
    } else if (err.code === 'ECONNREFUSED') {
        status = 503;
        message = 'External service unavailable';
    } else if (err.response && err.response.status) {
        // Axios error from external API
        status = err.response.status === 429 ? 429 : 503;
        message = err.response.status === 429 ? 'API rate limit exceeded' : 'External API error';
    }

    // Don't expose internal error details in production
    const response = {
        error: message,
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    };

    res.status(status).json(response);
};

module.exports = errorHandler;