import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in max-w-md`}>
            <div className="flex items-start justify-between">
                <span className="pr-4">{message}</span>
                <button onClick={onClose} className="text-white hover:text-gray-200 font-bold text-lg leading-none">
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast;