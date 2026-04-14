import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const ratings = product.reviews?.map((r) => r.rating) || [];
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '4.0';

    const handleWishlist = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        try {
            await api.post('wishlist/', { product: product.id });
            toast.success('Added to Wishlist ❤️');
        } catch (error) {
            toast.error('Already in Wishlist or failed');
        }
    };

    return (
        <Link to={`/product/${product.id}`} className="block group glass-card p-0 overflow-hidden relative">
            <button 
                onClick={handleWishlist} 
                className="absolute top-4 right-4 bg-white/70 backdrop-blur pb-[2px] p-2.5 rounded-full text-gray-400 hover:text-pink-500 hover:bg-white transition-all shadow-md z-20 hover:scale-110 active:scale-95"
            >
                <Heart className="w-5 h-5" />
            </button>
            <div className="h-56 bg-gray-100 overflow-hidden relative">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                {product.image ? (
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                {/* Float Category badge */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                    {product.category && (
                        <span className="bg-white/80 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full text-gray-700 shadow-sm w-max">
                            {product.category.name}
                        </span>
                    )}
                    {product.stock === 0 ? (
                        <span className="bg-red-500/90 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full text-white shadow-md w-max">
                            Out of Stock
                        </span>
                    ) : product.stock <= 3 ? (
                        <span className="bg-orange-500/90 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full text-white shadow-md w-max">
                            Only {product.stock} left
                        </span>
                    ) : null}
                </div>
            </div>
            <div className="p-5 relative z-20 bg-white">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-bold text-lg text-gray-900 line-clamp-1">{product.title}</h3>
                    <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md text-xs font-bold text-green-700">
                        ⭐ {avgRating}
                    </div>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                     <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span> By {product.seller?.username || 'Verified Local'}
                </p>
                <div className="flex items-center justify-between">
                    <p className="text-2xl font-extrabold text-gray-900 tracking-tight">₹{product.price}</p>
                    <div className="btn-primary py-2 px-4 shadow-glow opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        Details
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
