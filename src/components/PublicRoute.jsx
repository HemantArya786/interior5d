// components/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useApi';

const PublicRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuth();

	if (isAuthenticated && user) {
		// Redirect based on user role
		if (user.role === 'vendor') {
			return <Navigate to="/vendor-dashboard" replace />;
		} else if (user.role === 'admin') {
			return <Navigate to="/admin-dashboard" replace />;
		} else {
			return <Navigate to="/" replace />;
		}
	}

	return children;
};

export default PublicRoute;
