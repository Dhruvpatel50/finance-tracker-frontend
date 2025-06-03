import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext.jsx'; // Import AuthContext
import Chart from 'chart.js/auto'; // Import Chart.js
import { jsPDF } from 'jspdf'; // Import jsPDF
import { autoTable } from 'jspdf-autotable'; // Import autoTable from jspdf-autotable
import axios from 'axios'; // Import axios
import AOS from 'aos'; // Import AOS
import Toast from './Toast.jsx'; // Import Toast
import LoadingSpinner from './LoadingSpinner.jsx'; // Import LoadingSpinner
import InputField from './InputField.jsx'; // Import InputField (based on usage later in the file)
import { pdf } from '@react-pdf/renderer';
import DashboardReportDocument from './DashboardReportDocument.jsx'; // Import the new PDF document component
import { getDashboardSummary, getTimeData } from '../utils/api';

// Helper functions and formatters
const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
});

const DashboardContent = ({ isDarkMode, transactionUpdateCounter }) => {
    const { user } = React.useContext(AuthContext);
    const [stats, setStats] = useState({
        balance: 0,
        totalIncome: 0,
        totalExpense: 0,
        budgets: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [timePeriod, setTimePeriod] = useState('weekly');
    const [timeData, setTimeData] = useState(null);
    const [loadingTimeData, setLoadingTimeData] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');

    // Create currency formatter based on user's preference
    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: user?.currency || 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    // Helper functions
    const getDateRange = () => {
        if (transactions.length === 0) return { start: new Date(), end: new Date() };
        const dates = transactions.map(t => new Date(t.date));
        return {
            start: new Date(Math.min(...dates)),
            end: new Date(Math.max(...dates))
        };
    };

    const getCategoryBreakdown = () => {
        const breakdown = {};
        transactions.forEach(transaction => {
            if (!breakdown[transaction.category]) {
                breakdown[transaction.category] = { income: 0, expense: 0 };
            }
            if (transaction.type === 'income') {
                breakdown[transaction.category].income += transaction.amount;
            } else {
                breakdown[transaction.category].expense += transaction.amount;
            }
        });

        return Object.entries(breakdown).map(([category, data]) => ({
            category,
            income: data.income,
            expense: data.expense
        }));
    };

    // Calculate totals
    const totals = transactions.reduce((acc, transaction) => {
        if (transaction.type === 'income') {
            acc.income += transaction.amount;
        } else {
            acc.expense += transaction.amount;
        }
        return acc;
    }, { income: 0, expense: 0 });

    // Fetch dashboard summary data
    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const token = user?.token;
            if (!token) {
                setErrorStats('User not authenticated.');
                setLoadingStats(false);
                return;
            }

            const summaryData = await getDashboardSummary();

            setStats({
                balance: summaryData.balance,
                totalIncome: summaryData.totalIncome,
                totalExpense: summaryData.totalExpense,
                budgets: summaryData.budgets || 0
            });

            setExpenseCategories(summaryData.expenseCategories || []);
            console.log("Expense Categories from backend:", summaryData.expenseCategories);
            setErrorStats(null);
        } catch (error) {
            setErrorStats('Failed to fetch dashboard data.');
            console.error('Error fetching dashboard data:', error);
            setStats({
                balance: 0,
                totalIncome: 0,
                totalExpense: 0,
                budgets: 0
            });
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user, transactionUpdateCounter]);

    // Effect for fetching time-based data
    useEffect(() => {
        const fetchTimeData = async () => {
            try {
                setLoadingTimeData(true);
                const token = user?.token;
                if (!token) {
                    setErrorStats('User not authenticated.');
                    setLoadingTimeData(false);
                    return;
                }
                const data = await getTimeData(timePeriod);
                setTimeData(data);
            } catch (error) {
                console.error('Error fetching time-based data:', error);
                setTimeData(null);
            } finally {
                setLoadingTimeData(false);
            }
        };

        if (user) {
            fetchTimeData();
        }
    }, [user, timePeriod]);

    // Effect for rendering the pie chart
    useEffect(() => {
        const ctx = document.getElementById('expensePieChart');
        let expenseChart = null;

        if (ctx && expenseCategories && expenseCategories.length > 0) {
            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: isDarkMode ? '#D1D5DB' : '#374151',
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return `${tooltipItem.label}: ₹${tooltipItem.raw.toLocaleString()}`;
                            }
                        }
                    }
                }
            };

            // Destroy existing chart if it exists
            if (Chart.getChart(ctx)) {
                Chart.getChart(ctx).destroy();
            }

            expenseChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: expenseCategories.map(cat => cat.category),
                    datasets: [{
                        data: expenseCategories.map(cat => cat.amount),
                        backgroundColor: [
                            '#4CAF50', '#FFEB3B', '#F44336', '#2196F3', '#9C27D0',
                            '#FF9800', '#00BCD4', '#E91E63', '#607D8B', '#795548',
                        ],
                        borderColor: Array(10).fill('#ffffff'),
                        borderWidth: 1,
                    }]
                },
                options: chartOptions,
            });
        }

        return () => {
            if (expenseChart) {
                expenseChart.destroy();
            }
        };
    }, [expenseCategories, isDarkMode]);

    // Effect for rendering the bar chart
    useEffect(() => {
        const ctx = document.getElementById('timeDataChart');
        let timeChart = null;

        if (ctx && timeData) {
            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: isDarkMode ? '#D1D5DB' : '#374151',
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return `${tooltipItem.dataset.label}: ₹${tooltipItem.raw.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: isDarkMode ? '#D1D5DB' : '#374151',
                            callback: function (value) {
                                return '₹' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: isDarkMode ? '#374151' : '#E5E7EB'
                        }
                    },
                    x: {
                        ticks: {
                            color: isDarkMode ? '#D1D5DB' : '#374151'
                        },
                        grid: {
                            color: isDarkMode ? '#374151' : '#E5E7EB'
                        }
                    }
                }
            };

            if (Chart.getChart(ctx)) {
                Chart.getChart(ctx).destroy();
            }

            timeChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: timeData.labels,
                    datasets: [
                        {
                            label: 'Income',
                            data: timeData.income,
                            backgroundColor: '#10b981',
                            borderColor: '#059669',
                            borderWidth: 1
                        },
                        {
                            label: 'Expenses',
                            data: timeData.expenses,
                            backgroundColor: '#ef4444',
                            borderColor: '#dc2626',
                            borderWidth: 1
                        }
                    ]
                },
                options: chartOptions
            });
        }

        return () => {
            if (timeChart) {
                timeChart.destroy();
            }
        };
    }, [timeData, isDarkMode]);

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

    //animate on scroll
    useEffect(() => {
        // Initialize AOS
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

    // Filter transactions based on criteria
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;

        // Date filter logic
        let matchesDate = true;
        if (selectedDate) {
            const transactionDate = new Date(transaction.date).toLocaleDateString();
            const filterDate = new Date(selectedDate).toLocaleDateString();
            matchesDate = transactionDate === filterDate;
        }

        return matchesSearch && matchesType && matchesCategory && matchesDate;
    });

    // Enhanced PDF Export Function with Professional UI
    const exportToPDF = async () => {
        const blob = await pdf(
            <DashboardReportDocument
                user={user}
                stats={stats}
                transactions={transactions} // Assuming transactions are available in this component's state or props
            />
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `TrackIT-Financial-Report-${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            {/* Header */}
            <header className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border px-5 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                            Welcome, {user?.name || 'User'}
                        </h1>
                        <p className="text-gray-600 mt-1 dark:text-gray-400">Continue your journey to financial success</p>
                    </div>
                </div>
            </header>

            {/* Main Dashboard Content */}
            <main className="p-2 sm:p-4 md:p-6 bg-gray-50 dark:bg-dark-background max-w-[100vw] overflow-x-hidden">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {loadingStats && (
                        <div className="col-span-full text-center text-gray-500 dark:text-gray-400">Loading dashboard data...</div>
                    )}
                    {errorStats && (
                        <div className="col-span-full text-center text-red-600 dark:text-red-400">{errorStats}</div>
                    )}
                    {!loadingStats && !errorStats && stats && (
                        <>
                    {/* Total Balance */}
                            <div className="bg-white dark:bg-dark-background p-3 sm:p-4 rounded-xl shadow-lg border border-gray-200 dark:border-white"
                                data-aos="fade-up" data-aos-delay="0"
                                style={isDarkMode ? { boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)' } : {}}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-200 dark:bg-dark-surface rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-700 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                                <h3 className={`text-2xl sm:text-3xl font-bold mb-1 ${stats.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {currencyFormatter.format(Math.abs(stats.balance))}
                        </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Balance</p>
                            </div>

                    {/* Income */}
                            <div className="bg-white dark:bg-dark-background p-3 sm:p-4 rounded-xl shadow-lg border border-gray-200 dark:border-white"
                                data-aos="fade-up" data-aos-delay="100"
                                style={isDarkMode ? { boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)' } : {}}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-dark-surface rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                            </div>
                        </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text mb-1">
                                    {currencyFormatter.format(stats.totalIncome)}
                        </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Income</p>
                    </div>

                    {/* Expenses */}
                            <div className="bg-white dark:bg-dark-background p-3 sm:p-4 rounded-xl shadow-lg border border-gray-200 dark:border-white"
                                data-aos="fade-up" data-aos-delay="200"
                                style={isDarkMode ? { boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)' } : {}}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-dark-surface rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text mb-1">
                                    {currencyFormatter.format(stats.totalExpense)}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Expenses</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {/* Pie Chart Container */}
                    <div className="bg-white dark:bg-dark-background rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-3 sm:p-4"
                        data-aos="fade-in" data-aos-delay="300"
                        style={isDarkMode ? { boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)' } : {}}>
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-dark-text mb-3">Expense Categories Overview</h2>
                        <div className="h-48 sm:h-64 w-full flex items-center justify-center relative">
                            <canvas id="expensePieChart"></canvas>
                            {loadingStats && <div className="text-gray-500 dark:text-gray-400 absolute">Loading expense data...</div>}
                            {!loadingStats && expenseCategories && expenseCategories.length === 0 && (
                                <div className="text-gray-500 dark:text-gray-400 absolute">No expense data available for the current month.</div>
                            )}
                            {!loadingStats && !expenseCategories && !errorStats && (
                                <div className="text-gray-500 dark:text-gray-400 absolute">Error loading expense data.</div>
                            )}
                        </div>
                    </div>

                    {/* Data Overview Chart (Bar Chart) */}
                    <div className="bg-white dark:bg-dark-background rounded-xl shadow-lg border border-gray-200 dark:border-dark-border p-3 sm:p-4"
                        data-aos="fade-in" data-aos-delay="400"
                        style={isDarkMode ? { boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)' } : {}}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-dark-text">Income vs Expenses</h2>
                            <select
                                value={timePeriod}
                                onChange={(e) => setTimePeriod(e.target.value)}
                                className="text-sm border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-700 bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300"
                            >
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div className="h-48 sm:h-64 w-full relative">
                            <canvas id="timeDataChart"></canvas>
                            {loadingTimeData ? (
                                <div className="h-full flex items-center justify-center absolute w-full top-0 left-0">
                                    <div className="text-gray-500 dark:text-gray-400">Loading chart data...</div>
                                </div>
                            ) : timeData && (timeData.income.every(val => val === 0) && timeData.expenses.every(val => val === 0)) ? (
                                <div className="h-full flex items-center justify-center absolute w-full top-0 left-0">
                                    <div className="text-gray-500 dark:text-gray-400">No data available for this period.</div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Transaction History Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700" 
                    data-aos="fade-up" data-aos-delay="400">
                    <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
                            <button
                                onClick={exportToPDF}
                                className="w-full sm:w-auto relative bg-gradient-to-r from-green-500 to-teal-600 text-white px-3 py-2 rounded-lg transition-all duration-500 ease-in-out flex items-center justify-center overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export as PDF
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Search Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            {/* Type Filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>

                            {/* Category Filter */}
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Categories</option>
                                <option value="food">Food</option>
                                <option value="transport">Transport</option>
                                <option value="utilities">Utilities</option>
                                <option value="entertainment">Entertainment</option>
                                <option value="other">Other</option>
                            </select>

                            {/* Date Filter */}
                            <div>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="overflow-x-auto">
                        <div className="min-w-full inline-block align-middle">
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                </tr>
                            </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                                <td colSpan="5" className="px-3 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((transaction) => (
                                        <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {dateFormatter.format(new Date(transaction.date))}
                                            </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {transaction.description}
                                            </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                <span className="capitalize">{transaction.category}</span>
                                            </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                                                <span className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                    {currencyFormatter.format(transaction.amount)}
                                                </span>
                                            </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            transaction.type === 'income'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                    }`}>
                                                    {transaction.type}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}>
                    {toast.message}
                </div>
            )}
        </>
    );
};

export default DashboardContent; 