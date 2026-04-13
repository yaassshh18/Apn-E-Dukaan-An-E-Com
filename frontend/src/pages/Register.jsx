import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
    const { register } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        location: '',
        role: 'BUYER'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            toast.success('Registration successful!');
        } catch (error) {
            toast.error('Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center py-20 px-6 relative overflow-hidden bg-gray-50">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[120px] rounded-full mix-blend-multiply"></div>
            
            <div className="glass-card max-w-md w-full p-8 z-10 shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h2>
                    <p className="text-gray-500">Join the hyperlocal revolution</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <input 
                            type="email" 
                            className="input-field" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            className="input-field" 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your City/Area</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="e.g. Mumbai, Bandra"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">I want to:</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="BUYER" 
                                    checked={formData.role === 'BUYER'}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="text-primary focus:ring-primary"
                                />
                                Buy Products
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="SELLER" 
                                    checked={formData.role === 'SELLER'}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="text-primary focus:ring-primary"
                                />
                                Sell Products
                            </label>
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full text-lg mt-4">Sign Up</button>
                </form>
                
                <p className="mt-6 text-center text-gray-600">
                    Already have an account? <Link to="/login" className="text-secondary font-bold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
