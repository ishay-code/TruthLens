const axios = require('axios');
const logger = require('../utils/logger');

class FactCheckService {
    constructor() {
        this.googleApiKey = process.env.GOOGLE_FACT_CHECK_API_KEY;
        this.baseURL = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';

        this.factPatterns = {
            statistics: /\d+(\.\d+)?%|\d+ (percent|percentage)/i,
            dates: /\b\d{4}\b|\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i,
            quantities: /\b\d+\s+(million|billion|trillion|thousand|hundred)\b/i,
            citations: /\b(according to|cited by|reported by|study by|research by)\b/i,
            comparisons: /\b(more than|less than|greater|fewer|increased|decreased)\b/i
        };
    }

    async checkFacts(content) {
        try {
            // Extract and analyze claims
            const claims = this.extractClaims(content);
            const analysis = this.analyzeClaims(content, claims);

            return {
                claimsFound: claims.length,
                findings: this.generateFindings(analysis),
                details: {
                    verifiableClaims: claims,
                    statisticsUsed: analysis.statistics,
                    sourcesReferenced: analysis.citations,
                    datesCited: analysis.dates,
                    comparativeClaims: analysis.comparisons
                }
            };
        } catch (error) {
            logger.error('Fact checking failed', { error: error.message });
            return {
                claimsFound: 0,
                findings: [],
                details: {
                    verifiableClaims: [],
                    statisticsUsed: [],
                    sourcesReferenced: [],
                    datesCited: [],
                    comparativeClaims: []
                }
            };
        }
    }

    extractClaims(content) {
        const claims = [];
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);

        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (this.containsFactualElements(trimmed)) {
                claims.push(trimmed);
            }
        });

        return claims;
    }

    analyzeClaims(content, claims) {
        const analysis = {
            statistics: this.findMatches(content, this.factPatterns.statistics),
            dates: this.findMatches(content, this.factPatterns.dates),
            quantities: this.findMatches(content, this.factPatterns.quantities),
            citations: this.findMatches(content, this.factPatterns.citations),
            comparisons: this.findMatches(content, this.factPatterns.comparisons)
        };

        return analysis;
    }

    findMatches(content, pattern) {
        const matches = content.match(new RegExp(pattern, 'gi')) || [];
        return [...new Set(matches)]; // Remove duplicates
    }

    containsFactualElements(sentence) {
        return Object.values(this.factPatterns).some(pattern =>
            pattern.test(sentence)
        );
    }

    generateFindings(analysis) {
        const findings = [];

        if (analysis.statistics.length > 0) {
            findings.push(`Found ${analysis.statistics.length} statistical claims: ${analysis.statistics.join(', ')}`);
        }

        if (analysis.citations.length > 0) {
            findings.push(`Referenced ${analysis.citations.length} sources: ${analysis.citations.join(', ')}`);
        }

        if (analysis.dates.length > 0) {
            findings.push(`Contains ${analysis.dates.length} temporal references: ${analysis.dates.join(', ')}`);
        }

        if (analysis.comparisons.length > 0) {
            findings.push(`Makes ${analysis.comparisons.length} comparative claims: ${analysis.comparisons.join(', ')}`);
        }

        if (findings.length === 0) {
            findings.push('No specific factual claims detected in the content');
        }

        return findings;
    }
}

module.exports = new FactCheckService();