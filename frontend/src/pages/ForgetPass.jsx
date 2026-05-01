import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

const ForgetPass = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role');
    const loginUrl = role === 'admin' ? '/admin-login' : '/login';

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post('auth/password-reset/request/', { email });
            setStep(2);
            toast.success('OTP sent to your email.');
            if (res.data?.dev_otp) {
                toast.success(`Development mode: OTP is ${res.data.dev_otp}`, { duration: 25000, icon: '🔑' });
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otpCode.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post('auth/password-reset/verify/', {
                email,
                otp_code: otpCode
            });
            setResetToken(res.data.reset_token);
            setStep(3);
            toast.success('OTP verified. Set your new password.');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Invalid or expired OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            const res = await api.post('auth/password-reset/request/', { email });
            toast.success('A new OTP has been sent to your email.');
            if (res.data?.dev_otp) {
                toast.success(`Development mode: OTP is ${res.data.dev_otp}`, { duration: 25000, icon: '🔑' });
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('auth/password-reset/reset/', {
                reset_token: resetToken,
                new_password: newPassword
            });
            toast.success('Password updated successfully. Please log in.');
            navigate(loginUrl);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Password reset failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
            <div className="w-full max-w-md glass-card border-white/80 p-8 sm:p-10 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-extrabold text-gray-900 mb-2">
                        Forgot Password
                    </h1>
                </div>

                {step === 1 && (
                    <form onSubmit={handleRequestOtp} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Registered Email
                            </label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`btn-primary w-full ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-3">
                                Enter the 6-digit OTP sent to <span className="font-semibold">{email}</span>
                            </p>
                            <input
                                type="text"
                                maxLength={6}
                                className="input-field text-center tracking-[0.5em]"
                                placeholder="------"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                required
                                autoFocus
                            />
                            <div className="mt-3 text-right">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={isLoading}
                                    className={`text-sm font-semibold text-secondary hover:text-primary transition-colors ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={isLoading}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || otpCode.length !== 6}
                                className={`btn-primary w-full ${isLoading || otpCode.length !== 6 ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    className="input-field pr-12"
                                    placeholder="Minimum 8 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="input-field pr-12"
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`btn-primary w-full ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Updating Password...' : 'Update Password'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to={loginUrl} className="text-sm font-semibold text-secondary hover:text-primary transition-colors">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgetPass;
