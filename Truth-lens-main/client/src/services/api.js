import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            throw new Error(error.response.data.message || 'Server error occurred');
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('Unable to connect to server. Please check your connection.');
        } else {
            // Something else happened
            throw new Error('An unexpected error occurred');
        }
    }
);

export const analyzeContent = async (content) => {
    try {
        const response = await api.post('/api/analyze', { content });

        // Transform the response to ensure all required fields are present
        const result = response.data;
        return {
            bias: {
                score: result.bias?.score || 0,
                level: result.bias?.level || 'Low',
                explanation: result.bias?.explanation || {},
                details: {
                    contentType: result.bias?.details?.contentType || 'No classification available',
                    biasScore: result.bias?.details?.biasScore || 0,
                    emotionalContent: result.bias?.details?.emotionalContent || 0,
                    objectivityScore: result.bias?.details?.objectivityScore || 100,
                    toxicity: result.bias?.details?.toxicity || 0,
                    politicalBias: result.bias?.details?.politicalBias || {
                        direction: 'neutral',
                        strength: 0
                    }
                }
            },
            factClaims: result.factClaims || 0,
            keyFindings: result.keyFindings || [],
            contentType: result.contentType || 'Analysis not available',
            reliability: {
                score: result.reliability?.score || 100,
                color: result.reliability?.color || 'high',
                explanation: result.reliability?.explanation || 'Analysis pending'
            }
        };
    } catch (error) {
        throw new Error(`Analysis failed: ${error.message}`);
    }
};

export const healthCheck = async () => {
    try {
        const response = await api.get('/api/health');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api;