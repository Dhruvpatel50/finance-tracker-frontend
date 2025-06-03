import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from './Toast.jsx';
import InputField from './InputField.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import { KeyRound } from 'lucide-react';

const ForgotPassword = ({ setPage }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [emailSent, setEmailSent] = useState(false);

    const validateForm = () => {
        if (!email) {
            setError('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/forgot-password', { email });
            setToast({ message: response.data.message, type: 'success' });
            setEmailSent(true);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please try again.';
            setToast({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (error) setError('');
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                    <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>

                    <p className="text-gray-600 mb-6">
                        We've sent a password reset link to <strong>{email}</strong>.
                        Please check your inbox and follow the instructions to reset your password.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => setEmailSent(false)}
                            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition duration-200"
                        >
                            Send Another Email
                        </button>

                        <button
                            onClick={() => setPage('login')}
                            className="w-full text-primary-600 hover:text-primary-500 font-medium"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
                        <KeyRound height={35} width={35}/>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
                    <p className="text-gray-600 mt-2">Enter your email to reset your password</p>
                </div>

                <InputField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    error={error}
                    icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>}
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 mb-4"
                >
                    {loading ? <LoadingSpinner /> : 'Send Reset Email'}
                </button>

                <div className="text-center space-y-2">
                    <button
                        onClick={() => setPage('login')}
                        className="text-primary-600 hover:text-primary-500 font-medium"
                    >
                        Back to Login
                    </button>
                    <div className="text-gray-500">or</div>
                    <button
                        onClick={() => setPage('register')}
                        className="text-primary-600 hover:text-primary-500 font-medium"
                    >
                        Create New Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;