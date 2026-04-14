import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';

const Login = () => {
    const { user, initiateLogin, verifyLogin, resendOtp, logout } = useContext(AuthContext);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // 2FA State
    const [is2FAStarted, setIs2FAStarted] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [countdown, setCountdown] = useState(60);

    const navigate = useNavigate();
    const dashboardPath = user?.role === 'SELLER' ? '/seller-dashboard' : user?.role === 'ADMIN' ? '/admin-dashboard' : '/buyer-dashboard';

    // Timer logic for resend Code
    useEffect(() => {
        let timer;
        if (is2FAStarted && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [is2FAStarted, countdown]);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await initiateLogin(loginUsername, loginEmail, password);
            setUserEmail(data.email);
            setIs2FAStarted(true);
            setCountdown(60);
            toast.success('Check your email. Verification code sent!', { icon: '📧', style: { borderRadius: '10px', background: '#1e293b', color: '#fff' } });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Invalid credentials');
        }
    };

    const handle2FASubmit = async (e) => {
        e.preventDefault();
        if(otpCode.length < 6) return;
        try {
            await verifyLogin(userEmail, otpCode, rememberMe);
            toast.success('Welcome back!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Invalid OTP Code');
        }
    };

    const handleResend = async () => {
        if(countdown > 0) return;
        try {
            await resendOtp(userEmail, 'login');
            setCountdown(60);
            toast.success('Verification code resent successfully', { icon: '🔄', style: { borderRadius: '10px', background: '#1e293b', color: '#fff' } });
        } catch {
            toast.error('Failed to resend code');
        }
    };

    if (is2FAStarted) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative" style={{ backgroundColor: '#11131e' }}>
                <div className="flex flex-col md:flex-row w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl relative z-10 m-4" style={{ backgroundColor: '#1a1d2d' }}>
                    {/* Left Side */}
                    <div className="w-full md:w-5/12 p-10 md:p-14 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
                        <div className="mb-6 md:mb-8 inline-flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-300 w-max border border-white/10">
                            <span className="text-secondary tracking-widest text-[10px] uppercase">Secure</span> 
                            <span className="w-1 h-1 bg-secondary rounded-full"></span>
                            <span>2FA Protected</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-medium text-white mb-4 tracking-tight leading-tight">Sign in to your workspace</h1>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                            Sign in with your username, email, and password, followed by an email verification code.
                        </p>
                    </div>
                    
                    {/* Right Side */}
                    <div className="w-full md:w-7/12 p-10 md:p-14 flex flex-col justify-center" style={{ backgroundColor: '#1e2133' }}>
                        <h2 className="text-lg md:text-xl font-medium text-white mb-2">Two-factor authentication</h2>
                        <p className="text-gray-400 text-sm mb-6 md:mb-8">
                            Enter the 6-digit verification code we sent to <span className="text-white font-medium">{userEmail || 'your email'}</span>.
                        </p>

                        <form onSubmit={handle2FASubmit} className="space-y-8">
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
                                        type="button" 
                                        onClick={() => setIs2FAStarted(false)}
                                        className="text-white hover:text-gray-300 font-medium transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={otpCode.length !== 6}
                                        className={`bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-xl font-medium transition-all shadow-lg ${otpCode.length !== 6 ? 'opacity-50 cursor-not-allowed text-white/70 shadow-none' : 'hover:opacity-90 text-white shadow-purple-500/20'}`}
                                    >
                                        Verify & Sign in
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
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary via-secondary to-purple-900 relative items-center justify-center overflow-hidden">
                {/* Animated Background Blobs */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-accent/30 rounded-full mix-blend-screen filter blur-[80px] animate-blob"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>

                <div className="z-10 text-center text-white px-12 animate-slide-up">
                    <div className="flex justify-center mb-6">
                        <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                            <ShoppingBag className="w-16 h-16 text-white drop-shadow-xl" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-display font-black mb-4 tracking-tight drop-shadow-md">Apn-E-Dukaan</h1>
                    <p className="text-xl text-blue-100 font-light max-w-sm mx-auto leading-relaxed">The premium hyperlocal marketplace for your neighborhood. Shop local, securely and effortlessly.</p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-background relative">
                {/* Mobile Blob */}
                <div className="absolute md:hidden top-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 blur-[100px] rounded-full mix-blend-multiply pointer-events-none"></div>
                
                <div className="w-full max-w-md animate-slide-up z-10 glass-card p-10 border-white/80">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-4xl font-display font-extrabold text-gray-900 mb-2">Welcome Back 👋</h2>
                        <p className="text-gray-500 text-lg">Login to explore exclusive local deals.</p>
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
                    
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                className="input-field shadow-sm hover:shadow-md"
                                placeholder="Enter your username"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                className="input-field shadow-sm hover:shadow-md" 
                                placeholder="Enter your email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    className="input-field shadow-sm hover:shadow-md pr-12" 
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 transition-all cursor-pointer"
                                />
                                <span className="text-gray-600 group-hover:text-primary transition-colors">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="font-semibold text-secondary hover:text-primary transition-colors hover:underline">Forgot Password?</Link>
                        </div>

                        <button type="submit" className="btn-primary w-full text-lg py-4 mt-2 shadow-glow hover:shadow-primary/50">
                            Continue to 2FA
                        </button>
                    </form>
                    
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-600">
                            New to Apn-E-Dukaan? <Link to="/register" className="font-bold text-gradient hover:underline ml-1 tracking-wide">Create an account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
