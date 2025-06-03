import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext.jsx';
import axios from 'axios';
import Toast from './Toast.jsx';
import InputField from './InputField.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import logo from '../assets/logo.png';

const Login = ({ setPage }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const { login } = React.useContext(AuthContext);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post('/login', {
                email: formData.email,
                password: formData.password
            });

            const { token, user } = response.data;
            login(token, user.email, user.name);
            setToast({ message: 'Login successful!', type: 'success' });
            setTimeout(() => setPage('dashboard'), 1000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
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
                    <div 
                        className="mx-auto w-16 h-16 bg-white-500 rounded-full flex items-center justify-center mb-4 overflow-hidden"
                        data-aos="fade-down"
                        data-aos-duration="900"
                    >
                        <img 
                            src={logo} 
                            alt="App Logo" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-600 mt-2">Sign in to your finance tracker</p>
                </div>

                <InputField
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder="Enter your email"
                    error={errors.email}
                    icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>}
                />

                <InputField
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    placeholder="Enter your password"
                    error={errors.password}
                    icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>}
                />

                <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                        onClick={() => setPage('forgot-password')}
                        className="text-sm text-primary-600 hover:text-primary-500"
                    >
                        Forgot password?
                    </button>
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50"
                >
                    {loading ? <LoadingSpinner /> : 'Sign In'}
                </button>

                <p className="mt-6 text-center text-gray-600">
                    Don't have an account?{' '}
                    <button
                        onClick={() => setPage('register')}
                        className="text-primary-600 hover:text-primary-500 font-medium"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;