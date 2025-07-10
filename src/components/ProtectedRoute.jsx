import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useApi';

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

export default ProtectedRoute;
