import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            const email = localStorage.getItem('userEmail');
            const name = localStorage.getItem('userName');
            const currency = localStorage.getItem('userCurrency') || 'INR';

            if (token && email) {
                try {
                    const response = await axios.get('/verify');
                    setUser({
                        token,
                        email: response.data.user.email,
                        name: response.data.user.name,
                        currency: response.data.user.currency || currency
                    });
                    localStorage.setItem('userName', response.data.user.name);
                    localStorage.setItem('userCurrency', response.data.user.currency || currency);
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userCurrency');
                    console.log('Token validation failed:', error.response?.data?.message);
                }
            }
            setLoading(false);
        };

        validateToken();
    }, []);

    const login = (token, email, name) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);
        localStorage.setItem('userCurrency', 'INR'); // Set default currency on login
        setUser({ token, email, name, currency: 'INR' });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userCurrency');
        setUser(null);
    };

    const updateUser = (newData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...newData
        }));
        if (newData.name) {
            localStorage.setItem('userName', newData.name);
        }
        if (newData.currency) {
            localStorage.setItem('userCurrency', newData.currency);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };
export default AuthProvider;