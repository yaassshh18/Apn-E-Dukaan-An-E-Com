import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CreditCard, Banknote } from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [address, setAddress] = useState('');

    // Load Razorpay Script dynamically
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const generateInvoice = (orderId) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("Apn-E-Dukaan Invoice", 20, 20);
        doc.setFontSize(12);
        doc.text(`Order ID: #${orderId}`, 20, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
        doc.text(`Payment Method: ${paymentMethod}`, 20, 50);
        doc.text(`Delivery Address: ${address}`, 20, 60);
        
        doc.save(`Invoice_Order_${orderId}.pdf`);
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();

        if (paymentMethod === 'ONLINE') {
            // Mock Razorpay Flow
            const options = {
                key: 'rzp_test_mock_key', 
                amount: 1000 * 100, // Dummy
                currency: "INR",
                name: "Apn-E-Dukaan",
                description: "Test Transaction",
                handler: async function (response) {
                    try {
                        const res = await api.post('orders/', { payment_method: 'ONLINE', payment_id: response.razorpay_payment_id });
                        toast.success("Online Payment Successful!");
                        generateInvoice(res.data.id || 'XX');
                        navigate('/buyer-dashboard');
                    } catch {
                        toast.error("Failed to confirm online order.");
                    }
                },
                prefill: {
                    name: "Test Buyer",
                    email: "buyer@example.com",
                },
                theme: { color: "#3B82F6" }
            };
            if(window.Razorpay) {
                 const rzp = new window.Razorpay(options);
                 rzp.open();
            } else {
                 toast.error("Razorpay SDK failed to load");
            }
        } else {
            // COD Flow
            try {
                const res = await api.post('orders/', { payment_method: 'COD' });
                toast.success("Order Placed Successfully via COD!");
                generateInvoice(res.data.id || 'XX');
                navigate('/buyer-dashboard');
            } catch {
                toast.error("Failed to place order.");
            }
        }
    };

    return (
        <div className="container mx-auto px-6 py-20 max-w-2xl text-center">
             <div className="glass-card p-10">
                 <h1 className="text-3xl font-extrabold mb-4 border-b pb-4">Checkout Process</h1>
                 <p className="text-gray-600 mb-8">Confirm your delivery details to place the order.</p>
                 <form onSubmit={handleCheckoutSubmit} className="space-y-6 text-left">
                     <label className="block">
                         <span className="text-gray-700 font-bold mb-2 block">Delivery Address</span>
                         <textarea className="input-field w-full" rows="3" required placeholder="Enter your full street address" value={address} onChange={(e) => setAddress(e.target.value)}></textarea>
                     </label>
                     
                     <div className="block">
                         <span className="text-gray-700 font-bold mb-2 block">Payment Method</span>
                         <div className="grid grid-cols-2 gap-4">
                             <div 
                                onClick={() => setPaymentMethod('COD')}
                                className={`border-2 p-4 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                             >
                                 <Banknote className="w-8 h-8" />
                                 <span className="font-bold text-sm">Cash on Delivery</span>
                             </div>
                             <div 
                                onClick={() => setPaymentMethod('ONLINE')}
                                className={`border-2 p-4 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'ONLINE' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                             >
                                 <CreditCard className="w-8 h-8" />
                                 <span className="font-bold text-sm">Pay Online (Razorpay)</span>
                             </div>
                         </div>
                     </div>
                     
                     <p className="text-sm text-gray-500 italic text-center mt-2">A PDF invoice will be generated and downloaded automatically upon successful order placement.</p>
                     <button type="submit" className={`w-full py-4 mt-6 text-lg font-bold rounded-xl text-white shadow-md transition-transform active:scale-[0.98] ${paymentMethod === 'ONLINE' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-primary hover:bg-primary/90 shadow-primary/30'}`}>
                         {paymentMethod === 'ONLINE' ? 'Pay Securely Online' : 'Confirm & Place Order'}
                     </button>
                 </form>
             </div>
        </div>
    );
};

export default Checkout;
