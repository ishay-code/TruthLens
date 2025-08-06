const express = require('express');
const { body } = require('express-validator');
const rateLimiter = require('../middleware/rateLimiter');
const validation = require('../middleware/validation');
const analysisController = require('../controllers/analysisController');

const router = express.Router();

// Apply rate limiting to analysis endpoint
router.use('/analyze', rateLimiter);

// Content analysis endpoint
router.post('/analyze',
    // Validation rules
    [
        body('content')
            .isString()
            .isLength({ min: 10, max: 1000 })
            .withMessage('Content must be between 10 and 1000 characters')
            .trim()
            .escape()
    ],
    validation.handleValidationErrors,
    analysisController.analyzeContent
);

module.exports = router;