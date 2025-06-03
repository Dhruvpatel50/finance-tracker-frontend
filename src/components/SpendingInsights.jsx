import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';

const SpendingInsights = ({ isDarkMode }) => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Check if user and token exist
            if (!user || !user.token) {
                setError('Authentication required. Please log in again.');
                setLoading(false);
                return;
            }

            console.log('Fetching insights from:', '/api/insights');
            console.log('Using token:', user.token ? 'Token exists' : 'No token');

            const response = await fetch('https://finance-tracker-backend-w5uu.onrender.com/api/insights', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.status === 304) {
                console.log('Insights data not modified.');
                setLoading(false);
                return;
            }

            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('Non-JSON response received:', textResponse);
                setError(`Server returned non-JSON response. Status: ${response.status}`);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                setError(`Failed to fetch insights: ${response.status} ${response.statusText}`);
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log('Insights data received:', data);
            
            if (data.insights && Array.isArray(data.insights)) {
                setInsights(data.insights);
            } else {
                console.warn('Invalid insights data structure:', data);
                setInsights([]);
            }

        } catch (error) {
            console.error('Error fetching insights:', error);
            setError(`Network error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const retryFetch = () => {
        fetchInsights();
    };

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Spending Insights</h2>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Loading insights...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Spending Insights</h2>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error Loading Insights</h3>
                            <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
                            <button
                                onClick={retryFetch}
                                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Spending Insights</h2>
                <button
                    onClick={fetchInsights}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                >
                    Refresh Insights
                </button>
            </div>
            
            {insights.length === 0 ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
                    <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">No Insights Available</h3>
                    <p className="text-blue-600 dark:text-blue-300">Add some transactions to see spending insights and patterns.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((insight, index) => (
                        <div 
                            key={index} 
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    {insight.type === 'increase' && (
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                                            <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                    )}
                                    {insight.type === 'decrease' && (
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                                            <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                            </svg>
                                        </div>
                                    )}
                                    {insight.type === 'trend' && (
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                            <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {insight.type === 'pattern' && (
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                            <svg className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 13v-1a4 4 0 014-4 4 4 0 014 4v1m0 0l-4 4m4-4h-8m-4-4v8a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {insight.type === 'info' && (
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                                            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-700 dark:text-gray-200 text-base leading-relaxed">{insight.message}</p>
                                    {insight.details && (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">{insight.details}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SpendingInsights;