import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-2">
                    <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4 block">Apn-E-Dukaan</Link>
                    <p className="text-gray-500 text-sm max-w-sm">The ultimate hyperlocal marketplace for your neighborhood. Buy, sell, negotiate, and track orders directly from locals around you.</p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li><Link to="/legal/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        <li><Link to="/legal/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        <li><Link to="/legal/refund" className="hover:text-primary transition-colors">Refund & Cancellation</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-4">Help</h4>
                    <ul className="space-y-2 text-sm text-gray-500">
                        <li><Link to="/login" className="hover:text-primary transition-colors">Seller Login</Link></li>
                        <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 border-t pt-8 text-center text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Apn-E-Dukaan Marketplace. All rights reserved. Built for hyperlocal communities.
            </div>
        </footer>
    );
};

export default Footer;
