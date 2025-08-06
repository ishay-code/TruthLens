import React, { useEffect, useState } from 'react';

const ErrorMessage = ({ message }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [message]);

    if (!visible) return null;

    return (
        <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {message}
        </div>
    );
};

export default ErrorMessage;