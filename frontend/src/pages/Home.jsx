import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Search, MapPin, Sparkles, Clock, Flame } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';

const BLOCKED_RECENT_TITLES = ['caprese', 'nike run defy'];

const Home = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [nearMe, setNearMe] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [savedSearches, setSavedSearches] = useState(() => JSON.parse(localStorage.getItem('savedSearches') || '[]'));
    useEffect(() => {
        const loadHomeData = async () => {
            try {
                const categoryRes = await api.get('categories/');
                setCategories(categoryRes.data.results || categoryRes.data);
            } catch {
                console.error("Failed to load categories");
            }

            try {
                const trendingRes = await api.get('products/?sort=trending');
                const trendingData = trendingRes.data.results || trendingRes.data;
                setTrendingProducts(trendingData.slice(0, 4));
            } catch {
                console.error("Failed to load trending");
            }

            try {
                let url = `products/?search=${debouncedSearch}`;
                if (nearMe && user && user.location) {
                    url += `&location=${user.location}`;
                }
                if (selectedCategory) {
                    url += `&category=${selectedCategory}`;
                }
                if (sortBy && sortBy !== 'newest') {
                    url += `&sort=${sortBy}`;
                }
                if (minPrice) {
                    url += `&min_price=${minPrice}`;
                }
                if (maxPrice) {
                    url += `&max_price=${maxPrice}`;
                }
                if (minRating) {
                    url += `&min_rating=${minRating}`;
                }
                if (inStockOnly) {
                    url += '&in_stock=true';
                }

                const res = await api.get(url);
                const currentProducts = res.data?.results || res.data || [];
                setProducts(currentProducts);

                const productsById = new Map(currentProducts.map((p) => [p.id, p]));
                const allowedIds = new Set(productsById.keys());
                const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                const cleanedRecent = recent.filter(
                    (item) =>
                        allowedIds.has(item.id) &&
                        item?.title &&
                        !BLOCKED_RECENT_TITLES.some((blocked) => item.title.toLowerCase().includes(blocked))
                );
                const refreshedRecent = cleanedRecent
                    .map((item) => productsById.get(item.id) || item)
                    .filter(Boolean);
                localStorage.setItem('recentlyViewed', JSON.stringify(refreshedRecent));
                setRecentProducts(refreshedRecent);
            } catch (error) {
                console.error(error);
            }
        };

        loadHomeData();
    }, [debouncedSearch, nearMe, selectedCategory, user, sortBy, minPrice, maxPrice, minRating, inStockOnly]);

    const handleSaveSearch = () => {
        const entry = {
            term: search,
            category: selectedCategory,
            sortBy,
            minPrice,
            maxPrice,
            minRating,
            inStockOnly
        };
        const next = [entry, ...savedSearches].slice(0, 5);
        localStorage.setItem('savedSearches', JSON.stringify(next));
        setSavedSearches(next);
    };

    const applySavedSearch = (entry) => {
        setSearch(entry.term || '');
        setSelectedCategory(entry.category || null);
        setSortBy(entry.sortBy || 'newest');
        setMinPrice(entry.minPrice || '');
        setMaxPrice(entry.maxPrice || '');
        setMinRating(entry.minRating || '');
        setInStockOnly(Boolean(entry.inStockOnly));
    };

    return (
        <div className="min-h-screen">
            {/* Premium Hero Section */}
            <section className="relative pt-40 pb-28 px-6 lg:px-20 overflow-hidden bg-background">
                {/* Advanced Animated Globs */}
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply animate-blob pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full mix-blend-multiply animate-blob animation-delay-2000 pointer-events-none"></div>
                <div className="absolute top-[20%] right-[30%] w-[400px] h-[400px] bg-secondary/20 blur-[100px] rounded-full mix-blend-screen animate-blob animation-delay-4000 pointer-events-none"></div>
                
                <div className="max-w-4xl mx-auto text-center relative z-10 animate-slide-up">
                    <span className="inline-block py-1 px-3 rounded-full bg-white border border-gray-200 text-xs font-bold text-secondary mb-6 shadow-sm">🚀 The #1 Neighborhood App</span>
                    <h1 className="text-6xl md:text-8xl font-display font-black text-gray-900 mb-6 leading-[1.1] tracking-tight">
                        Hyperlocal <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">Reimagined.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-12 font-light max-w-2xl mx-auto">Discover hidden gems, negotiate directly with trusted sellers, and support your local community.</p>
                    
                    <div className="flex max-w-2xl mx-auto relative glass-card p-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-shadow">
                        <div className="pl-4 pr-2 flex items-center justify-center">
                            <Search className="w-6 h-6 text-gray-400"/>
                        </div>
                        <input 
                            type="text" 
                            placeholder="What are you looking for locally?" 
                            className="flex-grow bg-transparent border-none outline-none px-2 text-lg text-gray-800 placeholder-gray-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-bold shadow-glow hover:scale-105 active:scale-95 transition-all">
                            Search
                        </button>
                    </div>
                    <div className="mt-4 flex justify-center gap-2">
                        <button onClick={handleSaveSearch} className="px-4 py-2 text-sm rounded-full bg-white border border-gray-200 hover:bg-gray-50">
                            Save this search
                        </button>
                    </div>
                    {savedSearches.length > 0 && (
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {savedSearches.map((entry, idx) => (
                                <button key={`saved-${idx}`} onClick={() => applySavedSearch(entry)} className="px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200">
                                    {entry.term || 'Saved filter'}
                                </button>
                            ))}
                        </div>
                    )}
                    {user && user.location && (
                        <div className="mt-8 flex justify-center animate-fade-in">
                            <button 
                                onClick={() => setNearMe(!nearMe)} 
                                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${nearMe ? 'bg-accent text-white shadow-glow' : 'bg-white text-gray-600 border border-gray-200 shadow-sm hover:shadow-md'}`}
                            >
                                <MapPin className="w-4 h-4"/> 
                                {nearMe ? `📍 Showing items near ${user.location}` : 'Show Items Near Me'}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Categories Swiper */}
            <div className="px-6 lg:px-20 py-6 border-b border-gray-100 bg-white sticky top-20 z-40 shadow-sm overflow-x-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto flex gap-4 min-w-max">
                    <button 
                        onClick={() => setSelectedCategory(null)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${!selectedCategory ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-900 hover:text-gray-900'}`}
                    >
                        Browse All
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat.id} 
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${selectedCategory === cat.slug ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-900 hover:text-gray-900'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Standard List Grid */}
            <section className="px-6 lg:px-20 py-20 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-display font-extrabold text-gray-900 flex items-center gap-3">
                                <Sparkles className="text-secondary w-8 h-8 drop-shadow-md" /> Explore Products
                            </h2>
                            <p className="text-gray-500 mt-2">Discover the best things around you.</p>
                        </div>
                    </div>
                    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field">
                            <option value="newest">Newest</option>
                            <option value="trending">Trending</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                        <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" placeholder="Min price" className="input-field" />
                        <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" placeholder="Max price" className="input-field" />
                        <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="input-field">
                            <option value="">Any rating</option>
                            <option value="4">4+ stars</option>
                            <option value="4.5">4.5+ stars</option>
                        </select>
                        <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200">
                            <input checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} type="checkbox" />
                            <span className="text-sm">In stock only</span>
                        </label>
                    </div>
                    {products.length === 0 ? (
                        <div className="glass-card p-20 flex flex-col items-center justify-center text-center animate-fade-in">
                            <img src="https://ui-avatars.com/api/?name=Empty&background=F3F4F6&color=9CA3AF&size=100&rounded=true" alt="Empty" className="mb-6 opacity-50 grayscale"/>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 max-w-sm">We couldn't find any products matching your current filters. Try expanding your search area.</p>
                            <button onClick={() => {setSearch(''); setNearMe(false); setSelectedCategory(null);}} className="btn-secondary mt-6">Clear Filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                    )}
                </div>
            </section>

            {/* Trending Block */}
            {trendingProducts.length > 0 && !search && !selectedCategory && (
                <section className="px-6 lg:px-20 pb-20 bg-background border-t border-gray-100 pt-20">
                    <div className="max-w-7xl mx-auto animate-slide-up">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-display font-extrabold text-gray-900 flex items-center gap-3">
                                    <Flame className="text-orange-500 w-8 h-8 drop-shadow-md" /> Trending Near You 🔥
                                </h2>
                                <p className="text-gray-500 mt-2">The most viewed and desired products in your community.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {trendingProducts.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* Recently Viewed Block */}
            {recentProducts.length > 0 && !search && !selectedCategory && (
                <section className="px-6 lg:px-20 pb-20 bg-background">
                    <div className="max-w-7xl mx-auto p-10 bg-white/40 glass-card rounded-3xl shadow-soft border border-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                        <h2 className="text-2xl font-display font-bold mb-8 text-gray-900 flex items-center gap-3 relative z-10">
                            <Clock className="text-secondary w-6 h-6" /> Jump back in
                        </h2>
                        <div className="flex gap-6 overflow-x-auto pb-6 snap-x custom-scrollbar relative z-10">
                            {recentProducts.map(product => (
                                <div key={`recent-${product.id}`} className="min-w-[280px] snap-start">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
