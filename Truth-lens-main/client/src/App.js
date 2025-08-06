import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Disclaimer from './components/Disclaimer';
import { analyzeContent } from './services/api';
import './styles/App.css';

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const handleAnalyze = async (content) => {
        setIsLoading(true);
        setError('');
        setResults(null);

        try {
            const analysisResults = await analyzeContent(content);
            setResults(analysisResults);
        } catch (err) {
            setError(err.message || 'Failed to analyze content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="App">
            <div className="container-fluid">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-10 col-xl-8">
                            <div className="main-card">
                                <Header />

                                <div className="card-body p-4">
                                    <InputForm onAnalyze={handleAnalyze} disabled={isLoading} />

                                    {isLoading && <LoadingSpinner />}
                                    {error && <ErrorMessage message={error} />}
                                    {results && <ResultsDisplay results={results} />}

                                    <Disclaimer />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;