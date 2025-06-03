import { useState, useEffect } from "react";

const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
            <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto">
                <div className="h-2 bg-primary-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
        </div>
    </div>
);

export default LoadingScreen;