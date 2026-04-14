import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { ShieldCheck, MapPin, Star, Box } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import MapComponent from '../components/MapComponent';

const SellerProfile = () => {
    const { id } = useParams();
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                const sellerRes = await api.get(`seller/${id}/`);
                setSeller(sellerRes.data);
                
                const productsRes = await api.get(`products/?seller=${id}`);
                setProducts(productsRes.data.results || productsRes.data);
            } catch {
                console.error("Failed to fetch seller data");
            } finally {
                setLoading(false);
            }
        };
        fetchSellerData();
    }, [id]);

    if (loading) return <div className="min-h-screen pt-32 text-center text-xl">Loading Trust Profile...</div>;
    if (!seller) return <div className="min-h-screen pt-32 text-center text-xl text-red-500">Seller not found</div>;

    const ratingAvg = "4.9"; // This would ideally be calculated from all product reviews
    const lat = seller.latitude ? parseFloat(seller.latitude) : 28.6139;
    const lng = seller.longitude ? parseFloat(seller.longitude) : 77.2090;

    return (
        <div className="min-h-screen px-6 lg:px-20 py-16 bg-gray-50/50">
            <div className="max-w-6xl mx-auto">
                <div className="glass-card mb-12 overflow-hidden flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 p-8 border-r bg-white flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-4xl mb-4 shadow-inner">
                            {seller.username[0].toUpperCase()}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            {seller.username}
                            {seller.is_verified && <ShieldCheck className="text-blue-500 w-6 h-6" title="Verified Local Seller" />}
                        </h1>
                        <p className="text-gray-500 mb-6 capitalize">{seller.role.toLowerCase()}</p>
                        
                        <div className="w-full flex justify-around text-center border-t pt-6 mt-2">
                            <div>
                                <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-1"><Star className="w-5 h-5 fill-warning text-warning"/> {ratingAvg}</p>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Rating</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-1"><Box className="w-5 h-5 text-secondary"/> {products.length}</p>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Listings</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-2/3 p-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                            <MapPin className="text-accent" /> Location & Operations
                        </h2>
                        <div className="h-64 w-full bg-gray-100 rounded-2xl mb-4 overflow-hidden relative shadow-inner">
                            <MapComponent latitude={lat} longitude={lng} popupText={`${seller.username}'s Store Location`} />
                        </div>
                        {seller.location && <p className="text-sm font-semibold text-gray-600 bg-gray-100 p-3 rounded-lg inline-block">Registered Address: {seller.location}</p>}
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-8 text-gray-800">Products by {seller.username}</h2>
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-white glass-card rounded-2xl text-gray-500">
                        This seller has no active products.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerProfile;
