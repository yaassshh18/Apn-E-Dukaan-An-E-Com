import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, ShoppingCart, User, LogOut, MessageSquare, Menu, X, Heart } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white/60 backdrop-blur-2xl border-b border-white/40 shadow-sm top-0 left-0 px-6 py-4 flex justify-between items-center transition-all duration-300">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-gradient-to-tr from-primary to-secondary p-2.5 rounded-xl group-hover:rotate-12 group-hover:scale-110 shadow-glow transition-all duration-300">
                    <ShoppingBag className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-display font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-tight">
                    Apn-E-Dukaan
                </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
                {user ? (
                    <>
                        <Link to="/chat" className="text-gray-600 hover:text-primary transition-colors flex items-center gap-2 font-semibold">
                            <MessageSquare className="w-5 h-5" />
                        </Link>
                        <NotificationBell />
                        {user.role === 'BUYER' && (
                            <>
                                <Link to="/wishlist" className="text-gray-600 hover:text-pink-500 transition-colors flex items-center gap-2 font-semibold relative">
                                    <Heart className="w-5 h-5" />
                                </Link>
                                <Link to="/cart" className="text-gray-600 hover:text-primary transition-colors flex items-center gap-2 font-semibold relative">
                                    <ShoppingCart className="w-5 h-5" />
                                </Link>
                            </>
                        )}
                        <div className="h-6 w-px bg-gray-200 mx-2"></div>
                        <Link to={user.role === 'SELLER' ? "/seller-dashboard" : user.role === 'ADMIN' ? "/admin-dashboard" : "/buyer-dashboard"} className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-4 rounded-full border border-transparent hover:border-gray-200 transition-all">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold shadow-sm">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-800">{user.username}</span>
                        </Link>
                        <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-gray-600 font-semibold hover:text-primary transition-colors">Log In</Link>
                        <Link to="/register" className="btn-primary shadow-glow">Start Selling</Link>
                    </>
                )}
            </div>
            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-gray-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                 {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full glass-card border-t bg-white/95 flex flex-col p-4 gap-4 md:hidden animate-fade-in-down shadow-xl z-50">
                     {user ? (
                        <>
                            <Link onClick={() => setIsMobileMenuOpen(false)} to={user.role === 'SELLER' ? "/seller-dashboard" : user.role === 'ADMIN' ? "/admin-dashboard" : "/buyer-dashboard"} className="text-gray-800 hover:text-primary transition-colors flex items-center gap-2 font-medium p-2 bg-gray-50 rounded-lg">
                                <User className="w-6 h-6" /> Dashboard
                            </Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} to="/chat" className="text-gray-800 hover:text-primary transition-colors flex items-center gap-2 font-medium p-2 bg-gray-50 rounded-lg">
                                <MessageSquare className="w-6 h-6" /> Chat
                            </Link>
                            <div className="flex justify-center p-2 bg-gray-50 rounded-lg">
                                <NotificationBell />
                            </div>
                            {user.role === 'BUYER' && (
                                <>
                                    <Link onClick={() => setIsMobileMenuOpen(false)} to="/wishlist" className="text-gray-800 hover:text-pink-500 transition-colors flex items-center gap-2 font-medium p-2 bg-gray-50 rounded-lg">
                                        <Heart className="w-6 h-6" /> Wishlist
                                    </Link>
                                    <Link onClick={() => setIsMobileMenuOpen(false)} to="/cart" className="text-gray-800 hover:text-primary transition-colors flex items-center gap-2 font-medium p-2 bg-gray-50 rounded-lg">
                                        <ShoppingCart className="w-6 h-6" /> View Cart
                                    </Link>
                                </>
                            )}
                            <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium p-2 rounded-lg text-left">
                                <LogOut className="w-6 h-6" /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link onClick={() => setIsMobileMenuOpen(false)} to="/login" className="text-gray-800 hover:text-primary font-medium transition-colors p-2 text-center bg-gray-50 rounded-lg">Login</Link>
                            <Link onClick={() => setIsMobileMenuOpen(false)} to="/register" className="btn-primary text-center">Sign Up</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
