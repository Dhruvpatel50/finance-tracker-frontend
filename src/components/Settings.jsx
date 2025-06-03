import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext.jsx'; // Assuming AuthContext is used for user info/token
import axios from 'axios'; // For making API calls
import { PencilIcon } from 'lucide-react';

const Settings = ({ isDarkMode }) => {
    const { user, updateUser } = useContext(AuthContext); // Get user and potentially update function from context
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [currency, setCurrency] = useState('INR'); // Changed default to INR
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const usernameRef = useRef(null);

    // Simplified currency options
    const currencies = [
        { code: 'INR', name: 'Indian Rupee' },
        { code: 'USD', name: 'United States Dollar' }
    ];

    // Fetch user settings on component mount
    useEffect(() => {
        const fetchSettings = async () => {
            if (!user || !user.token) {
                setError('Authentication required.');
                setLoading(false);
                return;
            }
            try {
                // Placeholder data for now
                const placeholderSettings = {
                    username: user.name || 'Loading...',
                    email: user.email || 'Loading...',
                    currency: user.currency || 'INR' // Use user's currency or default to INR
                };

                setUsername(placeholderSettings.username);
                setEmail(placeholderSettings.email);
                setCurrency(placeholderSettings.currency);

            } catch (err) {
                console.error('Error fetching settings:', err);
                setError('Failed to load settings.');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [user]); // Rerun if user context changes

    // Handle input changes
    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        setHasUnsavedChanges(true);
    };
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleCurrencyChange = (e) => setCurrency(e.target.value);

    const toggleUsernameEdit = () => {
        setIsEditingUsername(!isEditingUsername);
        if (!isEditingUsername) {
            setHasUnsavedChanges(false);
        }
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isEditingUsername && 
                usernameRef.current && 
                !usernameRef.current.contains(event.target) && 
                !hasUnsavedChanges) {
                setIsEditingUsername(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditingUsername, hasUnsavedChanges]);

    // Handle saving settings
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);
        setError(null);
        setHasUnsavedChanges(false);

        if (!user || !user.token) {
            setError('Authentication required.');
            setIsSaving(false);
            return;
        }

        try {
            // Update username and currency in the database
            const response = await axios.put('/api/user/update', 
                { 
                    name: username,
                    currency: currency 
                },
                {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                }
            );

            // Update the user context with new name and currency
            updateUser({ 
                name: username,
                currency: currency 
            });
            
            console.log('Settings saved:', { username, email, currency });
            setSaveSuccess(true);
            setIsEditingUsername(false);

        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings.');
            setSaveSuccess(false);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center text-gray-600 dark:text-gray-300">Loading settings...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 dark:text-red-400">Error: {error}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>
                
                <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                        <div className="mt-1 flex items-center" ref={usernameRef}>
                            {isEditingUsername ? (
                                <input 
                                    type="text" 
                                    id="username" 
                                    value={username}
                                    onChange={handleUsernameChange}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:focus:border-purple-700 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2"
                                    required
                                />
                            ) : (
                                <div className="flex items-center w-full">
                                    <span className="block w-full py-2 px-3 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md">{username}</span>
                                    <button
                                        type="button"
                                        onClick={toggleUsernameEdit}
                                        className="ml-2 p-1 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            readOnly
                            className="mt-1 p-2 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Currency</label>
                        <select
                            id="currency"
                            value={currency}
                            onChange={handleCurrencyChange}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:focus:border-purple-700 dark:focus:ring-purple-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            {currencies.map(c => (
                                <option key={c.code} value={c.code}>
                                    {c.name} ({c.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Add other necessary settings fields here */}
                    
                    <div className="pt-4">
                        <button 
                            type="submit"
                            className="relative bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-500 ease-in-out flex items-center justify-center overflow-hidden group w-full"
                            disabled={isSaving}
                        >
                            <span className="relative z-10 flex items-center">
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 group-hover:translate-x-full transition-transform duration-500 ease-in-out"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></div>
                        </button>
                    </div>

                    {saveSuccess && (
                        <div className="mt-4 text-center text-green-600 dark:text-green-400 text-sm">Settings saved successfully!</div>
                    )}

                    {error && !loading && (
                        <div className="mt-4 text-center text-red-600 dark:text-red-400 text-sm">{error}</div>
                    )}
                </form>
            </div>

            {/* You can add more sections for other settings here */}
        </div>
    );
};

export default Settings;