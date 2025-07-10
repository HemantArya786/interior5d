import React from 'react';
import { Toaster } from 'react-hot-toast';
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
	useLocation,
} from 'react-router-dom';

// Components
import DesignDetailPage from './DesignDetailPage';
import DesignIdeasPage from './DesignIdeasPage';
import DesignPage from './DesignPage';
import Feature from './Feature';
import Footer from './Footer';
import Ideas from './Ideas';
import Login from './Login';
import Navbar from './Navbar';
import Home from './pages/Home';
import ResetPassword from './ResetPassword';
import Resources from './Resources';
import SearchAi from './SearchAi';
import SignUp from './SignUp';
import VenderDetail from './VenderDetail';

// Vendor Dashboard Components
import VendorAddService from './components/VendorAddService';
import VendorDashboard from './components/VendorDashboard';
import VendorLayout from './components/VendorLayout';
import VendorMessages from './components/VendorMessages';
import VendorOrders from './components/VendorOrders';
import VendorProfile from './components/VendorProfile';
import VendorReviews from './components/VendorReviews';
import VendorServices from './components/VendorServices';

// Auth Context
import { useAuth } from './hooks/useApi';

// Protected Route Component
const ProtectedRoute = ({
	children,
	allowedRoles = [],
	requireAuth = true,
}) => {
	const { user, isAuthenticated } = useAuth();

	if (requireAuth && !isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
		return <Navigate to="/" replace />;
	}

	return children;
};

// Layout wrapper component
const AppLayout = ({ children }) => {
	const location = useLocation();

	// Check if current route is vendor dashboard
	const isVendorDashboard = location.pathname.startsWith('/vendor-dashboard');

	return (
		<div className="App min-h-screen flex flex-col">
			{/* Conditionally render navbar - hide on vendor dashboard */}
			{!isVendorDashboard && <Navbar />}

			<main className="flex-1">{children}</main>

			{/* Conditionally render footer - hide on vendor dashboard */}
			{!isVendorDashboard && <Footer />}

			<Toaster position="top-right" />
		</div>
	);
};

function App() {
	return (
		<Router>
			<AppLayout>
				<Routes>
					{/* Public Routes */}
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<SignUp />} />
					<Route path="/reset-password" element={<ResetPassword />} />
					<Route path="/features" element={<Feature />} />

					{/* Design Routes */}
					<Route path="/design-page" element={<DesignPage />} />
					<Route path="/design-detail-page" element={<DesignDetailPage />} />
					<Route path="/design-ideas" element={<DesignIdeasPage />} />
					<Route path="/ideas" element={<Ideas />} />
					<Route path="/search" element={<SearchAi />} />
					<Route path="/resources" element={<Resources />} />

					{/* Vendor Routes */}
					<Route path="/vendor/:id" element={<VenderDetail />} />

					{/* Protected Vendor Dashboard Routes */}
					<Route
						path="/vendor-dashboard"
						element={
							<ProtectedRoute allowedRoles={['vendor']}>
								<VendorLayout />
							</ProtectedRoute>
						}>
						<Route index element={<VendorDashboard />} />
						<Route path="profile" element={<VendorProfile />} />
						<Route path="services" element={<VendorServices />} />
						<Route path="add-service" element={<VendorAddService />} />
						<Route path="messages" element={<VendorMessages />} />
						<Route path="orders" element={<VendorOrders />} />
						<Route path="reviews" element={<VendorReviews />} />
					</Route>

					{/* Fallback Route */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</AppLayout>
		</Router>
	);
}

export default App;
