import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from './Toast.jsx';
import InputField from './InputField.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import { getUrlParams } from '../utils/api.js';

const ResetPassword = ({ setPage }) => {
    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [urlParams] = useState(getUrlParams());

    useEffect(() => {
        if (!urlParams.token || !urlParams.email) {
            setToast({ message: 'Invalid reset link. Please request a new password reset.', type: 'error' });
        }
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        if (!urlParams.token || !urlParams.email) {
            setToast({ message: 'Invalid reset link. Please request a new password reset.', type: 'error' });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post('/reset-password', {
                email: urlParams.email,
                token: urlParams.token,
                newPassword: formData.newPassword
            });

            setToast({ message: response.data.message, type: 'success' });
            setTimeout(() => {
                window.history.replaceState({}, document.title, window.location.pathname);
                setPage('login');
            }, 2000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
            setToast({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m0 0V7a2 2 0 012-2m-6 0h6" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
                    <p className="text-gray-600 mt-2">Enter your new password</p>
                    {urlParams.email && (
                        <p className="text-sm text-gray-500 mt-1">for {urlParams.email}</p>
                    )}
                </div>

                <InputField
                    label="New Password"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange('newPassword')}
                    placeholder="Enter your new password"
                    error={errors.newPassword}
                    icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>}
                />

                <InputField
                    label="Confirm New Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    placeholder="Confirm your new password"
                    error={errors.confirmPassword}
                    icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>}
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading || !urlParams.token || !urlParams.email}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 mb-4"
                >
                    {loading ? <LoadingSpinner /> : 'Reset Password'}
                </button>

                <div className="text-center">
                    <button
                        onClick={() => {
                            window.history.replaceState({}, document.title, window.location.pathname);
                            setPage('login');
                        }}
                        className="text-primary-600 hover:text-primary-500 font-medium"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;