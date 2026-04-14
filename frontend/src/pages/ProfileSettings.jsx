import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
    const [form, setForm] = useState({
        username: '',
        phone_number: '',
        location: ''
    });
    const [addresses, setAddresses] = useState([]);
    const [newAddress, setNewAddress] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await api.get('auth/profile/');
                setForm({
                    username: res.data.username || '',
                    phone_number: res.data.phone_number || '',
                    location: res.data.location || ''
                });
            } catch (error) {
                toast.error(error.userMessage || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        const localAddresses = JSON.parse(localStorage.getItem('addressBook') || '[]');
        setAddresses(localAddresses);
        loadProfile();
    }, []);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            await api.patch('auth/profile/', form);
            toast.success('Profile updated');
        } catch (error) {
            toast.error(error.userMessage || 'Failed to update profile');
        }
    };

    const handleAddAddress = () => {
        if (!newAddress.trim()) return;
        const next = [newAddress.trim(), ...addresses].slice(0, 5);
        setAddresses(next);
        localStorage.setItem('addressBook', JSON.stringify(next));
        setNewAddress('');
    };

    const handleRemoveAddress = (idx) => {
        const next = addresses.filter((_, i) => i !== idx);
        setAddresses(next);
        localStorage.setItem('addressBook', JSON.stringify(next));
    };

    if (loading) return <div className="min-h-screen pt-28 text-center">Loading profile...</div>;

    return (
        <div className="min-h-screen px-6 lg:px-20 pt-28 pb-20 bg-background">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleSaveProfile} className="glass-card p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                    <input className="input-field" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" />
                    <input className="input-field" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="Phone number" />
                    <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Default location" />
                    <button className="btn-primary w-full py-3">Save Profile</button>
                </form>

                <div className="glass-card p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
                    <div className="flex gap-2">
                        <input className="input-field flex-grow" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Add new address" />
                        <button type="button" onClick={handleAddAddress} className="px-4 rounded-xl bg-primary text-white">Add</button>
                    </div>
                    <div className="space-y-2">
                        {addresses.length === 0 ? (
                            <p className="text-sm text-gray-500">No saved addresses yet.</p>
                        ) : (
                            addresses.map((address, idx) => (
                                <div key={`${address}-${idx}`} className="p-3 rounded-lg border border-gray-200 bg-white flex justify-between items-center">
                                    <span className="text-sm text-gray-700">{address}</span>
                                    <button type="button" onClick={() => handleRemoveAddress(idx)} className="text-xs text-red-500">Remove</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
