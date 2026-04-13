import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, TrendingUp, DollarSign, Plus, X, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [image, setImage] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const prodRes = await api.get('products/');
            setProducts(prodRes.data.results || prodRes.data);
            
            const orderRes = await api.get('orders/');
            setOrders(orderRes.data.results || orderRes.data);
            
            const catRes = await api.get('categories/');
            setCategories(catRes.data.results || catRes.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load dashboard data");
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        if (categoryId) formData.append('category_id', categoryId);
        if (image) formData.append('image', image);

        try {
            await api.post('products/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Product added successfully!");
            setIsAddingProduct(false);
            setTitle(''); setDescription(''); setPrice(''); setImage(null);
            fetchData();
        } catch (err) {
            toast.error("Failed to add product");
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`orders/${orderId}/update_status/`, { status: newStatus });
            toast.success("Order status dynamically updated!");
            fetchData();
        } catch (error) {
            toast.error("Unable to modify order status");
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 max-w-7xl">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-extrabold text-gray-900">Seller Dashboard</h1>
                <button 
                    onClick={() => setIsAddingProduct(!isAddingProduct)} 
                    className={`btn-primary flex items-center gap-2 ${isAddingProduct ? 'bg-red-500 hover:bg-red-600 from-red-500 to-red-600' : ''}`}
                >
                    {isAddingProduct ? <X className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} 
                    {isAddingProduct ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {/* Add Product Modal/Dropdown */}
            {isAddingProduct && (
                <div className="glass-card p-8 mb-12 border-l-4 border-l-primary">
                    <h2 className="text-2xl font-bold mb-6">List a New Product</h2>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input type="text" className="input-field" required value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                <input type="number" step="0.01" className="input-field" required value={price} onChange={(e) => setPrice(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select className="input-field" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                    <option value="" disabled>Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-white overflow-hidden relative group">
                                    {image ? (
                                        <div className="relative w-full h-32 object-cover">
                                             <img src={URL.createObjectURL(image)} className="w-full h-full object-cover rounded-lg" alt="Preview"/>
                                             <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-lg transition-all">
                                                 <label className="cursor-pointer text-white font-bold text-sm bg-primary/80 px-3 py-1 rounded">
                                                     Change Image
                                                     <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                                                 </label>
                                             </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 text-center">
                                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-secondary focus-within:outline-none">
                                                    <span>Upload a file</span>
                                                    <input type="file" className="sr-only" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 flex flex-col">
                            <div className="flex-grow">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea className="input-field h-32 resize-none" required value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                            </div>
                            <button type="submit" className="btn-primary w-full py-3">Publish Product</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass-card p-6 flex flex-col items-center justify-center bg-gradient-to-br from-white to-primary/5">
                    <div className="bg-primary/10 p-4 rounded-full text-primary mb-4">
                        <Package className="w-8 h-8" />
                    </div>
                    <p className="text-gray-500 mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="glass-card p-6 flex flex-col items-center justify-center bg-gradient-to-br from-white to-accent/5">
                    <div className="bg-accent/10 p-4 rounded-full text-accent mb-4">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <p className="text-gray-500 mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                </div>
                 <div className="glass-card p-6 flex flex-col items-center justify-center bg-gradient-to-br from-white to-warning/5">
                    <div className="bg-warning/10 p-4 rounded-full text-warning mb-4">
                        <DollarSign className="w-8 h-8" />
                    </div>
                    <p className="text-gray-500 mb-1">Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                        ₹{orders.reduce((acc, order) => acc + parseFloat(order.total_price), 0).toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="mb-12">
                <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Your Products</h2>
                <div className="glass-card p-6">
                    <div className="space-y-4">
                        {products.length === 0 ? <p className="text-gray-500">No products added yet.</p> : null}
                        {products.slice(0,5).map(prod => (
                            <div key={prod.id} className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-800">{prod.title}</span>
                                <span className="text-primary font-bold">₹{prod.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Management */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Truck className="w-6 h-6 text-primary"/> Fulfillment Center</h2>
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b text-gray-600 text-sm">
                                <th className="p-4 font-medium">Order ID</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Total Amount</th>
                                <th className="p-4 font-medium">Buyer</th>
                                <th className="p-4 font-medium">Current Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-b transition-colors hover:bg-gray-50/50">
                                    <td className="p-4 font-bold text-gray-800">#{order.id}</td>
                                    <td className="p-4 text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-primary font-bold">₹{order.total_price}</td>
                                    <td className="p-4 text-gray-800">{order.buyer?.username || 'Buyer'}</td>
                                    <td className="p-4">
                                        <select 
                                            className="px-3 py-1.5 rounded-lg border font-bold text-sm bg-white shadow-sm hover:border-primary transition-colors focus:outline-none"
                                            value={order.status}
                                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                        >
                                            <option value="PENDING">PENDING</option>
                                            <option value="CONFIRMED">CONFIRMED</option>
                                            <option value="SHIPPED">SHIPPED</option>
                                            <option value="DELIVERED">DELIVERED</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="p-10 text-center text-gray-500">
                            No orders received yet. Keep your inventory fresh!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
