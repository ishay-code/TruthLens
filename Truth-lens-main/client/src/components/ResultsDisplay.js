import React from 'react';
import '../styles/components.css';

const ResultsDisplay = ({ results }) => {
    if (!results) return null;

    // Safely access nested properties
    const bias = results.bias || {};
    const details = bias.details || {};
    const explanation = bias.explanation || {};
    const politicalBias = details.politicalBias || {};

    const getScoreColor = (score) => {
        if (score >= 70) return 'danger';
        if (score >= 40) return 'warning';
        return 'success';
    };

    const getProgressBarClass = (score) => {
        if (score >= 70) return 'progress-danger';
        if (score >= 40) return 'progress-warning';
        return 'progress-success';
    };

    const renderProgressBar = (score, label) => {
        if (typeof score !== 'number') return null;
        return (
            <div className="progress-section">
                <div className="progress-label">
                    <span>{label}</span>
                    <span>{score}%</span>
                </div>
                <div className="progress-container">
                    <div
                        className={`progress-bar ${getProgressBarClass(score)}`}
                        style={{ width: `${score}%` }}
                        role="progressbar"
                        aria-valuenow={score}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    />
                </div>
            </div>
        );
    };

    const getPoliticalTag = (direction, strength) => {
        if (direction === 'neutral') return null;
        return (
            <span className={`tag ${direction === 'left' || direction === 'right' ? 'political' : ''}`}>
                {direction === 'left' ? 'Left-leaning' : direction === 'right' ? 'Right-leaning' : direction}
                {strength ? ` (${strength}%)` : ''}
            </span>
        );
    };

    return (
        <div className="results-container">
            <h1 className="page-title">
                <i className="fas fa-chart-line"></i>
                Analysis Results
            </h1>

            <div className="cards-grid">
                {/* Bias Analysis Card */}
                <div className="result-card">
                    <div className={`card-header ${getScoreColor(bias.score || 0)}`}>
                        <div className="card-header-content">
                            <div className="card-title">
                                <i className="fas fa-balance-scale"></i>
                                Bias Analysis
                            </div>
                            <div className="score-badge">
                                Score: {bias.score || 0}/100
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        {/* Progress Bars */}
                        <div className="metrics-container">
                            {renderProgressBar(details.biasScore || bias.score, 'Overall Bias')}
                            {renderProgressBar(details.emotionalContent, 'Emotional Content')}
                            {renderProgressBar(details.objectivityScore, 'Objectivity')}
                            {details.toxicity > 0 && renderProgressBar(details.toxicity, 'Content Toxicity')}
                        </div>

                        {/* Content Classification */}
                        {details.contentType && (
                            <div className="section">
                                <div className="section-title">
                                    <i className="fas fa-tags"></i>
                                    Content Classification
                                </div>
                                <p className="content-text">Type: {details.contentType}</p>
                                <div className="classification-tags">
                                    {getPoliticalTag(politicalBias.direction, politicalBias.strength)}
                                    {details.emotionalContent > 50 && <span className="tag">High Emotion</span>}
                                    {details.contentType === 'opinion' && <span className="tag">Opinion</span>}
                                    {details.contentType === 'news' && <span className="tag neutral">News</span>}
                                </div>
                            </div>
                        )}

                        {/* Analysis Summary */}
                        {explanation.summary && (
                            <div className="section">
                                <div className="section-title">
                                    <i className="fas fa-info-circle"></i>
                                    Analysis Summary
                                </div>
                                <p className="content-text">{explanation.summary}</p>
                            </div>
                        )}

                        {/* Recommendations */}
                        {explanation.recommendations && explanation.recommendations.length > 0 && (
                            <div className="section">
                                <div className="section-title">
                                    <i className="fas fa-lightbulb"></i>
                                    Recommendations
                                </div>
                                <ul className="recommendations-list">
                                    {explanation.recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Analysis Card */}
                <div className="result-card">
                    <div className="card-header info">
                        <div className="card-header-content">
                            <div className="card-title">
                                <i className="fas fa-microscope"></i>
                                Content Analysis
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="section">
                            <div className="section-title">
                                <i className="fas fa-chart-bar"></i>
                                Key Metrics
                            </div>
                            <div className="metrics-grid">
                                <div className="metric-item">
                                    <span className="metric-label">Credibility Score</span>
                                    <span className="metric-value">{Math.max(0, 100 - (bias.score || 0))}%</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-label">Fact Claims</span>
                                    <span className="metric-value">{results.factClaims || 0}</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-label">Content Type</span>
                                    <span className="metric-value">{details.contentType || 'Unknown'}</span>
                                </div>
                                {details.emotionalContent && (
                                    <div className="metric-item">
                                        <span className="metric-label">Emotional Content</span>
                                        <span className="metric-value">{details.emotionalContent}%</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detailed Analysis */}
                        <div className="detailed-analysis">
                            <div className="section-title">
                                <i className="fas fa-search"></i>
                                Content Overview
                            </div>
                            <p className="content-text">
                                {explanation.summary ||
                                    `This content has been analyzed for bias patterns, emotional language, and factual accuracy. 
                                The analysis considers multiple factors including source credibility, language patterns, 
                                and claim verification.`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Findings - Full Width */}
            {results.keyFindings && results.keyFindings.length > 0 && (
                <div className="result-card full-width-card">
                    <div className="card-header">
                        <div className="card-header-content">
                            <div className="card-title">
                                <i className="fas fa-list-alt"></i>
                                Detailed Findings
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="section">
                            <div className="section-title">
                                <i className="fas fa-exclamation-triangle"></i>
                                Key Issues Identified
                            </div>
                            <ul className="findings-list">
                                {results.keyFindings.map((finding, index) => (
                                    <li key={index}>{finding}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsDisplay;