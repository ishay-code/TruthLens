const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));

        logger.warn('Validation failed', {
            errors: errorMessages,
            ip: req.ip
        });

        return res.status(400).json({
            error: 'Validation failed',
            message: 'Please check your input data',
            details: errorMessages
        });
    }

    next();
};

const sanitizeInput = (req, res, next) => {
    if (req.body.content) {
        // Remove potentially harmful characters but preserve readability
        req.body.content = req.body.content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .trim();
    }
    next();
};

module.exports = {
    handleValidationErrors,
    sanitizeInput
};