import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Register = () => {
    const { user, register, verifyRegistration, resendOtp, logout } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') === 'SELLER' ? 'SELLER' : 'BUYER';
    
    // Core Registration State
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        location: '',
        role: initialRole
    });

    // Verification State
    const [isVerificationStarted, setIsVerificationStarted] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [countdown, setCountdown] = useState(60);
    const navigate = useNavigate();
    const dashboardPath = user?.role === 'SELLER' ? '/seller-dashboard' : user?.role === 'ADMIN' ? '/admin-dashboard' : '/buyer-dashboard';

    // Timer logic for resend Code
    useEffect(() => {
        let timer;
        if (isVerificationStarted && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [isVerificationStarted, countdown]);

    const getPasswordStrength = () => {
        const p = formData.password;
        if(p.length === 0) return { label: '', color: 'bg-gray-200', text: '' };
        if(p.length < 5) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
        if(p.length < 8) return { label: 'Good', color: 'bg-warning', text: 'text-warning' };
        return { label: 'Strong', color: 'bg-accent', text: 'text-accent' };
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            const regData = await register(formData);
            toast.success('Registration successful! Please verify your email.', { icon: '📧', style: { borderRadius: '10px', background: '#1e293b', color: '#fff' } });
            if (regData?.dev_otp) {
                toast.success(`Development mode: OTP is ${regData.dev_otp}`, { duration: 25000, icon: '🔑' });
            }
            setIsVerificationStarted(true);
            setCountdown(60);
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData && errorData.username) {
                toast.error('This username is already used. Try logging in, or choose another username.');
            } else if (errorData && errorData.email) {
                toast.error('This email is already registered. Try logging in, or use another email.');
            } else {
                toast.error('Registration failed. Please try again.');
            }
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        if(otpCode.length < 6) return;
        try {
            const verifyData = await verifyRegistration(formData.email, otpCode, true);
            const role = verifyData.user?.role;
            const nextPath =
                role === 'SELLER' ? '/seller-dashboard' : role === 'ADMIN' ? '/admin-dashboard' : '/buyer-dashboard';
            toast.success('Welcome! Your account is ready.');
            navigate(nextPath);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Invalid Verification Code');
        }
    };

    const handleResend = async () => {
        if(countdown > 0) return;
        try {
            const resendData = await resendOtp(formData.email, 'registration');
            setCountdown(60);
            toast.success('Verification code resent successfully', { icon: '🔄', style: { borderRadius: '10px', background: '#1e293b', color: '#fff' } });
            if (resendData?.dev_otp) {
                toast.success(`Development mode: OTP is ${resendData.dev_otp}`, { duration: 25000, icon: '🔑' });
            }
        } catch {
            toast.error('Failed to resend code');
        }
    };

    if (isVerificationStarted) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative" style={{ backgroundColor: '#11131e' }}>
                <div className="flex flex-col md:flex-row w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl relative z-10 m-4" style={{ backgroundColor: '#1a1d2d' }}>
                    {/* Left Side */}
                    <div className="w-full md:w-5/12 p-10 md:p-14 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
                        <div className="mb-6 md:mb-8 inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-300 w-max border border-white/10">
                            <span className="text-secondary tracking-widest text-[10px] uppercase">Secure</span> 
                            <span className="w-1 h-1 bg-secondary rounded-full"></span>
                            <span>Verify Email</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-medium text-white mb-4 tracking-tight leading-tight">Verify your account</h1>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                            We've sent a 6-digit confirmation code to your email. Enter it below to activate your account.
                        </p>
                    </div>
                    
                    {/* Right Side */}
                    <div className="w-full md:w-7/12 p-10 md:p-14 flex flex-col justify-center" style={{ backgroundColor: '#1e2133' }}>
                        <h2 className="text-lg md:text-xl font-medium text-white mb-2">Account Verification</h2>
                        <p className="text-gray-400 text-sm mb-6 md:mb-8">
                            Enter the 6-digit code we sent to <span className="text-white font-medium">{formData.email}</span>.
                        </p>

                        <form onSubmit={handleVerifySubmit} className="space-y-8">
                            <div className="relative">
                                <input 
                                    type="text"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-[#151724] border border-white/10 rounded-xl px-6 py-5 text-center text-white text-2xl tracking-[1.5em] focus:outline-none focus:border-secondary transition-colors"
                                    placeholder="------"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="flex flex-col-reverse md:flex-row items-center justify-between text-sm gap-6 md:gap-0">
                                <button 
                                    type="button" 
                                    onClick={handleResend}
                                    disabled={countdown > 0}
                                    className={`font-medium transition-colors ${countdown > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-secondary hover:text-white'}`}
                                >
                                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                                </button>
                                
                                <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-6">
                                    <button 
                                        type="submit"
                                        disabled={otpCode.length !== 6}
                                        className={`bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-xl font-medium transition-all shadow-lg ${otpCode.length !== 6 ? 'opacity-50 cursor-not-allowed text-white/70 shadow-none' : 'hover:opacity-90 text-white shadow-purple-500/20'}`}
                                    >
                                        Verify Account
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
                {/* Visual Flair Matching Screenshot */}
                <div className="absolute bottom-10 right-10 hidden xl:block bg-[#151724] border border-green-500/20 rounded-2xl p-4 shadow-2xl max-w-sm">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                        <div>
                            <h4 className="text-white font-medium mb-1 text-sm">Check your email</h4>
                            <p className="text-gray-400 text-xs">We sent you an OTP verification code.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex animate-fade-in">
            {/* Left Side: Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-secondary via-primary to-slate-900 relative items-center justify-center overflow-hidden">
                <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-accent/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>

                <div className="z-10 text-center text-white px-12 animate-slide-up">
                    <div className="flex justify-center mb-8">
                        <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/20 shadow-glass">
                            <ShieldCheck className="w-16 h-16 text-accent drop-shadow-xl" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-display font-black mb-6 tracking-tight drop-shadow-md leading-tight">Join the Local<br/>Revolution!</h1>
                    <p className="text-xl text-blue-100 font-light max-w-md mx-auto leading-relaxed">Create a secure account in seconds and unlock exclusive deals from sellers trusted by your neighborhood.</p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-background relative overflow-y-auto min-h-screen">
                <div className="w-full max-w-lg animate-slide-up z-10 glass-card p-8 sm:p-10 border-white/80">
                    <div className="mb-8">
                        <h2 className="text-3xl font-display font-extrabold text-gray-900 mb-2">Create Account 🚀</h2>
                        <p className="text-gray-500">Sign up to start buying or selling.</p>
                    </div>

                    {user && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <p className="text-sm font-semibold text-amber-900">
                                You are logged in as {user.username} ({user.role}). Logout to continue with another account.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(dashboardPath)}
                                    className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-amber-300 text-amber-900 hover:bg-amber-100"
                                >
                                    Continue as current user
                                </button>
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-black"
                                >
                                    Switch account (Logout)
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <form onSubmit={handleRegisterSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    className="input-field shadow-sm"
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    className="input-field shadow-sm" 
                                    placeholder="you@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    className="input-field shadow-sm pr-12" 
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
                            </div>
                            
                            {/* Password Strength Indicator */}
                            {formData.password.length > 0 && (
                                <div className="mt-2 flex items-center justify-between animate-fade-in">
                                    <div className="flex gap-1 flex-grow mr-4">
                                        <div className={`h-1.5 w-1/3 rounded-full ${getPasswordStrength().color} transition-all duration-300`}></div>
                                        <div className={`h-1.5 w-1/3 rounded-full ${formData.password.length >= 5 ? getPasswordStrength().color : 'bg-gray-200'} transition-all duration-300`}></div>
                                        <div className={`h-1.5 w-1/3 rounded-full ${formData.password.length >= 8 ? getPasswordStrength().color : 'bg-gray-200'} transition-all duration-300`}></div>
                                    </div>
                                    <span className={`text-xs font-bold ${getPasswordStrength().text}`}>{getPasswordStrength().label}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">City / Area</label>
                            <input 
                                type="text" 
                                className="input-field shadow-sm" 
                                placeholder="e.g. Mumbai, Bandra"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3 block border-b pb-2">I want to join as a:</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.role === 'BUYER' ? 'border-primary bg-primary/5 shadow-inner' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                                    <input type="radio" value="BUYER" checked={formData.role === 'BUYER'} onChange={(e) => setFormData({...formData, role: e.target.value})} className="sr-only"/>
                                    <span className={`font-bold ${formData.role === 'BUYER' ? 'text-primary' : 'text-gray-600'}`}>🛍️ Buyer</span>
                                    <span className="text-[10px] text-gray-400 mt-1">Shop local deals</span>
                                </label>
                                <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.role === 'SELLER' ? 'border-secondary bg-secondary/5 shadow-inner' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                                    <input type="radio" value="SELLER" checked={formData.role === 'SELLER'} onChange={(e) => setFormData({...formData, role: e.target.value})} className="sr-only"/>
                                    <span className={`font-bold ${formData.role === 'SELLER' ? 'text-secondary' : 'text-gray-600'}`}>🏪 Seller</span>
                                    <span className="text-[10px] text-gray-400 mt-1">List your products</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full py-4 text-lg font-bold shadow-glow mt-4">
                            Create Account
                        </button>
                    </form>
                    
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-600">
                            Already part of the community? <Link to="/login" className="font-bold text-gradient hover:underline ml-1">Sign in here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
