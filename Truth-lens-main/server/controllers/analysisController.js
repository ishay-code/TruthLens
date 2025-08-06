const openRouterService = require('../services/openRouterService');
const biasDetectionService = require('../services/biasDetectionService');
const factCheckService = require('../services/factCheckService');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const combineAnalysisResults = ({ content, aiAnalysis, bias, factCheck }) => {
    return {
        bias: {
            score: aiAnalysis?.bias?.score || 0,
            level: getBiasLevel(aiAnalysis?.bias?.score),
            explanation: {
                summary: aiAnalysis?.summary || '',
                recommendations: aiAnalysis?.recommendations || []
            },
            details: {
                contentType: aiAnalysis?.classification?.type || 'Unknown',
                biasScore: aiAnalysis?.bias?.score || 0,
                emotionalContent: aiAnalysis?.bias?.details?.emotionalContent || 0,
                objectivityScore: 100 - (aiAnalysis?.bias?.score || 0),
                toxicity: aiAnalysis?.toxicity || 0,
                politicalBias: aiAnalysis?.bias?.details?.politicalBias || {
                    direction: 'neutral',
                    strength: 0
                }
            }
        },
        factClaims: aiAnalysis?.factClaims?.length || 0,
        keyFindings: [
            ...(aiAnalysis?.factClaims || []),
            ...(aiAnalysis?.recommendations || [])
        ].filter(Boolean),
        contentType: aiAnalysis?.classification?.type || 'Unknown',
        reliability: {
            score: Math.max(0, 100 - (aiAnalysis?.bias?.score || 0)),
            color: getReliabilityColor(aiAnalysis?.bias?.score || 0),
            explanation: aiAnalysis?.summary || 'Analysis completed'
        }
    };
};

const getBiasLevel = (score) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
};

const getReliabilityColor = (biasScore) => {
    if (biasScore >= 70) return 'low';
    if (biasScore >= 40) return 'medium';
    return 'high';
};

const analyzeContent = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || typeof content !== 'string') {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'Content must be a non-empty string'
            });
        }

        // Check cache
        const cacheKey = `analysis_${Buffer.from(content).toString('base64').slice(0, 50)}`;
        const cachedResult = cache.get(cacheKey);

        if (cachedResult) {
            logger.info('Returning cached analysis result');
            return res.json(cachedResult);
        }

        // Perform analysis using OpenRouter AI
        logger.info('Starting content analysis', { contentLength: content.length });
        const aiAnalysis = await openRouterService.analyzeContent(content);

        // Combine results
        const analysis = combineAnalysisResults({
            content,
            aiAnalysis,
            bias: null,  // Using AI analysis for bias now
            factCheck: null // Using AI analysis for fact checking
        });

        // Cache result
        cache.set(cacheKey, analysis, 3600);

        logger.info('Analysis completed successfully');
        res.json(analysis);

    } catch (error) {
        logger.error('Analysis failed', { error: error.message });
        res.status(500).json({
            error: 'Analysis failed',
            message: 'Unable to analyze content at this time.'
        });
    }
};

module.exports = {
    analyzeContent
};