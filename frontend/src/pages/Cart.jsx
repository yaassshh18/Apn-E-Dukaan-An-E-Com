import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Cart = () => {
    const [cart, setCart] = useState({ items: [] });
    const navigate = useNavigate();
    const backendOrigin = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

    const fetchCart = async () => {
        try {
            const res = await api.get('cart/');
            const payload = res.data?.results
                ? res.data.results[0]
                : Array.isArray(res.data)
                    ? res.data[0]
                    : res.data;
            setCart(payload || { items: [] });
        } catch (error) {
            console.error("Cart fetch error", error);
        }
    };

    useEffect(() => {
        const loadCart = async () => {
            try {
                const res = await api.get('cart/');
                const payload = res.data?.results
                    ? res.data.results[0]
                    : Array.isArray(res.data)
                        ? res.data[0]
                        : res.data;
                setCart(payload || { items: [] });
            } catch (error) {
                console.error("Cart fetch error", error);
            }
        };
        loadCart();
    }, []);

    const handleRemove = async (productId) => {
        try {
            await api.delete('cart/remove_item/', { data: { product_id: productId } });
            fetchCart();
            toast.success("Item removed");
        } catch {
            toast.error("Failed to remove item");
        }
    };

    const handleUpdateQuantity = async (productId, nextQty) => {
        if (nextQty < 1) return;
        try {
            await api.patch('cart/update_item/', { product_id: productId, quantity: nextQty });
            fetchCart();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update quantity');
        }
    };
    
    const handleCheckout = () => {
        navigate('/checkout');
    };

    const total = cart.items?.reduce((acc, item) => acc + (parseFloat(item.product?.price || 0) * item.quantity), 0) || 0;
    const getImageUrl = (image) => {
        if (!image) return '';
        if (image.startsWith('http://') || image.startsWith('https://')) return image;
        if (image.startsWith('/')) return `${backendOrigin}${image}`;
        return `${backendOrigin}/media/${image}`;
    };

    return (
        <div className="container mx-auto px-6 pt-32 pb-20 max-w-7xl min-h-screen bg-background">
            <h1 className="text-4xl font-display font-extrabold text-gray-900 mb-10 flex items-center gap-4 animate-slide-up">
                <ShoppingBag className="text-secondary w-10 h-10 drop-shadow-sm" /> Your Local Cart
            </h1>
            
            {(!cart.items || cart.items.length === 0) ? (
                <div className="glass-card text-center py-32 px-6 flex flex-col items-center justify-center animate-fade-in shadow-sm border border-gray-100 bg-white">
                    <div className="w-48 h-48 bg-gray-50 rounded-full flex items-center justify-center mb-10 shadow-inner relative">
                        <div className="absolute inset-0 bg-secondary/10 rounded-full animate-ping opacity-30 animation-duration-3s"></div>
                        <ShoppingBag className="w-24 h-24 text-gray-300 drop-shadow-sm" />
                    </div>
                    <h2 className="text-4xl font-display font-bold text-gray-900 mb-4 tracking-tight">Your cart is feeling light</h2>
                    <p className="text-gray-500 mb-10 max-w-md text-lg font-medium leading-relaxed">Discover top-rated local items and bring your community's best right to your doorstep.</p>
                    <Link to="/" className="btn-primary px-10 py-4 text-lg shadow-glow hover:scale-105 active:scale-95 transition-transform bg-gradient-to-r from-primary to-secondary">
                        Start Exploring
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-10 animate-fade-in">
                    <div className="lg:w-2/3 space-y-6">
                        {cart.items.map(item => (
                            <div key={item.id} className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 hover:shadow-hover transition-shadow bg-white text-left relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <Link to={`/product/${item.product?.id}`} className="flex flex-col sm:flex-row items-center gap-6 w-full flex-grow min-w-0">
                                    <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                        {item.product?.image ? (
                                            <img
                                                src={getImageUrl(item.product.image)}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = 'https://placehold.co/320x320?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex justify-center items-center text-gray-400 font-bold bg-gray-50 text-xs text-center border border-gray-100">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-grow w-full text-center sm:text-left min-w-0">
                                        <h3 className="font-display font-extrabold text-xl text-gray-900 mb-1 hover:text-primary transition-colors truncate">{item.product?.title}</h3>
                                        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">₹{item.product?.price}</p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold shadow-sm">
                                                <button onClick={(e) => { e.preventDefault(); handleUpdateQuantity(item.product?.id, item.quantity - 1); }} className="px-2">-</button>
                                                <span>Qty: {item.quantity}</span>
                                                <button onClick={(e) => { e.preventDefault(); handleUpdateQuantity(item.product?.id, item.quantity + 1); }} className="px-2">+</button>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-500">
                                                Item total: ₹{(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                                <button onClick={() => handleRemove(item.product?.id)} className="absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shadow-sm border border-transparent hover:border-red-100 bg-white">
                                    <Trash2 className="w-5 h-5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="lg:w-1/3">
                        <div className="glass-card p-8 sticky top-32 bg-white shadow-soft border border-gray-100">
                            <h3 className="text-2xl font-display font-extrabold mb-6 border-b border-gray-100 pb-4 text-gray-900 flex justify-between items-center">
                                Order Summary
                                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">Cart</span>
                            </h3>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="font-bold text-gray-900">₹{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-gray-500 font-medium">Local Delivery</span>
                                    <span className="font-extrabold text-green-500 bg-green-50 px-3 py-1 rounded-full text-sm border border-green-100">FREE</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-8 pt-6 border-t border-gray-100 text-2xl font-black">
                                <span className="text-gray-900">Total</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">₹{total.toFixed(2)}</span>
                            </div>
                            <button onClick={handleCheckout} className="w-full py-4 text-lg font-black bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-glow hover:scale-[1.02] active:scale-95 transition-all">
                                Secure Checkout
                            </button>
                            <p className="text-center text-gray-400 text-xs mt-4 font-medium flex items-center justify-center gap-1">
                                🔒 Secure encrypted transaction
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
