import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext.jsx'; // Import AuthContext
import axios from 'axios'; // Import axios
import AOS from 'aos'; // Import AOS
import Toast from './Toast.jsx'; // Import Toast
import LoadingSpinner from './LoadingSpinner.jsx'; // Import LoadingSpinner
import InputField from './InputField.jsx'; // Import InputField (based on usage later in the file)
import DeleteConfirmationModal from './DeleteConfirmationModal.jsx';
import EditTransactionModal from './EditTransactionModal.jsx';

const TransactionsContent = ({ isDarkMode, onTransactionChange }) => {
    const { user } = React.useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        type: 'expense'
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' }); // Default sort by date descending
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');

    // Currency formatter
    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: user?.currency || 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Date formatter
    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Load transactions when component mounts
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('/api/transactions');
                setTransactions(response.data);
            } catch (error) {
                setToast({ message: 'Failed to load transactions', type: 'error' });
            }
        };
        fetchTransactions();
    }, []);

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: false,
            mirror: true,
            offset: 50,
            easing: 'ease-in-out'
        });

        // Refresh AOS on window resize
        window.addEventListener('resize', () => {
            AOS.refresh();
        });

        // Cleanup
        return () => {
            window.removeEventListener('resize', () => {
                AOS.refresh();
            });
        };
    }, []);

    // Filter transactions based on search and filter criteria
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;

        // Date filter logic
        let matchesDate = true;
        if (selectedDate) {
            const transactionDate = new Date(transaction.date);
            const filterDate = new Date(selectedDate);

            // Compare year, month, and day components to avoid timezone issues
            matchesDate = transactionDate.getFullYear() === filterDate.getFullYear() &&
                          transactionDate.getMonth() === filterDate.getMonth() &&
                          transactionDate.getDate() === filterDate.getDate();
        }

        return matchesSearch && matchesType && matchesCategory && matchesDate;
    });

    // Sorting function
    const sortTransactions = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleAddTransaction = () => {
        setShowAddModal(true);
    };

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/api/transactions', {
                ...formData,
                amount: parseFloat(formData.amount),
                date: new Date().toISOString()
            });

            setTransactions([...transactions, response.data]);
            setShowAddModal(false);
            setFormData({
                description: '',
                amount: '',
                category: '',
                type: 'expense'
            });
            setToast({ message: 'Transaction added successfully!', type: 'success' });
            // Notify parent component about the transaction change
            if (onTransactionChange) {
                onTransactionChange();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add transaction. Please try again.';
            setToast({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (transactionId) => {
        const transaction = transactions.find(t => t._id === transactionId);
        setSelectedTransaction(transaction);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/api/transactions/${selectedTransaction._id}`);
            setTransactions(transactions.filter(t => t._id !== selectedTransaction._id));
            setToast({ message: 'Transaction deleted successfully!', type: 'success' });
            if (onTransactionChange) {
                onTransactionChange();
            }
        } catch (error) {
            setToast({ message: 'Failed to delete transaction', type: 'error' });
        } finally {
            setShowDeleteModal(false);
            setSelectedTransaction(null);
        }
    };

    const handleEdit = (transactionId) => {
        const transaction = transactions.find(t => t._id === transactionId);
        setEditingTransaction(transaction);
        setShowEditModal(true);
    };

    const handleEditSave = async (updatedData) => {
        try {
            // Use the full backend URL for the PUT request
            const response = await axios.put(`https://finance-tracker-backend-w5uu.onrender.com/api/transactions/${editingTransaction._id}`, updatedData);
            
            // Update the transactions list with the edited transaction
            setTransactions(transactions.map(t => 
                t._id === editingTransaction._id ? response.data : t
            ));
            
            setShowEditModal(false);
            setEditingTransaction(null);
            setToast({ message: 'Transaction updated successfully!', type: 'success' });
            
            // Notify parent component about the transaction change
            if (onTransactionChange) {
                onTransactionChange();
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update transaction. Please try again.';
            setToast({ message: errorMessage, type: 'error' });
        }
    };

    return (
        <>
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
                        <p className="text-gray-600 mt-1 dark:text-gray-400">Manage your financial transactions</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-8 bg-gray-50 dark:bg-gray-900">
                {/* Action Buttons */}
                <div className="mb-8 flex space-x-4">
                    <button
                        onClick={handleAddTransaction}
                        className="relative bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg transition-all duration-500 ease-in-out flex items-center overflow-hidden group"
                    >
                        <span className="relative z-10 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Transaction
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 group-hover:translate-x-full transition-transform duration-500 ease-in-out"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></div>
                    </button>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700" data-aos="fade-up" data-aos-delay="0"
                    style={isDarkMode ? { boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)' } : {}}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Categories</option>
                            <option value="food">Food</option>
                            <option value="transport">Transport</option>
                            <option value="utilities">Utilities</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="other">Other</option>
                        </select>

                        {/* Single Date Filter */}
                        <div>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden" data-aos="fade-up" data-aos-delay="100"
                    style={isDarkMode ? { boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)' } : {}}
                >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                                        onClick={() => sortTransactions('date')}
                                    >
                                        Date
                                        {sortConfig.key === 'date' && (
                                            <span className="ml-1">
                                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                            No transactions found. Add your first transaction!
                                        </td>
                                    </tr>
                                ) : (
                                    [...filteredTransactions].sort((a, b) => {
                                        const dateA = new Date(a.date);
                                        const dateB = new Date(b.date);
                                        if (sortConfig.direction === 'ascending') {
                                            return dateA - dateB;
                                        } else {
                                            return dateB - dateA;
                                        }
                                    }).map((transaction) => (
                                        <tr
                                            key={transaction._id}
                                            className={`${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-400 hover:bg-green-300 dark:hover:bg-green-300 ' : 'hover:bg-red-300 dark:hover:bg-red-100 bg-red-200 dark:bg-red-400'}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {dateFormatter.format(new Date(transaction.date))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {transaction.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                <span className="capitalize">{transaction.category}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                    {currencyFormatter.format(transaction.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <button 
                                                    onClick={() => handleEdit(transaction._id)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(transaction._id)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Add Transaction Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Transaction</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={handleChange('description')}
                                    className="mt-1 py-1 px-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:focus:border-purple-700 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Enter transaction description"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={handleChange('amount')}
                                    className="mt-1 py-1 px-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:focus:border-purple-700 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Enter amount"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                <select 
                                    value={formData.category}
                                    onChange={handleChange('category')}
                                    className="mt-1 py-1 px-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:focus:border-purple-700 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                >
                                    <option key="" value="">Select category</option>
                                    <option key="food" value="food">Food</option>
                                    <option key="transport" value="transport">Transport</option>
                                    <option key="utilities" value="utilities">Utilities</option>
                                    <option key="entertainment" value="entertainment">Entertainment</option>
                                    <option key="other" value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                                <select 
                                    value={formData.type}
                                    onChange={handleChange('type')}
                                    className="mt-1 py-1 px-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:focus:border-purple-700 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                >
                                    <option key="expense" value="expense">Expense</option>
                                    <option key="income" value="income">Income</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedTransaction(null);
                }}
                onConfirm={handleDeleteConfirm}
                transaction={selectedTransaction}
            />

            {/* Edit Transaction Modal */}
            <EditTransactionModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingTransaction(null);
                }}
                onSave={handleEditSave}
                transaction={editingTransaction}
            />

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
                    toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white`}>
                    {toast.message}
                </div>
            )}
        </>
    );
};

export default TransactionsContent;