import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const AdminLogin = () => {
    const { user, initiateLogin, verifyLogin, resendOtp, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [is2FAStarted, setIs2FAStarted] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [countdown, setCountdown] = useState(60);
    const location = useLocation();

    // Auto-redirect removed to avoid race conditions with window.location.href

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
            const data = await initiateLogin(emailOrUsername, password, 'ADMIN');
            setUserEmail(data.email);
            setIs2FAStarted(true);
            setCountdown(60);
            toast.success('Admin OTP sent to registered email.');
            if (data.dev_otp) {
                toast.success(`Development mode: OTP is ${data.dev_otp}`, { duration: 25000, icon: '🔑' });
            }
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
            window.location.href = '/admin-dashboard';
        } catch (error) {
            toast.error(error.response?.data?.error || 'Invalid OTP Code');
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        try {
            const resendData = await resendOtp(userEmail, 'login');
            setCountdown(60);
            toast.success('Verification code resent.');
            if (resendData?.dev_otp) {
                toast.success(`Development mode: OTP is ${resendData.dev_otp}`, { duration: 25000, icon: '🔑' });
            }
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

                {/* Form starts here */}

                {!is2FAStarted ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email or Username</label>
                            <input className="input-field" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} required autoComplete="off" />
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
                                    autoComplete="new-password"
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
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                                />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <Link to="/forgot-password?role=admin" className="text-sm font-semibold text-secondary hover:text-primary transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
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
