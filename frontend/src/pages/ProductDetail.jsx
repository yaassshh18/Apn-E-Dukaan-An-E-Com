import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, MessageCircle, Star, User, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(5);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const avgRating = product?.reviews?.length
        ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)
        : '4.0';

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setLoadError('');
            try {
                const res = await api.get(`products/${id}/`);
                setProduct(res.data);
                
                if (res.data.category?.slug) {
                    const rec = await api.get(`products/?category=${res.data.category.slug}`);
                    const out = rec.data.results || rec.data;
                    setRecommendations(out.filter(p => p.id !== res.data.id).slice(0, 4));
                }

                // Track recently viewed
                const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                if (!recent.find(p => p.id === res.data.id)) {
                    recent.unshift(res.data);
                    if (recent.length > 10) recent.pop();
                    localStorage.setItem('recentlyViewed', JSON.stringify(recent));
                }
            } catch (err) {
                setLoadError(err.response?.status === 404 ? 'Product not found.' : 'Failed to load product details.');
            }

            // Increment view should not block product rendering.
            try {
                await api.post(`products/${id}/increment_view/`);
            } catch (err) {
                // Ignore analytics failures for unauthenticated users.
            }

            setLoading(false);
        };
        fetchProduct();
    }, [id]);

    const handleWishlist = async () => {
        if (!user) return navigate('/login');
        try {
            await api.post('wishlist/', { product: product.id });
            toast.success('Added to Wishlist ❤️');
        } catch (error) {
            toast.error('Already in Wishlist or failed');
        }
    };

    const handleAddToCart = async () => {
        if (!user) return navigate('/login');
        if (user.role !== 'BUYER') return toast.error("Only buyers can add to cart");
        
        try {
            await api.post('cart/add_item/', { product_id: product.id, quantity: 1 });
            toast.success("Added to cart");
        } catch (error) {
            toast.error("Failed to add to cart");
        }
    };

    const handleChatClick = () => {
        if (!user) return navigate('/login');
        if (product.seller.id === user.id) return toast.error("You cannot chat with yourself!");
        
        navigate('/chat', { state: { receiver_id: product.seller.id, product_id: product.id } });
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('reviews/', { product: product.id, rating, comment: reviewText });
            toast.success("Review posted successfully!");
            setReviewText('');
            setRating(5);
            // Refresh product to get new reviews
            const res = await api.get(`products/${id}/`);
            setProduct(res.data);
        } catch (error) {
            toast.error("Failed to submit review");
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('reports/', {
                reported_product: product.id,
                reason: reportReason
            });
            toast.success("Report submitted successfully");
            setShowReportModal(false);
            setReportReason('');
        } catch (error) {
            toast.error("Failed to submit report");
        }
    };

    if (loading) return <div className="min-h-screen pt-32 text-center text-xl">Loading amazing local product...</div>;
    if (loadError) {
        return (
            <div className="min-h-screen pt-28 px-6">
                <div className="max-w-xl mx-auto glass-card p-8 text-center">
                    <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">{loadError}</h2>
                    <p className="text-gray-500 mb-6">Please browse products and try opening an available item.</p>
                    <Link to="/" className="btn-primary inline-flex px-6 py-3">Go to Home</Link>
                </div>
            </div>
        );
    }
    if (!product) return null;


    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="glass-card p-6 md:p-12 mb-12 flex flex-col md:flex-row gap-12 lg:gap-16 border-white/80 shadow-soft animate-slide-up">
                    <div className="w-full md:w-1/2">
                        <div className="bg-white h-[500px] rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center p-4">
                             {product.image ? (
                                 <img src={product.image} alt={product.title} className="w-full h-full object-cover rounded-2xl hover:scale-105 transition-transform duration-700" />
                             ) : (
                                 <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                     <ShoppingCart className="w-20 h-20 mb-4 opacity-50"/>
                                     <span className="font-display font-bold">No Image Available</span>
                                 </div>
                             )}
                        </div>
                    </div>
                    
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-green-50 text-green-700 rounded-full w-max text-sm font-bold border border-green-100">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{avgRating}</span>
                            <span className="text-green-600/70 ml-1 font-medium">(Verified)</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">{product.title}</h1>
                        <div className="flex flex-wrap items-end gap-3 mb-6">
                            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">₹{product.price}</p>
                            <span className="text-gray-400 mb-1 line-through font-medium">₹{(product.price * 1.2).toFixed(2)}</span>
                            {product.stock === 0 ? (
                                <span className="ml-2 mb-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs uppercase tracking-wide font-extrabold border border-red-100">Out of Stock</span>
                            ) : product.stock <= 3 ? (
                                <span className="ml-2 mb-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs uppercase tracking-wide font-extrabold border border-orange-100">Only {product.stock} remaining</span>
                            ) : (
                                <span className="ml-2 mb-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs uppercase tracking-wide font-extrabold border border-green-100">In Stock</span>
                            )}
                        </div>
                        <p className="text-gray-500 mb-10 text-lg leading-relaxed font-light">
                            {product.description || "Experience local quality with this premium item. Connect directly with the seller to discover more about its origins and condition before making it yours."}
                        </p>
                        
                        <Link to={`/seller/${product.seller.id}`} className="group p-4 bg-white hover:bg-gray-50 border border-gray-100 transition-all rounded-2xl mb-10 flex items-center gap-4 cursor-pointer shadow-sm hover:shadow-md">
                            <div className="w-14 h-14 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center text-white font-bold text-xl uppercase shadow-inner">
                                {product.seller?.username?.[0] || 'S'}
                            </div>
                            <div className="flex-grow">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Sold securely by</p>
                                <p className="font-bold text-gray-800 text-lg">{product.seller?.username || 'Local Seller'}</p>
                            </div>
                            <div className="bg-gray-100 group-hover:bg-primary/10 text-gray-600 group-hover:text-primary px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                                View
                            </div>
                        </Link>

                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <button onClick={handleAddToCart} disabled={product.stock === 0} className={`flex-1 flex items-center justify-center gap-2 py-4 text-lg transition-all ${product.stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed rounded-xl font-bold' : 'btn-primary shadow-glow shadow-primary/30'}`}>
                                <ShoppingCart className="w-5 h-5" /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button onClick={handleChatClick} className="btn-secondary flex-1 flex items-center justify-center gap-2 py-4 text-lg border-2 border-secondary/20 hover:border-secondary text-secondary">
                                <MessageCircle className="w-5 h-5" /> Negotiate
                            </button>
                        </div>
                        <button onClick={handleWishlist} className="w-full flex items-center justify-center gap-2 py-4 text-pink-500 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors font-bold group">
                            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" /> Add to Wishlist
                        </button>
                    </div>
                </div>

            {/* Reviews Section */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
                
                {/* Submit Review */}
                {user && user.role === 'BUYER' && (
                    <div className="glass-card p-6 mb-8">
                        <h3 className="font-bold text-gray-800 mb-4">Leave a Review</h3>
                        <form onSubmit={handleReviewSubmit}>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm font-medium text-gray-600">Rating:</span>
                                {[1,2,3,4,5].map(star => (
                                    <Star 
                                        key={star} 
                                        className={`w-6 h-6 cursor-pointer ${star <= rating ? 'fill-warning text-warning' : 'text-gray-300'}`}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                            <textarea 
                                className="input-field w-full mb-4" 
                                rows="3" 
                                placeholder="What did you think about this product?"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary">Submit Review</button>
                        </form>
                    </div>
                )}

                {/* Review List */}
                <div className="space-y-4">
                    {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map(review => (
                            <div key={review.id} className="glass-card p-6 flex gap-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                                    <User className="w-5 h-5"/>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-800">{review.user?.username || 'User'}</h4>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-warning text-warning' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600">{review.comment}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">No reviews yet. Be the first to share your experience!</p>
                    )}
                </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="mt-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-display font-extrabold text-gray-900">Recommended for You 🎯</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {recommendations.map(rek => (
                            <Link key={rek.id} to={`/product/${rek.id}`} className="block group glass-card p-0 overflow-hidden relative shadow-sm hover:shadow-hover">
                                <div className="h-56 bg-gray-100 overflow-hidden relative">
                                    {rek.image ? <img src={rek.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/> : <div className="p-4 text-center">No Image</div>}
                                </div>
                                <div className="p-5 bg-white">
                                    <h3 className="font-display font-bold text-lg mb-1 truncate text-gray-900">{rek.title}</h3>
                                    <p className="text-secondary font-extrabold text-xl tracking-tight">₹{rek.price}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Report Button */}
            <div className="mt-16 pb-12 flex justify-center">
                <button onClick={() => setShowReportModal(true)} className="flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm font-semibold transition-colors bg-white px-6 py-2 rounded-full border border-gray-200 shadow-sm">
                    Flag this item
                </button>
            </div>

            {/* Report Modal remains identical in function but styled via index.css */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up border border-gray-100">
                        <h3 className="text-3xl font-display font-extrabold text-gray-900 mb-2">Report Issue</h3>
                        <p className="text-gray-500 mb-8">Help us keep the community strictly safe by reporting bad actors.</p>
                        <form onSubmit={handleReportSubmit}>
                            <textarea 
                                className="input-field w-full mb-6 resize-none bg-gray-50 h-32" 
                                placeholder="Describe the concern clearly..."
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                required
                            />
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowReportModal(false)} className="btn-secondary flex-1 border-gray-200 text-gray-600 py-3">Cancel</button>
                                <button type="submit" className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex-1 py-3 px-6 rounded-xl font-bold transition-all shadow-glow shadow-red-500/30 active:scale-[0.98]">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default ProductDetail;
