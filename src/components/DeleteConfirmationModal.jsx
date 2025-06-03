import React from 'react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, transaction }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 transform transition-all">
                <div className="flex items-center justify-center mb-4">
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
                        <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center mb-2">
                    Delete Transaction
                </h3>
                
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                    Are you sure you want to delete this transaction? This action cannot be undone.
                </p>

                {transaction && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Description:</span> {transaction.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Amount:</span> {transaction.amount}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Category:</span> {transaction.category}
                        </p>
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal; 