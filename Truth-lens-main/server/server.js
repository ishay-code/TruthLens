// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const analysisRoutes = require('./routes/analysis');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Verify essential environment variables
if (!process.env.OPENROUTER_API_KEY) {
    logger.error('Missing OPENROUTER_API_KEY environment variable');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:8080'
    ],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Routes
app.use('/api', analysisRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'TruthLens API',
        version: '1.0.0'
    });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`TruthLens server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info('OpenRouter API Key status: ' + (process.env.OPENROUTER_API_KEY ? 'Configured' : 'Missing'));
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

module.exports = app;