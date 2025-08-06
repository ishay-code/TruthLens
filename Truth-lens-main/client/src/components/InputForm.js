import React, { useState } from 'react';

const InputForm = ({ onAnalyze, disabled }) => {
    const [content, setContent] = useState('');
    const [charCount, setCharCount] = useState(0);
    const maxLength = 1000;

    const handleInputChange = (e) => {
        const value = e.target.value;
        setContent(value);
        setCharCount(value.length);
    };

    const handleSubmit = () => {
        if (content.trim()) {
            onAnalyze(content.trim());
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    };

    const getCharCountColor = () => {
        if (charCount > 800) return '#dc2626';
        if (charCount > 600) return '#ca8a04';
        return '#6b7280';
    };

    const getProgressPercentage = () => {
        return (charCount / maxLength) * 100;
    };

    return (
        <div className="input-form-outer">
            <div className="input-form-inner">
                <div className="input-header">
                    <h2 className="input-title">
                        <i className="fas fa-search"></i>
                        Analyze Content for Bias
                    </h2>
                    <p className="input-subtitle">
                        Paste any text content below to analyze it for bias, emotional language, and credibility
                    </p>
                </div>

                <div className="input-container">
                    <div className="textarea-wrapper">
                        <textarea
                            className="form-control enhanced-textarea"
                            rows="6"
                            placeholder="Paste a tweet, news article, blog post, or any text content here for comprehensive bias analysis..."
                            maxLength={maxLength}
                            value={content}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            disabled={disabled}
                        />

                        <div className="textarea-footer">
                            <div className="char-counter">
                                <span
                                    className="char-count"
                                    style={{ color: getCharCountColor() }}
                                >
                                    {charCount}/{maxLength}
                                </span>
                                <div className="char-progress">
                                    <div
                                        className="char-progress-bar"
                                        style={{
                                            width: `${getProgressPercentage()}%`,
                                            backgroundColor: getCharCountColor()
                                        }}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    <button
                        className={`btn analyze-btn ${disabled ? 'analyzing' : ''}`}
                        onClick={handleSubmit}
                        disabled={disabled || !content.trim()}
                    >
                        {disabled ? (
                            <>
                                <div className="spinner"></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-chart-line"></i>
                                Analyze Content
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputForm;