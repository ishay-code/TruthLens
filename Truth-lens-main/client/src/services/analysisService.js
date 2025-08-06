// Fallback client-side analysis service
import { simulateAIAnalysis } from '../utils/contentAnalyzer';

export const performClientAnalysis = async (content) => {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Perform analysis
        const analysis = simulateAIAnalysis(content);

        return analysis;
    } catch (error) {
        throw new Error('Analysis failed: ' + error.message);
    }
};

export const analyzeWithBackend = async (content) => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Backend analysis failed');
        }
        return await response.json();
    } catch (error) {
        throw new Error('Backend error: ' + error.message);
    }
};
