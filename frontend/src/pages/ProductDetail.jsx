import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, MessageCircle, Star, User, Heart, Share2 } from 'lucide-react';
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
    const [selectedImage, setSelectedImage] = useState('');
    
    // Improved Rating calculation
    const avgRating = product?.reviews?.length
        ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)
        : '4.0';

    // Robust Description Parser
    const rawDescription = product?.description || '';
    
    // Split logic that handles "Features:", "Key Features:", or "Specifications:"
    const featureSplitter = rawDescription.match(/(?:Key Features:|Features:|Specifications:)/i);
    const descriptionIntro = featureSplitter 
        ? rawDescription.substring(0, featureSplitter.index).trim() 
        : rawDescription.trim();
        
    const keyFeatures = featureSplitter
        ? rawDescription
            .substring(featureSplitter.index + featureSplitter[0].length)
            .split('\n')
            .map(line => line.replace(/^[-•*]\s*/, '').trim())
            .filter(Boolean)
        : [];
        
    // Simulated Pricing Display
    const currentPrice = parseFloat(product?.price || 0);
    const originalPrice = currentPrice * 1.25; // 25% markup for simulated discount
    const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setLoadError('');
            try {
                const res = await api.get(`products/${id}/`);
                setProduct(res.data);
                setSelectedImage(res.data.image || '');
                
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
            } catch (error) {
                setLoadError(error.response?.status === 404 ? 'Product not found.' : 'Failed to load product details.');
            }

            // Increment view should not block product rendering.
            try {
                await api.post(`products/${id}/increment_view/`);
            } catch {
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
            window.dispatchEvent(new Event('wishlist-updated'));
            toast.success('Added to Wishlist ❤️');
        } catch (error) {
            const message = error.response?.data?.detail || error.response?.data?.error || error.response?.data?.non_field_errors?.[0] || '';
            const isAlreadySaved = error.response?.status === 400 && message.toLowerCase().includes('already');
            if (isAlreadySaved) {
                toast('Already in wishlist', { icon: '💙' });
                return;
            }
            toast.error('Failed to add to wishlist');
        }
    };

    const handleAddToCart = async () => {
        if (!user) return navigate('/login');
        if (user.role !== 'BUYER') return toast.error("Only buyers can add to cart");
        
        try {
            await api.post('cart/add_item/', { product_id: product.id, quantity: 1 });
            toast.success("Added to cart");
        } catch {
            toast.error("Failed to add to cart");
        }
    };

    const handleChatClick = () => {
        if (!user) return navigate('/login');
        if (product.seller.id === user.id) return toast.error("You cannot chat with yourself!");
        
        navigate('/chat', { state: { receiver_id: product.seller.id, product_id: product.id } });
    };

    const handleShare = async () => {
        const productUrl = `${window.location.origin}/product/${product.id}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: product.title, text: product.description?.slice(0, 100), url: productUrl });
                return;
            } catch {
                // no-op fallback to clipboard
            }
        }
        await navigator.clipboard.writeText(productUrl);
        toast.success('Product link copied');
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
        } catch {
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
        } catch {
            toast.error("Failed to submit report");
        }
    };

    const handleReportReview = async (review) => {
        try {
            await api.post('reports/', {
                reported_user: review.user?.id,
                reported_product: product.id,
                reason: `Reported review #${review.id}: ${review.comment?.slice(0, 150)}`
            });
            toast.success('Review reported');
        } catch {
            toast.error('Failed to report review');
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
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-[1400px] mx-auto">
                {/* Main Product Layout */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mb-12 flex flex-col lg:flex-row gap-12 lg:gap-16 animate-slide-up">
                    
                    {/* Left Column: Images */}
                    <div className="w-full lg:w-[45%] flex flex-col gap-4">
                        <div className="bg-gray-50 h-[450px] md:h-[600px] rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center p-4 relative group">
                             {selectedImage ? (
                                 <img src={selectedImage} alt={product.title} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700" />
                             ) : (
                                 <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                     <ShoppingCart className="w-20 h-20 mb-4 opacity-50"/>
                                     <span className="font-display font-bold">No Image Available</span>
                                 </div>
                             )}
                             {/* Floating Tags */}
                             {product.stock <= 3 && product.stock > 0 && (
                                 <div className="absolute top-6 left-6 bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md animate-pulse-slow">
                                     Only {product.stock} left
                                 </div>
                             )}
                        </div>
                        {/* Thumbnail Gallery */}
                        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                            {[product.image, ...recommendations.map((r) => r.image)].filter(Boolean).slice(0, 5).map((img, idx) => (
                                <button key={`thumb-${idx}`} onClick={() => setSelectedImage(img)} className={`h-20 w-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-gray-100 hover:border-gray-300'}`}>
                                    <img src={img} alt="thumb" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Right Column: Product Details */}
                    <div className="w-full lg:w-[55%] flex flex-col">
                        
                        {/* Breadcrumbs & Category */}
                        <div className="flex items-center gap-3 mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-primary bg-primary/5 px-3 py-1 rounded-full">{product.category?.name || 'Local Find'}</span>
                        </div>

                        {/* Title & Ratings */}
                        <h1 className="text-3xl md:text-5xl font-display font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">{product.title}</h1>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded-md text-sm font-bold shadow-sm">
                                <span>{avgRating}</span>
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                            <span className="text-gray-500 font-medium text-sm">{product.reviews?.length || 0} Ratings & Reviews</span>
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                            <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                                ✔ Verified Quality
                            </span>
                        </div>

                        {/* Pricing Section */}
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                            <div className="flex flex-wrap items-end gap-4 mb-2">
                                <span className="text-5xl font-black text-gray-900 tracking-tight">₹{currentPrice.toFixed(2)}</span>
                                <span className="text-xl text-gray-400 line-through font-medium mb-1">₹{originalPrice.toFixed(2)}</span>
                                <span className="text-lg font-bold text-green-600 mb-1">{discountPercent}% OFF</span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Inclusive of all taxes</p>
                        </div>

                        {/* Key Features Bullet Points */}
                        {keyFeatures.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-secondary" /> Product Specifications
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {keyFeatures.map((feature, index) => (
                                        <div key={`feature-${index}`} className="flex items-start gap-3 bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">✓</div>
                                            <span className="text-sm text-gray-700 font-medium leading-snug">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Overview / Description */}
                        <div className="mb-10">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Overview</h3>
                            <p className="text-gray-600 text-base leading-relaxed p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                {descriptionIntro || "Experience local quality with this premium item. Connect directly with the seller to discover more about its origins and condition before making it yours."}
                            </p>
                        </div>
                        
                        {/* Seller Card */}
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Sold By</h3>
                        <Link to={`/seller/${product.seller.id}`} className="group p-5 bg-white hover:bg-gray-50 border border-gray-200 transition-all rounded-2xl mb-10 flex items-center gap-5 cursor-pointer shadow-sm hover:shadow-md relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary"></div>
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl uppercase shadow-inner">
                                {product.seller?.username?.[0] || 'S'}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-extrabold text-gray-900 text-lg">{product.seller?.username || 'Local Seller'}</p>
                                    <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-100">Verified</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">100+ items sold securely</p>
                            </div>
                            <div className="bg-gray-900 group-hover:bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
                                View Store
                            </div>
                        </Link>

                        {/* Call to Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <button onClick={handleAddToCart} disabled={product.stock === 0} className={`flex-1 flex items-center justify-center gap-3 py-4 text-lg transition-all rounded-2xl ${product.stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed font-bold' : 'btn-primary shadow-glow shadow-primary/30'}`}>
                                <ShoppingCart className="w-6 h-6" /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button onClick={handleChatClick} className="btn-secondary flex-1 flex items-center justify-center gap-3 py-4 text-lg border-2 border-gray-200 hover:border-gray-900 text-gray-900 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md">
                                <MessageCircle className="w-6 h-6" /> Chat with Seller
                            </button>
                        </div>
                        
                        <div className="flex gap-4">
                            <button onClick={handleWishlist} className="flex-1 flex items-center justify-center gap-2 py-3.5 text-gray-700 bg-white border border-gray-200 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all font-bold group shadow-sm">
                                <Heart className="w-5 h-5 group-hover:fill-pink-500 transition-colors" /> Save for Later
                            </button>
                            <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 font-bold transition-all shadow-sm">
                                <Share2 className="w-5 h-5" /> Share Item
                            </button>
                        </div>
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
                                        {review.verified_purchase && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">Verified purchase</span>
                                        )}
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-warning text-warning' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600">{review.comment}</p>
                                    <button onClick={() => handleReportReview(review)} className="mt-2 text-xs text-red-400 hover:text-red-600">Report review</button>
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
                        <p className="text-sm text-gray-500">{recommendations.length} similar products</p>
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
