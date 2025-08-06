export const API_ENDPOINTS = {
    ANALYZE: '/api/analyze',
    HEALTH: '/api/health'
};

export const ANALYSIS_THRESHOLDS = {
    RELIABILITY: {
        HIGH: 70,
        LOW: 30
    },
    BIAS: {
        HIGH: 4,
        MEDIUM: 2
    }
};

export const CONTENT_PATTERNS = {
    SENSATIONAL: ['breakthrough', 'shocking', 'doctors hate', 'amazing', 'miracle', 'secret', 'you won\'t believe'],
    CREDIBLE: ['study', 'research', 'peer-reviewed', 'according to', 'published', 'data shows', 'university', 'journal'],
    ABSOLUTE: ['all', 'never', 'always', 'every', 'completely', 'totally', 'none', 'entirely'],
    URGENT: ['breaking', 'urgent', 'immediately', 'crisis', 'alert', 'warning'],
    EMOTIONAL: ['hate', 'love', 'amazing', 'terrible', 'shocking', 'outrageous']
};

export const UI_CONSTANTS = {
    MAX_CONTENT_LENGTH: 1000,
    CHAR_WARNING_THRESHOLD: 600,
    CHAR_DANGER_THRESHOLD: 800,
    ERROR_DISPLAY_DURATION: 5000
};

export const EXAMPLE_CONTENT = [
    "Breakthrough study shows drinking 10 glasses of water daily cures all diseases! Doctors hate this simple trick!",
    "According to a recent peer-reviewed study published in Nature, researchers found correlations between exercise and improved mental health outcomes.",
    "BREAKING: Local mayor announces new park construction project with $2M budget approval from city council."
];