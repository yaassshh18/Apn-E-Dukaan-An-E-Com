import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [nearMe, setNearMe] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [search, nearMe]);

    const fetchProducts = async () => {
        try {
            let url = `products/?search=${search}`;
            if (nearMe && user && user.location) {
                url += `&location=${user.location}`;
            }
            const res = await api.get(url);
            // DRF Pagination returns the array inside "results"
            if (res.data && res.data.results) {
                setProducts(res.data.results);
            } else {
                setProducts(res.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 lg:px-20 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full mix-blend-multiply"></div>
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                        Hyperlocal Commerce, <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Reimagined.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 mb-10">Buy directly from locals, negotiate seamlessly via chat, and experience the future of neighborhood trading.</p>
                    
                    <div className="flex max-w-lg mx-auto relative glass-card p-2 rounded-2xl">
                        <input 
                            type="text" 
                            placeholder="Search for amazing local products..." 
                            className="flex-grow bg-transparent border-none outline-none px-4 text-gray-800 placeholder-gray-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-colors">
                            <Search className="w-5 h-5"/>
                        </button>
                    </div>
                    {user && user.location && (
                        <div className="mt-4 flex justify-center">
                            <button 
                                onClick={() => setNearMe(!nearMe)} 
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${nearMe ? 'bg-accent text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                            >
                                <MapPin className="w-4 h-4"/> 
                                {nearMe ? `Filtering items near: ${user.location}` : 'Show Items Near Me'}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Products Grid */}
            <section className="px-6 lg:px-20 py-16 bg-gray-50/50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-10 text-gray-800 text-center">Trending Near You</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map(product => (
                            <div key={product.id} className="group glass-card overflow-hidden hover:-translate-y-2 transition-all duration-300">
                                <div className="h-48 bg-gray-200 overflow-hidden">
                                    {product.image ? (
                                        <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{product.title}</h3>
                                    <p className="text-xl font-extrabold text-primary mb-4">₹{product.price}</p>
                                    <Link to={`/product/${product.id}`} className="btn-secondary w-full block text-center">View Details</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    {products.length === 0 && (
                        <div className="text-center text-gray-500 py-20">
                            No products found. Be the first to list!
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
