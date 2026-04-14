import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, TrendingUp, DollarSign, Plus, X, Truck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    const [stock, setStock] = useState('1');
    const [categoryId, setCategoryId] = useState('');
    const [image, setImage] = useState(null);

    const fetchData = async () => {
        try {
            const prodRes = await api.get('products/');
            setProducts(prodRes.data.results || prodRes.data);
            
            const orderRes = await api.get('orders/');
            setOrders(orderRes.data.results || orderRes.data);
            
            const catRes = await api.get('categories/');
            setCategories(catRes.data.results || catRes.data);
        } catch {
            toast.error("Failed to load dashboard data");
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const prodRes = await api.get('products/');
                setProducts(prodRes.data.results || prodRes.data);
                
                const orderRes = await api.get('orders/');
                setOrders(orderRes.data.results || orderRes.data);
                
                const catRes = await api.get('categories/');
                setCategories(catRes.data.results || catRes.data);
            } catch {
                toast.error("Failed to load dashboard data");
            }
        };
        loadData();
    }, []);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        if (categoryId) formData.append('category_id', categoryId);
        if (image) formData.append('image', image);

        try {
            await api.post('products/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Product added successfully!");
            setIsAddingProduct(false);
            setTitle(''); setDescription(''); setPrice(''); setStock('1'); setImage(null);
            fetchData();
        } catch {
            toast.error("Failed to add product");
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`orders/${orderId}/update_status/`, { status: newStatus });
            toast.success("Order status dynamically updated!");
            fetchData();
        } catch {
            toast.error("Unable to modify order status");
        }
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-6 lg:px-10">
            <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
                {/* Header Profile Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div>
                        <h1 className="text-4xl font-display font-extrabold text-gray-900 tracking-tight">Seller Hub</h1>
                        <p className="text-gray-500 font-medium mt-1">Manage inventory, track sales, and grow your local business.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddingProduct(!isAddingProduct)} 
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isAddingProduct ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm' : 'bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl hover:-translate-y-0.5'}`}
                    >
                        {isAddingProduct ? <X className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} 
                        {isAddingProduct ? 'Cancel' : 'New Listing'}
                    </button>
                </div>

            {/* Add Product Modular Section */}
            {isAddingProduct && (
                <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 animate-slide-up relative">
                    <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-2 border-b border-gray-100 pb-4">
                        <Package className="w-6 h-6 text-primary" /> Create New Listing
                    </h2>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Product Title</label>
                                <input type="text" className="input-field bg-gray-50 border-gray-200 focus:bg-white" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Vintage Camera" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                                    <input type="number" step="0.01" className="input-field bg-gray-50 border-gray-200 focus:bg-white" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Stock Qty</label>
                                    <input type="number" min="1" step="1" className="input-field bg-gray-50 border-gray-200 focus:bg-white" required value={stock} onChange={(e) => setStock(e.target.value)} placeholder="1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <select className="input-field bg-gray-50 border-gray-200 focus:bg-white" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                        <option value="" disabled>Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Listing Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden relative group">
                                    {image ? (
                                        <div className="relative w-full h-40 object-cover">
                                             <img src={URL.createObjectURL(image)} className="w-full h-full object-cover rounded-xl shadow-sm" alt="Preview"/>
                                             <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-xl transition-all">
                                                 <label className="cursor-pointer text-white font-bold text-sm bg-black/50 hover:bg-black/80 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm">
                                                     Replace Image
                                                     <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                                                 </label>
                                             </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-center py-4">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                                <Package className="h-8 w-8 text-primary" />
                                            </div>
                                            <div className="flex justify-center text-sm text-gray-600">
                                                <label className="relative cursor-pointer rounded-md font-bold text-primary hover:text-secondary focus-within:outline-none">
                                                    <span>Click to upload</span>
                                                    <input type="file" className="sr-only" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium">PNG, JPG up to 10MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6 flex flex-col">
                            <div className="flex-grow">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Description</label>
                                <textarea className="input-field bg-gray-50 border-gray-200 focus:bg-white h-[284px] resize-none leading-relaxed" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the condition, features, and why someone should buy this..."></textarea>
                            </div>
                            <button type="submit" className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-black text-lg shadow-glow hover:scale-[1.02] transition-transform">🚀 Publish Product</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats Cards */}
            {/* Key SaaS Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-hover transition-shadow relative overflow-hidden">
                    <div className="absolute w-24 h-24 bg-primary/5 rounded-full -right-4 -bottom-4 mix-blend-multiply transition-transform group-hover:scale-150"></div>
                    <div>
                        <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-1">Active inventory</p>
                        <p className="text-4xl font-display font-black text-gray-900">{products.length}</p>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                        <Package className="w-8 h-8" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-hover transition-shadow relative overflow-hidden">
                    <div className="absolute w-24 h-24 bg-secondary/5 rounded-full -right-4 -bottom-4 mix-blend-multiply transition-transform group-hover:scale-150"></div>
                    <div>
                        <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-1">Total Orders</p>
                        <p className="text-4xl font-display font-black text-gray-900">{orders.length}</p>
                    </div>
                    <div className="bg-secondary/10 p-4 rounded-2xl text-secondary">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-hover transition-shadow relative overflow-hidden">
                    <div className="absolute w-24 h-24 bg-accent/5 rounded-full -right-4 -bottom-4 mix-blend-multiply transition-transform group-hover:scale-150"></div>
                    <div>
                        <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-1">Gross Revenue</p>
                        <p className="text-4xl font-display font-black text-gray-900">
                            ₹{orders.reduce((acc, order) => acc + parseFloat(order.total_price), 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-accent/10 p-4 rounded-2xl text-accent">
                        <DollarSign className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Secondary Grid (Chart & Products) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-display font-bold mb-6 flex items-center justify-between text-gray-900">
                        Revenue Velocity 
                        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-bold">Past 30 Days</span>
                    </h2>
                    <div className="flex-grow min-h-[300px] w-full mt-4">
                        {orders.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={
                                    Object.values(orders.reduce((acc, current) => {
                                        const date = new Date(current.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
                                        if(!acc[date]) acc[date] = { date, revenue: 0 };
                                        acc[date].revenue += parseFloat(current.total_price);
                                        return acc;
                                    }, {})).sort((a,b) => new Date(a.date) - new Date(b.date))
                                }>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f3f4f6"/>
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dx={-15} tickFormatter={(value) => `₹${value}`}/>
                                    <Tooltip cursor={{ stroke: '#f3f4f6', strokeWidth: 2, fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 'bold' }}/>
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={5} activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff' }} fill="url(#colorRevenue)" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl mx-1 font-medium bg-gray-50/50">Gathering sales data...</div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-display font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">Top Inventory</h2>
                    <div className="space-y-5 flex-grow overflow-y-auto">
                        {products.length === 0 ? (
                            <div className="text-center text-gray-400 pt-10 font-medium">No products listed.</div>
                        ) : null}
                        {products.slice(0,6).map(prod => (
                            <div key={prod.id} className="flex justify-between items-center group">
                                <div className="flex items-center gap-3 w-full min-w-0 pr-4">
                                     <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0">
                                         {prod.image ? <img src={prod.image} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-full h-full p-2 text-gray-400"/>}
                                     </div>
                                    <span className="font-bold text-gray-800 truncate text-sm">{prod.title}</span>
                                </div>
                                <span className="text-primary font-black text-sm bg-primary/5 px-2 py-1 rounded">₹{prod.price}</span>
                            </div>
                        ))}
                    </div>
                    {products.length > 6 && <button className="w-full mt-4 py-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer bg-gray-50 rounded-lg">View All Inventory</button>}
                </div>
            </div>

            {/* Orders Management */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-2xl font-display font-extrabold text-gray-900 flex items-center gap-3"><Truck className="w-7 h-7 text-primary p-1 bg-primary/10 rounded-lg"/> Fulfillment Center</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                                <th className="px-8 py-5">Order Ref</th>
                                <th className="px-8 py-5">Transacted</th>
                                <th className="px-8 py-5">Gross Amount</th>
                                <th className="px-8 py-5">Buyer</th>
                                <th className="px-8 py-5">Pipeline Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map(order => (
                                <tr key={order.id} className="transition-colors hover:bg-gray-50/50 group">
                                    <td className="px-8 py-5 font-black text-gray-900">#ORD-{order.id.toString().padStart(4, '0')}</td>
                                    <td className="px-8 py-5 text-gray-500 font-medium text-sm">{new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                    <td className="px-8 py-5 text-gray-900 font-black">₹{order.total_price}</td>
                                    <td className="px-8 py-5 text-gray-700 font-bold flex items-center gap-2">
                                        <div className="w-6 h-6 bg-secondary/10 text-secondary rounded-full flex justify-center items-center text-xs">{order.buyer?.username?.[0]?.toUpperCase()}</div>
                                        {order.buyer?.username || 'Buyer'}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="relative line-clamp-1 inline-block">
                                            <select 
                                                className={`pl-4 pr-8 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 border shadow-sm transition-all
                                                    ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-400' : 
                                                      order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-400' : 
                                                      order.status === 'CONFIRMED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-400' : 
                                                      'bg-orange-50 text-orange-700 border-orange-200 focus:ring-orange-400'}
                                                `}
                                                value={order.status}
                                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                            >
                                                <option value="PENDING">Pending Setup</option>
                                                <option value="CONFIRMED">Confirmed</option>
                                                <option value="SHIPPED">In Transit</option>
                                                <option value="DELIVERED">Delivered ✔️</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="p-16 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
                            <Truck className="w-12 h-12 mb-4 text-gray-300" />
                            <p className="font-bold text-gray-500">Pipeline is empty</p>
                            <p className="text-sm">New orders will appear here for fulfillment tracking.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </div>
    );
};

export default SellerDashboard;
