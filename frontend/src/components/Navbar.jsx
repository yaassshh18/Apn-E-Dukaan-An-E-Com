import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, ShoppingCart, User, LogOut, MessageSquare } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="fixed w-full z-50 glass-card rounded-none border-t-0 border-r-0 border-l-0 top-0 left-0 px-6 py-4 flex justify-between items-center transition-all duration-300">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-xl group-hover:rotate-12 transition-transform">
                    <ShoppingBag className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    Apn-E-Dukaan
                </span>
            </Link>
            
            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        <Link to={user.role === 'SELLER' ? "/seller-dashboard" : user.role === 'ADMIN' ? "/admin-dashboard" : "/buyer-dashboard"} className="text-gray-600 hover:text-primary transition-colors flex items-center gap-2 font-medium">
                            <User className="w-5 h-5" /> Dashboard
                        </Link>
                        <Link to="/chat" className="text-gray-600 hover:text-primary transition-colors flex items-center gap-2 font-medium">
                            <MessageSquare className="w-5 h-5" /> Chat
                        </Link>
                        {user.role === 'BUYER' && (
                            <Link to="/cart" className="text-gray-600 hover:text-primary transition-colors flex items-center gap-2 font-medium relative">
                                <ShoppingCart className="w-5 h-5" />
                                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
                            </Link>
                        )}
                        <button onClick={logout} className="text-gray-600 hover:text-red-500 transition-colors flex items-center gap-2 font-medium">
                            <LogOut className="w-5 h-5" /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-gray-600 hover:text-primary font-medium transition-colors">Login</Link>
                        <Link to="/register" className="btn-primary">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
