export const simulateAIAnalysis = (content) => {
    const analysis = {
        reliability: { score: 'Medium', explanation: '', color: 'medium' },
        bias: { level: 'Low', explanation: '' },
        source: { quality: 'Moderate', explanation: '' },
        keyFindings: []
    };

    const lowerContent = content.toLowerCase();

    // Define pattern arrays
    const sensationalWords = ['breakthrough', 'shocking', 'doctors hate', 'amazing', 'miracle', 'secret', 'you won\'t believe'];
    const credibleIndicators = ['study', 'research', 'peer-reviewed', 'according to', 'published', 'data shows', 'university', 'journal'];
    const absoluteWords = ['all', 'never', 'always', 'every', 'completely', 'totally', 'none', 'entirely'];
    const urgentWords = ['breaking', 'urgent', 'immediately', 'crisis', 'alert', 'warning'];
    const emotionalWords = ['hate', 'love', 'amazing', 'terrible', 'shocking', 'outrageous'];

    // Check for patterns
    const hasSensational = sensationalWords.some(word => lowerContent.includes(word));
    const hasCredible = credibleIndicators.some(indicator => lowerContent.includes(indicator));
    const hasAbsolute = absoluteWords.some(word => lowerContent.includes(word));
    const hasUrgent = urgentWords.some(word => lowerContent.includes(word));
    const hasEmotional = emotionalWords.some(word => lowerContent.includes(word));

    // Calculate reliability score
    let reliabilityScore = 50; // Start with neutral

    if (hasCredible) reliabilityScore += 30;
    if (hasSensational) reliabilityScore -= 25;
    if (hasAbsolute) reliabilityScore -= 20;
    if (hasUrgent) reliabilityScore -= 15;
    if (content.includes('?') && !content.includes('.')) reliabilityScore -= 10; // Question without statement

    // Determine reliability category
    if (reliabilityScore >= 70) {
        analysis.reliability.score = 'High';
        analysis.reliability.color = 'high';
        analysis.reliability.explanation = 'Content demonstrates strong credibility indicators including references to research, measured language, and factual tone. Shows characteristics of reliable information sources.';
    } else if (reliabilityScore <= 30) {
        analysis.reliability.score = 'Low';
        analysis.reliability.color = 'low';
        analysis.reliability.explanation = 'Content contains multiple red flags including sensational language, absolute claims, and emotional manipulation tactics commonly found in misleading information.';
    } else {
        analysis.reliability.score = 'Medium';
        analysis.reliability.color = 'medium';
        analysis.reliability.explanation = 'Content appears relatively neutral but lacks clear credibility markers. Requires additional source verification for full assessment.';
    }

    // Bias analysis
    let biasScore = 0;
    if (hasEmotional) biasScore += 2;
    if (hasSensational) biasScore += 2;
    if (hasUrgent) biasScore += 1;
    if (hasAbsolute) biasScore += 1;

    if (biasScore >= 4) {
        analysis.bias.level = 'High';
        analysis.bias.explanation = 'Content uses highly emotionally charged and sensational language designed to provoke strong reactions rather than inform objectively.';
    } else if (biasScore >= 2) {
        analysis.bias.level = 'Medium';
        analysis.bias.explanation = 'Content contains some emotional language and persuasive elements that may indicate bias or subjective framing.';
    } else {
        analysis.bias.level = 'Low';
        analysis.bias.explanation = 'Language appears relatively objective and fact-focused with minimal use of emotional or persuasive techniques.';
    }

    // Source quality assessment
    if (hasCredible && !hasSensational) {
        analysis.source.quality = 'Good';
        analysis.source.explanation = 'Content references credible sources and uses academic or professional language patterns typical of reliable information.';
    } else if (hasSensational || (hasAbsolute && hasEmotional)) {
        analysis.source.quality = 'Poor';
        analysis.source.explanation = 'Uses marketing-style language and emotional manipulation tactics typical of unreliable or commercially motivated sources.';
    } else {
        analysis.source.quality = 'Moderate';
        analysis.source.explanation = 'Standard informational content without clear credibility markers. Source reliability depends on original publication context.';
    }

    // Generate key findings
    if (hasSensational) analysis.keyFindings.push('Contains sensational language (potential red flag)');
    if (hasCredible) analysis.keyFindings.push('References research or credible sources');
    if (hasAbsolute) analysis.keyFindings.push('Makes absolute claims without qualifications');
    if (hasUrgent) analysis.keyFindings.push('Uses urgent or crisis language');
    if (hasEmotional) analysis.keyFindings.push('Contains emotionally charged language');

    // Content structure analysis
    if (content.length < 50) analysis.keyFindings.push('Very brief content - limited analysis possible');
    if (content.split(' ').length > 100) analysis.keyFindings.push('Detailed content allows comprehensive analysis');
    if (!content.includes('.') && content.includes('!')) analysis.keyFindings.push('Uses exclamatory rather than declarative sentences');

    return analysis;
};

export const extractKeywords = (content) => {
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those'];

    return words
        .filter(word => word.length > 3 && !stopWords.includes(word))
        .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
        .slice(0, 10); // Top 10 keywords
};

export const detectLanguagePatterns = (content) => {
    const patterns = {
        questions: (content.match(/\?/g) || []).length,
        exclamations: (content.match(/!/g) || []).length,
        capitalWords: (content.match(/\b[A-Z]{2,}\b/g) || []).length,
        numbers: (content.match(/\d+/g) || []).length,
        urls: (content.match(/https?:\/\/[^\s]+/g) || []).length
    };

    return patterns;
};