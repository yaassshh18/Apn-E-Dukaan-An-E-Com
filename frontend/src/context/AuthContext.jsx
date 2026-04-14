/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const resetAuthState = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        setUser(null);
    }, []);

    const logout = useCallback(() => {
        resetAuthState();
    }, [resetAuthState]);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await api.get('auth/profile/');
            setUser(res.data);
        } catch {
            resetAuthState();
        } finally {
            setLoading(false);
        }
    }, [resetAuthState]);

    useEffect(() => {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [fetchProfile]);

    // Step 1: Request 2FA OTP
    const initiateLogin = async (username, email, password) => {
        resetAuthState();
        const res = await api.post('auth/login/', { username, email, password });
        return res.data; // e.g. { message: "Credentials verified...", email: "..." }
    };

    // Step 2: Verify 2FA OTP and actually log in
    const verifyLogin = async (email, otp_code, rememberMe = true) => {
        // Always start a new session cleanly before persisting new tokens.
        resetAuthState();
        const res = await api.post('auth/login/otp/verify/', { email, otp_code });
        if (rememberMe) {
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
        } else {
            sessionStorage.setItem('access_token', res.data.access);
            sessionStorage.setItem('refresh_token', res.data.refresh);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
        await fetchProfile();
        return res.data.user;
    };

    const register = async (userData) => {
        await api.post('auth/register/', userData);
        // After registration, user must verify registration OTP.
    };

    const verifyRegistration = async (email, otp_code) => {
        await api.post('auth/register/verify-otp/', { email, otp_code });
    };

    const resendOtp = async (email, action = 'login') => {
        await api.post('auth/resend-otp/', { email, action });
    };

    return (
        <AuthContext.Provider value={{ user, initiateLogin, verifyLogin, register, verifyRegistration, resendOtp, logout, resetAuthState, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
