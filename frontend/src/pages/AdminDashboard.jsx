import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Shield, ShoppingBag, TrendingUp, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ products: [], orders: [] });

    const fetchAdminData = async () => {
        try {
            const prodRes = await api.get('products/');
            const orderRes = await api.get('orders/');
            // In a real app we'd fetch users too, but we can infer metrics from here for the demo
            setStats({
                products: prodRes.data.results || prodRes.data,
                orders: orderRes.data.results || orderRes.data,
            });
        } catch {
            toast.error("Failed to load global admin data.");
        }
    };

    useEffect(() => {
        const loadAdminData = async () => {
            try {
                const prodRes = await api.get('products/');
                const orderRes = await api.get('orders/');
                setStats({
                    products: prodRes.data.results || prodRes.data,
                    orders: orderRes.data.results || orderRes.data,
                });
            } catch {
                toast.error("Failed to load global admin data.");
            }
        };
        loadAdminData();
    }, []);

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to forcibly remove this product from the marketplace?")) return;
        try {
            await api.delete(`products/${id}/`);
            toast.success("Product deleted successfully by system admin");
            fetchAdminData();
        } catch {
            toast.error("Failed to delete product");
        }
    };

    const totalRevenue = stats.orders.reduce((acc, order) => acc + parseFloat(order.total_price), 0);

    return (
        <div className="container mx-auto px-6 py-12 max-w-7xl">
            <div className="flex items-center gap-4 mb-10 border-b pb-6">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                    <Shield className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Admin Control Center</h1>
                    <p className="text-gray-500">Global oversight & moderation</p>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass-card p-6 flex flex-col justify-center bg-gray-50/50">
                    <p className="text-gray-500 mb-1 flex items-center gap-2"><ShoppingBag className="w-4 h-4"/> Global Listings</p>
                    <p className="text-4xl font-black text-gray-800">{stats.products.length}</p>
                </div>
                <div className="glass-card p-6 flex flex-col justify-center bg-gray-50/50">
                    <p className="text-gray-500 mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Total Platform Orders</p>
                    <p className="text-4xl font-black text-gray-800">{stats.orders.length}</p>
                </div>
                 <div className="glass-card p-6 flex flex-col justify-center bg-gray-50/50 border-l-4 border-l-primary">
                    <p className="text-gray-500 mb-1 flex items-center gap-2">Gross Network Value</p>
                    <p className="text-4xl font-black text-primary">₹{totalRevenue.toFixed(2)}</p>
                </div>
            </div>

            {/* Moderation Panels */}
            <div className="grid grid-cols-1 gap-10">
                <div className="glass-card p-6 border border-red-100">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                         Marketplace Moderation Log
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                                    <th className="p-4 font-medium">ID</th>
                                    <th className="p-4 font-medium">Product Title</th>
                                    <th className="p-4 font-medium">Price</th>
                                    <th className="p-4 font-medium">Seller ID</th>
                                    <th className="p-4 font-medium w-24 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.products.map(prod => (
                                    <tr key={prod.id} className="border-b hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 text-gray-500 text-sm">#{prod.id}</td>
                                        <td className="p-4 font-bold text-gray-800">{prod.title}</td>
                                        <td className="p-4 text-primary font-bold">₹{prod.price}</td>
                                        <td className="p-4 text-gray-500 text-sm">User: {prod.seller?.id}</td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleDeleteProduct(prod.id)}
                                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Forcibly Remove"
                                            >
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {stats.products.length === 0 && <p className="text-center py-10 text-gray-500">No products active.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
