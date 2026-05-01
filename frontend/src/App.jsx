import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, Suspense, lazy, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import toast from 'react-hot-toast';

// Layouts
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

// Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Register = lazy(() => import('./pages/Register'));
const ForgetPass = lazy(() => import('./pages/ForgetPass'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Chat = lazy(() => import('./pages/Chat'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const SellerProfile = lazy(() => import('./pages/SellerProfile'));
const Legal = lazy(() => import('./pages/Legal'));
const Contact = lazy(() => import('./pages/Contact'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
import Footer from './components/Footer';

const RoleProtectedRoute = ({ user, allowedRole, redirectTo = '/' , loginUrl = '/login', children }) => {
  useEffect(() => {
    if (!user) return;
    if (user.role !== allowedRole) {
      toast.error(`Login as ${allowedRole.toLowerCase()} to access this page.`);
    }
  }, [user, allowedRole]);

  if (!user) return <Navigate to={loginUrl} />;
  if (user.role !== allowedRole) return <Navigate to={redirectTo} />;
  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16">
          <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading page...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={!user ? <ForgetPass /> : <Navigate to="/" />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" />} />
              <Route path="/wishlist" element={user ? <Wishlist /> : <Navigate to="/login" />} />
              <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" />} />
              <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? <ProfileSettings /> : <Navigate to="/login" />} />
              <Route path="/buyer-dashboard" element={<RoleProtectedRoute user={user} allowedRole="BUYER"><BuyerDashboard /></RoleProtectedRoute>} />
              <Route path="/seller-dashboard" element={<RoleProtectedRoute user={user} allowedRole="SELLER"><SellerDashboard /></RoleProtectedRoute>} />
              <Route path="/admin-dashboard" element={<RoleProtectedRoute user={user} allowedRole="ADMIN" loginUrl="/admin-login"><AdminDashboard /></RoleProtectedRoute>} />
              <Route path="/seller/:id" element={<SellerProfile />} />
              <Route path="/legal/:section" element={<Legal />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </main>
        {user && <BottomNav />}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
