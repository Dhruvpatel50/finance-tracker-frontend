import React, { useState, useEffect } from 'react';
import { AuthContext } from './components/AuthContext.jsx'; // Import AuthContext
import LoadingScreen from './components/LoadingScreen.jsx'; // Import LoadingScreen
import { getUrlParams } from './utils/api.js'; // Import getUrlParams
import Login from './components/Login.jsx'; // Import Login
import Layout from './components/Layout.jsx';
import Register from './components/Register.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx'
import AOS from 'aos'; // Import AOS library
import 'aos/dist/aos.css'; // Import AOS styles

const App = () => {
    const [page, setPage] = useState('login');
    const { user, loading } = React.useContext(AuthContext);

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 1000, // You can adjust the duration
            once: true, // Animation only happens once
            mirror: false, // Whether animation should happen on scroll out and in
        });
    }, []);

    useEffect(() => {
        // Check for reset password URL parameters
        const urlParams = getUrlParams();
        if (urlParams.token && urlParams.email) {
            setPage('reset-password');
            return;
        }

        if (user) {
            setPage('dashboard');
        }
    }, [user]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            {page === 'login' && !user && <Login setPage={setPage} />}
            {page === 'register' && !user && <Register setPage={setPage} />}
            {page === 'forgot-password' && !user && <ForgotPassword setPage={setPage} />}
            {page === 'reset-password' && !user && <ResetPassword setPage={setPage} />}
            {user && <Layout setPage={setPage} />}
        </>
    );
};

export default App;