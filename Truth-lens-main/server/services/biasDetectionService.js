const logger = require('../utils/logger');
const openRouterService = require('./openRouterService');

class BiasDetectionService {
    constructor() {
        this.biasPatterns = {
            political: {
                left: ['progressive', 'liberal', 'social justice', 'inequality', 'systemic'],
                right: ['conservative', 'traditional', 'law and order', 'personal responsibility', 'freedom'],
                indicators: ['leftist', 'right-wing', 'woke', 'fascist', 'socialist', 'communist']
            },
            emotional: ['outrageous', 'shocking', 'unbelievable', 'devastating', 'incredible', 'amazing'],
            loaded: ['terrorist', 'hero', 'victim', 'criminal', 'saint', 'monster'],
            absolute: ['always', 'never', 'all', 'none', 'every', 'completely', 'totally', 'entirely'],
            sensational: ['breakthrough', 'miracle', 'secret', 'exposed', 'revealed', 'shocking truth']
        };
    }

    async detectBias(content) {
        try {
            if (!content || typeof content !== 'string') {
                throw new Error('Invalid content provided');
            }

            // Get pattern analysis
            const patternAnalysis = this.analyzeLanguagePatterns(content);

            // Get AI-powered analysis from OpenRouter
            const aiAnalysis = await openRouterService.analyzeContent(content);

            // Combine both analyses for comprehensive results
            const combinedAnalysis = this.combineAnalyses(patternAnalysis, aiAnalysis);
            const biasScore = Math.round((aiAnalysis.bias?.score || 0) * 0.6 + this.calculatePatternScore(patternAnalysis) * 0.4);

            return {
                score: biasScore,
                level: this.getBiasLevel(biasScore),
                explanation: {
                    summary: aiAnalysis.summary || 'Analysis completed',
                    recommendations: aiAnalysis.recommendations || []
                },
                details: {
                    ...combinedAnalysis,
                    biasScore,
                    objectivityScore: Math.max(0, 100 - biasScore)
                }
            };
        } catch (error) {
            logger.error('Bias detection failed', { error: error.message });
            throw error;
        }
    }

    calculatePatternScore(analysis) {
        let score = 0;
        const maxScore = 100;

        // Calculate pattern-based score
        score += (analysis.emotionalLanguage * 20);
        score += (analysis.loadedTerms * 25);
        score += (analysis.absoluteStatements * 15);
        score += (analysis.sensationalLanguage * 20);
        score += (analysis.politicalBias.indicators * 20);

        return Math.min(Math.round(score), maxScore);
    }

    combineAnalyses(patternAnalysis, aiAnalysis) {
        return {
            ...patternAnalysis,
            aiClassification: aiAnalysis.classification,
            sentiment: aiAnalysis.sentiment,
            toxicity: aiAnalysis.toxicity,
            emotion: aiAnalysis.emotion,
            originalContent: patternAnalysis.originalContent
        };
    }

    calculateBiasScore(analysis) {
        let score = 0;
        const weights = {
            patterns: 40,  // Pattern-based analysis worth 40%
            ai: 60        // AI-based analysis worth 60%
        };

        // Pattern-based scoring (0-40 points)
        let patternScore = 0;
        patternScore += (analysis.emotionalLanguage * 8);
        patternScore += (analysis.loadedTerms * 10);
        patternScore += (analysis.absoluteStatements * 6);
        patternScore += (analysis.sensationalLanguage * 8);
        patternScore += (analysis.politicalBias.indicators * 8);
        score += Math.min(patternScore, weights.patterns);

        // AI-based scoring (0-60 points)
        let aiScore = 0;
        const aiLabels = analysis.aiClassification?.labels || [];
        const aiScores = analysis.aiClassification?.scores || [];

        // Add points based on AI classification
        for (let i = 0; i < aiLabels.length; i++) {
            if (aiLabels[i] === "propaganda" || aiLabels[i] === "misleading content") {
                aiScore += aiScores[i] * 30;
            } else if (aiLabels[i] === "emotional appeal" || aiLabels[i] === "sensationalized news") {
                aiScore += aiScores[i] * 20;
            }
        }

        // Add toxicity score
        if (analysis.toxicity) {
            aiScore += analysis.toxicity[0].score * 10;
        }

        score += Math.min(aiScore, weights.ai);
        return Math.round(score);
    }

    getBiasLevel(score) {
        return score; // Return the raw score (0-100) instead of Low/Medium/High
    }

    getBiasLevelPrefix(score) {
        if (score >= 70) return 'Severe bias detected:';
        if (score >= 40) return 'Significant bias present:';
        return 'Minor bias indicators:';
    }

    generateDetailedExplanation(analysis, score) {
        const insights = [];

        // Get the top AI classification
        const topClassification = this.getTopClassification(analysis.aiClassification);

        // Add AI-based insights with percentages
        if (topClassification) {
            insights.push(this.getClassificationInsight(topClassification));
        }

        if (analysis.emotion) {
            const dominantEmotion = this.getDominantEmotion(analysis.emotion);
            insights.push(this.getEmotionalInsight(dominantEmotion));
        }

        // Detailed toxicity analysis
        if (analysis.toxicity && analysis.toxicity[0].score > 0.3) {
            insights.push(`Content toxicity level: ${Math.round(analysis.toxicity[0].score * 100)}%`);
        }

        // Pattern-based analysis with percentages
        if (analysis.emotionalLanguage > 0) {
            const examples = this.findMatchingWords(analysis.originalContent, this.biasPatterns.emotional);
            const percentage = Math.round((analysis.emotionalLanguage / analysis.wordCount) * 100);
            insights.push(`Emotional language density: ${percentage}% (examples: ${examples.join(', ')})`);
        }

        if (analysis.loadedTerms > 0) {
            const examples = this.findMatchingWords(analysis.originalContent, this.biasPatterns.loaded);
            const percentage = Math.round((analysis.loadedTerms / analysis.wordCount) * 100);
            insights.push(`Loaded terms density: ${percentage}% (found: ${examples.join(', ')})`);
        }

        if (analysis.politicalBias.lean !== 'neutral') {
            const examples = this.findMatchingWords(analysis.originalContent,
                [...this.biasPatterns.political[analysis.politicalBias.lean],
                 ...this.biasPatterns.political.indicators]);
            const biasStrength = Math.round(
                (analysis.politicalBias.indicators / analysis.wordCount) * 100
            );
            insights.push(`Political bias strength: ${biasStrength}% ${analysis.politicalBias.lean}-leaning (indicators: ${examples.join(', ')})`);
        }

        return {
            score: score,
            summary: `${this.getBiasLevelPrefix(score)} ${insights.join('. ')}`,
            details: {
                contentType: topClassification?.label || 'Unknown',
                biasScore: score,
                emotionalContent: Math.round((analysis.emotionalLanguage / analysis.wordCount) * 100),
                politicalBias: {
                    direction: analysis.politicalBias.lean,
                    strength: Math.round((analysis.politicalBias.indicators / analysis.wordCount) * 100)
                },
                toxicity: analysis.toxicity ? Math.round(analysis.toxicity[0].score * 100) : 0,
                objectivityScore: Math.max(0, 100 - score)
            },
            recommendations: this.generateRecommendations(analysis, score)
        };
    }

    findMatchingWords(content, patterns) {
        return patterns.filter(pattern =>
            content.toLowerCase().includes(pattern.toLowerCase())
        );
    }

    getTopClassification(classification) {
        if (!classification?.labels) return null;
        const maxIndex = classification.scores.indexOf(Math.max(...classification.scores));
        return {
            label: classification.labels[maxIndex],
            score: classification.scores[maxIndex]
        };
    }

    getClassificationInsight(classification) {
        if (!classification) return '';
        const percentage = Math.round(classification.score * 100);
        return `Content is classified as "${classification.label}" with ${percentage}% confidence`;
    }

    getDominantEmotion(emotionAnalysis) {
        if (!emotionAnalysis?.[0]) return null;
        return emotionAnalysis[0];
    }

    getEmotionalInsight(emotion) {
        if (!emotion) return '';
        return `Expresses primarily ${emotion.label.toLowerCase()} emotion (${Math.round(emotion.score * 100)}% confidence)`;
    }

    generateRecommendations(analysis, score) {
        const recommendations = [];

        if (score >= 70) {
            recommendations.push('Major revision needed - content shows strong bias');
            recommendations.push('Consider rewriting with focus on factual information');
            recommendations.push('Remove emotional language and loaded terms');
            recommendations.push('Include multiple perspectives');
        } else if (score >= 40) {
            if (analysis.emotionalLanguage > 0) {
                recommendations.push('Replace emotional terms with neutral alternatives');
            }
            if (analysis.loadedTerms > 0) {
                recommendations.push('Use more balanced terminology');
            }
            if (analysis.absoluteStatements > 0) {
                recommendations.push('Qualify absolute statements with specific conditions or exceptions');
            }
        } else {
            recommendations.push('Content is relatively balanced but can be improved by:');
            recommendations.push('- Adding more diverse perspectives');
            recommendations.push('- Including additional factual evidence');
        }

        return recommendations;
    }

    analyzeLanguagePatterns(content) {
        const lowerContent = content.toLowerCase();
        const words = lowerContent.split(/\s+/);

        const analysis = {
            politicalBias: this.detectPoliticalBias(lowerContent),
            emotionalLanguage: this.countOccurrences(lowerContent, this.biasPatterns.emotional),
            loadedTerms: this.countOccurrences(lowerContent, this.biasPatterns.loaded),
            absoluteStatements: this.countOccurrences(lowerContent, this.biasPatterns.absolute),
            sensationalLanguage: this.countOccurrences(lowerContent, this.biasPatterns.sensational),
            wordCount: words.length,
            questionMarks: (content.match(/\?/g) || []).length,
            exclamationMarks: (content.match(/!/g) || []).length,
            capsWords: (content.match(/\b[A-Z]{2,}\b/g) || []).length,
            originalContent: content  // Store original content for reference
        };

        return analysis;
    }

    countOccurrences(content, patterns) {
        return patterns.reduce((count, pattern) => {
            const regex = new RegExp(pattern.toLowerCase(), 'g');
            const matches = content.match(regex);
            return count + (matches ? matches.length : 0);
        }, 0);
    }

    detectPoliticalBias(content) {
        const leftMatches = this.countOccurrences(content, this.biasPatterns.political.left);
        const rightMatches = this.countOccurrences(content, this.biasPatterns.political.right);
        const indicators = this.countOccurrences(content, this.biasPatterns.political.indicators);

        let lean = 'neutral';
        if (leftMatches > rightMatches) {
            lean = 'left';
        } else if (rightMatches > leftMatches) {
            lean = 'right';
        }

        return {
            left: leftMatches,
            right: rightMatches,
            indicators: indicators,
            lean: lean
        };
    }
}

module.exports = new BiasDetectionService();