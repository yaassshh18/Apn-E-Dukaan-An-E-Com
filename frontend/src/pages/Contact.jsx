import { useState } from 'react';
import { Mail, MapPin, Phone, Send, Headset, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        category: 'Buyer Support',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('auth/contact/', formData);
            toast.success('Message sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', category: 'Buyer Support', message: '' });
        } catch (error) {
            toast.error('Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Contact Us</h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Have a question about Apn-E-Dukaan? Whether you're a buyer, seller, or partner, our support team is here to help you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Business Information Section */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="glass-card p-8 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                Business Details
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Official Email</h4>
                                        <a href="mailto:apn.e.dukaan.main@gmail.com" className="text-gray-600 hover:text-primary transition-colors text-sm break-all">
                                            apn.e.dukaan.main@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Headquarters</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            Building No. 13, Apn-E-Dukaan,<br />
                                            Sion, Mumbai, India
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-2xl">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Headset className="w-5 h-5 text-primary" />
                                Support Hours
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Our support team is available Monday through Saturday from 9:00 AM to 6:00 PM IST. We aim to respond to all inquiries within 24 hours.
                            </p>
                        </div>
                    </div>

                    {/* Contact Form Section */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-8 bg-white border border-gray-100 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input 
                                                type="text" 
                                                required 
                                                className="input-field pl-10 w-full" 
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input 
                                                type="email" 
                                                required 
                                                className="input-field pl-10 w-full" 
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Support Category</label>
                                        <select 
                                            className="input-field w-full cursor-pointer bg-white"
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        >
                                            <option value="Buyer Support">Buyer Support</option>
                                            <option value="Seller Support">Seller Support</option>
                                            <option value="Refund Help">Refund Help</option>
                                            <option value="Technical Support">Technical Support</option>
                                            <option value="Legal Queries">Legal Queries</option>
                                            <option value="Partnership/Business">Partnership/Business</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                        <input 
                                            type="text" 
                                            required 
                                            className="input-field w-full" 
                                            placeholder="How can we help?"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                    <textarea 
                                        required 
                                        rows="5" 
                                        className="input-field w-full resize-none" 
                                        placeholder="Write your message here..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="btn-primary w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 group ml-auto disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Send Message
                                            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
