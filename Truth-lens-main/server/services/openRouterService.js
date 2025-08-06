const axios = require('axios');
const logger = require('../utils/logger');

class OpenRouterService {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.defaultModel = 'gpt-3.5-turbo'; // Changed from 'anthropic/claude-2' to a widely available model
    }

    async analyzeContent(content) {
        if (!content) {
            throw new Error('No content provided for analysis');
        }

        try {
            if (!this.apiKey) {
                throw new Error('OpenRouter API key not configured');
            }

            const response = await axios({
                method: 'post',
                url: 'https://openrouter.ai/api/v1/chat/completions',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'TruthLens Content Analyzer',
                    'OpenAI-Organization': 'TruthLens',
                    'Content-Type': 'application/json'
                },
                data: {
                    model: this.defaultModel,
                    messages: [
                        {
                            role: "system",
                            content: `You are a content analysis expert. Analyze the provided text and return a JSON object with this exact structure:
                            {
                                "bias": {
                                    "score": <number 0-100>,
                                    "details": {
                                        "emotionalContent": <number 0-100>,
                                        "politicalBias": {
                                            "direction": "left"|"right"|"neutral",
                                            "strength": <number 0-100>
                                        }
                                    }
                                },
                                "classification": {
                                    "type": <string describing content type>,
                                    "confidence": <number 0-100>
                                },
                                "factClaims": [<array of identified factual claims>],
                                "toxicity": <number 0-100>,
                                "summary": <brief analysis summary>,
                                "recommendations": [<array of improvement suggestions>]
                            }
                            Return ONLY the JSON object, no other text.`
                        },
                        {
                            role: "user",
                            content: content
                        }
                    ]
                }
            });

            if (!response.data || !response.data.choices || !response.data.choices[0]) {
                throw new Error('Invalid response from OpenRouter API');
            }

            const aiResponse = response.data.choices[0].message.content;
            return this.parseAnalysis(aiResponse);

        } catch (error) {
            logger.error('OpenRouter analysis failed', {
                error: error.message,
                stack: error.stack,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });

            if (error.response && error.response.status === 404) {
                logger.error('Model not found or not available to your OpenRouter account. Please check your available models at https://openrouter.ai/models and update the model name if needed.');
            }

            // Return a structured fallback response
            return {
                bias: {
                    score: 0,
                    details: {
                        emotionalContent: 0,
                        politicalBias: { direction: 'neutral', strength: 0 }
                    }
                },
                classification: {
                    type: 'Unknown',
                    confidence: 0
                },
                factClaims: [],
                toxicity: 0,
                summary: 'Analysis failed: ' + error.message,
                recommendations: ['Unable to analyze content at this time.']
            };
        }
    }

    parseAnalysis(content) {
        try {
            // First try direct JSON parse
            try {
                return JSON.parse(content);
            } catch {
                // If direct parse fails, try to extract JSON from the response
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }

            // If no valid JSON found, return structured error
            logger.warn('Failed to parse AI response as JSON', { content });
            return {
                error: true,
                message: 'Failed to parse AI response',
                classification: { type: 'Unknown', confidence: 0 },
                bias: {
                    score: 0,
                    details: { emotionalContent: 0, politicalBias: { direction: 'neutral', strength: 0 } }
                },
                factClaims: [],
                toxicity: 0,
                summary: 'Unable to parse analysis results',
                recommendations: ['Please try again with different content']
            };
        } catch (error) {
            logger.error('Failed to parse analysis', { error: error.message, content });
            return {
                error: true,
                message: 'Failed to parse analysis',
                rawContent: content
            };
        }
    }
}

module.exports = new OpenRouterService();
