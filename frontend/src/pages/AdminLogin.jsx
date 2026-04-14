import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminLogin = () => {
    const { user, initiateLogin, verifyLogin, resendOtp, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [username, setUsername] = useState('Admin');
    const [email, setEmail] = useState('apn.e.dukaan.main@gmail.com');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [is2FAStarted, setIs2FAStarted] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        let timer;
        if (is2FAStarted && countdown > 0) {
            timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [is2FAStarted, countdown]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await initiateLogin(username, email, password);
            setUserEmail(data.email);
            setIs2FAStarted(true);
            setCountdown(60);
            toast.success('Admin OTP sent to registered email.');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Invalid admin credentials');
        }
    };

    const handle2FASubmit = async (e) => {
        e.preventDefault();
        if (otpCode.length !== 6) return;
        try {
            const loggedInUser = await verifyLogin(userEmail, otpCode, rememberMe);
            if (loggedInUser?.role !== 'ADMIN') {
                logout();
                toast.error('This account is not an admin account.');
                return;
            }
            toast.success('Admin login successful');
            navigate('/admin-dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Invalid OTP Code');
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        try {
            await resendOtp(userEmail, 'login');
            setCountdown(60);
            toast.success('Verification code resent.');
        } catch {
            toast.error('Failed to resend code');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
            <div className="w-full max-w-md glass-card p-8 border-white/80">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                        <Shield className="w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-display font-extrabold text-gray-900">Admin Login</h1>
                    <p className="text-gray-500 mt-1">Restricted access for admin users only.</p>
                </div>

                {user && (
                    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-sm font-semibold text-amber-900">
                            You are logged in as {user.username} ({user.role}).
                        </p>
                        <div className="mt-3 flex gap-2">
                            <button
                                type="button"
                                onClick={() => navigate(user.role === 'ADMIN' ? '/admin-dashboard' : '/')}
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-amber-300 text-amber-900 hover:bg-amber-100"
                            >
                                Continue as current user
                            </button>
                            <button
                                type="button"
                                onClick={logout}
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-black"
                            >
                                Switch account
                            </button>
                        </div>
                    </div>
                )}

                {!is2FAStarted ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                            <input className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field pr-11"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                            />
                            <span className="text-sm text-gray-600">Remember me</span>
                        </label>
                        <button type="submit" className="btn-primary w-full py-3">Continue to Admin OTP</button>
                    </form>
                ) : (
                    <form onSubmit={handle2FASubmit} className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Enter the 6-digit verification code sent to <span className="font-semibold">{userEmail}</span>.
                        </p>
                        <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            className="input-field text-center text-xl tracking-[0.5em]"
                            placeholder="------"
                            autoFocus
                            required
                        />
                        <div className="flex items-center justify-between text-sm">
                            <button type="button" onClick={() => setIs2FAStarted(false)} className="text-gray-600 hover:text-primary">
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={countdown > 0}
                                className={`font-medium ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-secondary hover:text-primary'}`}
                            >
                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                            </button>
                        </div>
                        <button type="submit" disabled={otpCode.length !== 6} className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                            Verify & Login as Admin
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm font-semibold text-secondary hover:text-primary">
                        Back to normal login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
