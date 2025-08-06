import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="spinner-container">
            <div className="spinner-grow text-primary me-2" role="status"></div>
            <div className="spinner-grow text-primary me-2" role="status"></div>
            <div className="spinner-grow text-primary" role="status"></div>
            <p className="mt-3 mb-0">Analyzing content with AI...</p>
        </div>
    );
};

export default LoadingSpinner;