import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const { user } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState([]);
    
    useEffect(() => {
        const loadWishlist = async () => {
            if (!user) return;
            try {
                const res = await api.get('wishlist/');
                setWishlist(res.data.results || res.data);
            } catch {
                toast.error("Failed to load wishlist");
            }
        };
        loadWishlist();
    }, [user]);

    const handleRemove = async (wishlistId) => {
        try {
            await api.delete(`wishlist/${wishlistId}/`);
            setWishlist((prev) => prev.filter((item) => item.id !== wishlistId));
            window.dispatchEvent(new Event('wishlist-updated'));
            toast.success('Removed from wishlist');
        } catch {
            toast.error('Failed to remove item');
        }
    };

    const handleMoveToCart = async (wishlistId) => {
        try {
            await api.post('wishlist/move_to_cart/', { wishlist_id: wishlistId, quantity: 1 });
            setWishlist((prev) => prev.filter((item) => item.id !== wishlistId));
            window.dispatchEvent(new Event('wishlist-updated'));
            toast.success('Moved to cart');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to move item to cart');
        }
    };

    return (
        <div className="min-h-screen px-6 lg:px-20 pt-32 pb-20 bg-background">
            <div className="max-w-7xl mx-auto animate-slide-up">
                <h2 className="text-4xl font-display font-black mb-10 text-gray-900 flex items-center gap-3 tracking-tight">
                    <Heart className="text-pink-500 w-10 h-10 drop-shadow-md" /> Your Saved Items
                </h2>
                {wishlist.length === 0 ? (
                    <div className="text-center py-32 px-6 bg-white glass-card rounded-3xl border border-gray-100 flex flex-col items-center justify-center shadow-sm">
                        <div className="w-48 h-48 bg-pink-50/50 rounded-full flex items-center justify-center mb-8 border-[6px] border-white shadow-soft">
                            <Heart className="w-20 h-20 text-pink-300 stroke-[1.5]" />
                        </div>
                        <h3 className="text-3xl font-display font-bold text-gray-900 mb-3 tracking-tight">Nothing saved yet</h3>
                        <p className="text-gray-500 mb-8 max-w-sm text-lg mx-auto font-medium lead">Items you favorite will appear here so you can easily find them later.</p>
                        <a href="/" className="btn-primary px-8 py-3 bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl transition-all">
                            Explore Products
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {wishlist.map(item => (
                            <div key={item.id} className="space-y-3">
                                <ProductCard product={item.product_details} />
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleMoveToCart(item.id)}
                                        className="inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90"
                                    >
                                        <ShoppingCart className="w-4 h-4" /> Move to Cart
                                    </button>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="inline-flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                                    >
                                        <Trash2 className="w-4 h-4" /> Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
