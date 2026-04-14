import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, Clock, PackageCheck, Truck } from 'lucide-react';

const BuyerDashboard = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const res = await api.get('orders/');
                setOrders(res.data.results || res.data);
            } catch {
                toast.error("Failed to load your orders");
            }
        };
        loadOrders();
    }, []);

    return (
        <div className="container mx-auto px-6 py-12 max-w-5xl">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">My Orders</h1>
            
            {orders.length === 0 ? (
                <div className="glass-card text-center py-20 text-gray-500">
                    You haven't placed any orders yet. Start exploring local deals!
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map(order => {
                        const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
                        const currentStatusIndex = statuses.indexOf(order.status);
                        
                        return (
                            <div key={order.id} className="glass-card p-6 md:p-8 flex flex-col gap-6 hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <h3 className="font-extrabold text-xl text-gray-800">Order #{order.id}</h3>
                                        <p className="text-gray-500 text-sm">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-gray-500 text-sm">Total Amount</p>
                                        <p className="font-extrabold text-primary text-xl truncate">₹{order.total_price}</p>
                                    </div>
                                </div>
                                
                                {/* Tracking Stepper */}
                                <div className="py-4">
                                    <p className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-secondary" /> Live Local Tracking
                                    </p>
                                    <div className="flex items-center justify-between relative">
                                        {/* Connecting Line */}
                                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
                                        <div 
                                            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-primary to-accent z-0 rounded-full transition-all duration-700 ease-in-out" 
                                            style={{ width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 100}%` }}
                                        ></div>

                                        {/* Steps */}
                                        {statuses.map((stepStatus, idx) => {
                                            const isCompleted = idx <= currentStatusIndex;
                                            const isCurrent = idx === currentStatusIndex;
                                            
                                            // Icons logic
                                            let StepIcon = Circle;
                                            if (isCompleted) StepIcon = CheckCircle2;
                                            if (stepStatus === 'PENDING' && isCurrent) StepIcon = Clock;
                                            if (stepStatus === 'DELIVERED') StepIcon = PackageCheck;

                                            return (
                                                <div key={stepStatus} className="flex flex-col items-center relative z-10 bg-transparent">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isCompleted ? 'bg-primary text-white scale-110' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                                                        <StepIcon className="w-5 h-5" />
                                                    </div>
                                                    <span className={`text-xs md:text-sm font-bold mt-3 absolute top-10 whitespace-nowrap ${isCurrent ? 'text-primary' : (isCompleted ? 'text-gray-800' : 'text-gray-400')}`}>
                                                        {stepStatus}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-12 text-center md:text-right">
                                        <button className="btn-secondary whitespace-nowrap text-sm border-gray-200 text-gray-600 hover:text-primary hover:border-primary">Contact Seller / Raise Issue</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BuyerDashboard;
