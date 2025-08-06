import React from 'react';

const Disclaimer = () => {
    return (
        <div className="disclaimer">
            <h6 className="mb-2">
                <i className="fas fa-info-circle me-2"></i>
                Important Disclaimer
            </h6>
            <p className="mb-0 small">
                This tool uses AI to provide analysis and should not be considered definitive fact-checking.
                Always verify information through multiple reliable sources. AI systems can make mistakes,
                exhibit biases, and may not have access to the most recent information. Use this tool as
                a starting point for critical thinking, not as a final authority.
            </p>
        </div>
    );
};

export default Disclaimer;