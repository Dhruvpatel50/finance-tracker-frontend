import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext.jsx'; // Import AuthContext
import DashboardContent from './DashboardContent.jsx'; // Import DashboardContent
import TransactionsContent from './TransactionsContent.jsx'; // Import TransactionsContent
import SpendingInsights from './SpendingInsights.jsx';
import { Home, SettingsIcon, NotepadText, BarChart3, Menu, X } from 'lucide-react';
import Settings from './Settings.jsx';
import logo from '../assets/logo.png'; // Import logo

const Layout = ({ setPage }) => {
    const { user, logout } = React.useContext(AuthContext);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [transactionUpdateCounter, setTransactionUpdateCounter] = useState(0);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigationItems = [
        {
            id: 'dashboard',
            name: 'Dashboard',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <Home />    
                </svg>
            )
        },
        {
            id: 'transactions',
            name: 'Transactions',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <NotepadText />
                </svg>
            )
        },
        {
            id: 'insights',
            name: 'Spending Insights',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <BarChart3 />
                </svg>
            )
        },
        {
            id: 'settings',
            name: 'Settings',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <SettingsIcon />
                </svg>
            )
        }
    ];

    const handleNavigation = (sectionId) => {
        setActiveSection(sectionId);
        setPage(sectionId);
    };

    const handleLogout = () => {
        logout();
        setPage('login');
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        // Add/remove dark class to document element for global dark mode
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Function to trigger transaction data update
    const triggerTransactionUpdate = () => {
        setTransactionUpdateCounter(prev => prev + 1);
    };

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-dark-background">
            {/* Mobile Menu Button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-dark-surface shadow-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                ) : (
                    <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
            </button>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Hidden on mobile by default */}
            <div 
                className={`fixed h-full bg-white border-gray-200 dark:bg-dark-surface dark:border-dark-border transition-all duration-500 ease-in-out ${
                    isSidebarCollapsed ? 'w-20' : 'w-64'
                } shadow-lg border-r z-40
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                onMouseEnter={() => !isMobileMenuOpen && setIsSidebarCollapsed(false)}
                onMouseLeave={() => !isMobileMenuOpen && setIsSidebarCollapsed(true)}
            >
                {/* Logo Section */}
                <div className="p-5 border-b border-gray-200 dark:border-dark-border">
                    <div className="flex items-center space-x-3">
                        <img src={logo} alt="TrackIT Logo" className="h-12 w-12 rounded-full object-cover" />
                        {!isSidebarCollapsed && (
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text">TrackIT</h1>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-8 px-4">
                    <ul className="space-y-2">
                        {navigationItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleNavigation(item.id)}
                                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-500 ease-in-out ${
                                        activeSection === item.id
                                            ? 'bg-green-500 text-white border-r-2 border-green-600 dark:bg-green-850 dark:text-white dark:border-r-2 dark:border-green-500'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center min-w-[20px]">
                                        {item.icon}
                                    </div>
                                    <span className={`ml-3 font-medium transition-opacity duration-500 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                                        {item.name}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Theme Toggle Button */}
                <div className="absolute py-12 left-4 right-4 bottom-20">
                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        <div className="flex items-center space-x-2">
                            {isDarkMode ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                            {!isSidebarCollapsed && (
                                <span className="text-sm font-medium">
                                    {isDarkMode ? 'Light' : 'Dark'}
                                </span>
                            )}
                        </div>
                    </button>
                </div>

                {/* Bottom Section */}
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-dark-border">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        {!isSidebarCollapsed && (
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!isSidebarCollapsed && (
                            <span className="text-sm">Logout</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-500 ease-in-out ${
                isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            }`}>
                {/* The actual page content components will include their own headers */}
                {activeSection === 'dashboard' && <DashboardContent isDarkMode={isDarkMode} transactionUpdateCounter={transactionUpdateCounter} />}
                {activeSection === 'transactions' && <TransactionsContent isDarkMode={isDarkMode} onTransactionChange={triggerTransactionUpdate} />}
                {activeSection === 'insights' && <SpendingInsights isDarkMode={isDarkMode} />}
                {activeSection === 'settings' && <Settings isDarkMode={isDarkMode} />}
            </div>
        </div>
    );
};

export default Layout;