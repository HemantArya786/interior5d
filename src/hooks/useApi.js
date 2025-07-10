import { useCallback, useEffect, useState } from 'react';
import {
	adminAPI,
	apiUtils,
	authAPI,
	messageAPI,
	notificationAPI,
	orderAPI,
	productAPI,
	reviewAPI,
	searchAPI,
	uploadAPI,
	userAPI,
	vendorAPI,
} from '../services/api';

// Generic hook for API calls with enhanced error handling
export const useApi = (apiCall, dependencies = []) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const execute = useCallback(async (...args) => {
		try {
			setLoading(true);
			setError(null);
			const response = await apiCall(...args);
			setData(response.data);
			return response.data;
		} catch (err) {
			const errorMessage =
				err.response?.data?.message || err.message || 'An error occurred';
			setError(errorMessage);
			throw err;
		} finally {
			setLoading(false);
		}
	}, dependencies);

	const refetch = () => execute();
	const reset = () => {
		setData(null);
		setError(null);
		setLoading(false);
	};

	return { data, loading, error, execute, refetch, reset };
};

// Enhanced useAuth hook with automatic token refresh
export const useAuth = () => {
	const [user, setUser] = useState(apiUtils.getCurrentUser());
	const [loading, setLoading] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	// Initialize auth state on component mount
	useEffect(() => {
		const initializeAuth = async () => {
			const token = localStorage.getItem('auth_token');
			if (token && apiUtils.isTokenValid()) {
				try {
					const response = await authAPI.getProfile();
					if (response.data.user) {
						apiUtils.setCurrentUser(response.data.user);
						setUser(response.data.user);
					}
				} catch (error) {
					console.log('Token invalid, clearing auth:', error);
					apiUtils.removeAuthToken();
					setUser(null);
				}
			} else if (token) {
				// Token exists but is invalid
				apiUtils.removeAuthToken();
				setUser(null);
			}
			setIsInitialized(true);
		};

		initializeAuth();
	}, []);

	const login = async (credentials) => {
		setLoading(true);
		try {
			const response = await authAPI.login(credentials);
			const { token, user } = response.data;

			apiUtils.setAuthToken(token);
			apiUtils.setCurrentUser(user);
			setUser(user);

			return response.data;
		} finally {
			setLoading(false);
		}
	};

	const register = async (userData) => {
		setLoading(true);
		try {
			const response = await authAPI.register(userData);
			return response.data;
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		setLoading(true);
		try {
			await authAPI.logout();
		} catch (error) {
			console.log('Logout error:', error);
		} finally {
			apiUtils.removeAuthToken();
			setUser(null);
			setLoading(false);
		}
	};

	const updateProfile = async () => {
		try {
			const response = await authAPI.getProfile();
			const updatedUser = response.data.user;
			apiUtils.setCurrentUser(updatedUser);
			setUser(updatedUser);
			return updatedUser;
		} catch (error) {
			console.error('Profile update error:', error);
			throw error;
		}
	};

	const refreshToken = async () => {
		try {
			const response = await authAPI.refreshToken();
			const { token } = response.data;
			apiUtils.setAuthToken(token);
			return token;
		} catch (error) {
			logout();
			throw error;
		}
	};

	return {
		user,
		loading,
		isInitialized,
		login,
		register,
		logout,
		updateProfile,
		refreshToken,
		isAuthenticated: !!user && apiUtils.isAuthenticated(),
	};
};

// Product hooks
export const useProducts = (params = {}) => {
	return useApi(() => productAPI.getAll(params), [JSON.stringify(params)]);
};

export const useProduct = (id) => {
	return useApi(() => productAPI.getById(id), [id]);
};

export const useProductById = (id) => {
	return useApi(() => productAPI.getById(id), [id]);
};

export const useProductCategories = () => {
	return useApi(() => productAPI.getCategories(), []);
};

export const useVendorProducts = (params = {}) => {
	return useApi(
		() => productAPI.getVendorProducts(params),
		[JSON.stringify(params)]
	);
};

export const useFeaturedProducts = () => {
	return useApi(() => productAPI.getFeatured(), []);
};

export const useTrendingProducts = () => {
	return useApi(() => productAPI.getTrending(), []);
};

export const useSimilarProducts = (id) => {
	return useApi(() => productAPI.getSimilar(id), [id]);
};

// Vendor hooks
export const useVendors = (params = {}) => {
	return useApi(() => vendorAPI.getAll(params), [JSON.stringify(params)]);
};

export const useVendorById = (id) => {
	return useApi(() => vendorAPI.getById(id), [id]);
};

export const useVendorDashboard = () => {
	return useApi(() => vendorAPI.getDashboardStats(), []);
};

export const useVendorPortfolio = (id) => {
	return useApi(() => vendorAPI.getPortfolio(id), [id]);
};

// Review hooks
export const useVendorReviews = (vendorId, params = {}) => {
	return useApi(
		() => reviewAPI.getVendorReviews(vendorId, params),
		[vendorId, JSON.stringify(params)]
	);
};

export const useProductReviews = (productId, params = {}) => {
	return useApi(
		() => reviewAPI.getProductReviews(productId, params),
		[productId, JSON.stringify(params)]
	);
};

export const useUserReviews = () => {
	return useApi(() => reviewAPI.getUserReviews(), []);
};

// User hooks
export const useUserProfile = () => {
	return useApi(() => userAPI.getProfile(), []);
};

export const useUserDashboard = () => {
	return useApi(() => userAPI.getDashboard(), []);
};

export const useFavorites = () => {
	return useApi(() => userAPI.getFavorites(), []);
};

export const useNotifications = () => {
	return useApi(() => notificationAPI.getAll(), []);
};

// Message hooks
export const useUserMessages = () => {
	return useApi(() => messageAPI.getUserMessages(), []);
};

export const useVendorMessages = () => {
	return useApi(() => messageAPI.getVendorMessages(), []);
};

export const useConversation = (vendorId) => {
	return useApi(() => messageAPI.getConversation(vendorId), [vendorId]);
};

// Search hooks
export const useSearch = (params) => {
	return useApi(() => searchAPI.global(params), [JSON.stringify(params)]);
};

export const useSearchSuggestions = (query) => {
	return useApi(() => searchAPI.suggestions(query), [query]);
};

export const useSavedSearches = () => {
	return useApi(() => searchAPI.getSavedSearches(), []);
};

// Admin hooks
export const useAdminDashboard = () => {
	return useApi(() => adminAPI.getDashboardStats(), []);
};

export const usePendingVendors = () => {
	return useApi(() => adminAPI.getPendingVendors(), []);
};

export const useAdminUsers = (params = {}) => {
	return useApi(() => adminAPI.getUsers(params), [JSON.stringify(params)]);
};

export const useAdminAnalytics = (params = {}) => {
	return useApi(() => adminAPI.getAnalytics(params), [JSON.stringify(params)]);
};

// Order hooks
export const useOrders = (params = {}) => {
	return useApi(() => orderAPI.getAll(params), [JSON.stringify(params)]);
};

export const useOrder = (id) => {
	return useApi(() => orderAPI.getById(id), [id]);
};

export const useVendorOrders = (params = {}) => {
	return useApi(
		() => orderAPI.getVendorOrders(params),
		[JSON.stringify(params)]
	);
};

// Custom hooks for common operations
export const useToggleFavorite = () => {
	const [loading, setLoading] = useState(false);

	const toggleFavorite = async (productId, isFavorite) => {
		setLoading(true);
		try {
			let result;
			if (isFavorite) {
				await userAPI.removeFromFavorites(productId);
				result = false;
			} else {
				await userAPI.addToFavorites(productId);
				result = true;
			}

			// Update cache
			const favorites = apiUtils.getFavoritesCache();
			if (result) {
				apiUtils.setFavoritesCache([...favorites, productId]);
			} else {
				apiUtils.setFavoritesCache(favorites.filter((id) => id !== productId));
			}

			return result;
		} finally {
			setLoading(false);
		}
	};

	return { toggleFavorite, loading };
};

export const useSendMessage = () => {
	const [loading, setLoading] = useState(false);

	const sendMessage = async (messageData) => {
		setLoading(true);
		try {
			const response = await messageAPI.send(messageData);
			return response.data;
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading };
};

export const useCreateReview = () => {
	const [loading, setLoading] = useState(false);

	const createReview = async (reviewData) => {
		setLoading(true);
		try {
			const response = await reviewAPI.create(reviewData);
			return response.data;
		} finally {
			setLoading(false);
		}
	};

	return { createReview, loading };
};

export const useFileUpload = () => {
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);

	const uploadImage = async (file) => {
		setUploading(true);
		setProgress(0);
		try {
			const response = await uploadAPI.uploadImage(file);
			setProgress(100);
			return response.data;
		} finally {
			setUploading(false);
			setProgress(0);
		}
	};

	const uploadDocument = async (file) => {
		setUploading(true);
		setProgress(0);
		try {
			const response = await uploadAPI.uploadDocument(file);
			setProgress(100);
			return response.data;
		} finally {
			setUploading(false);
			setProgress(0);
		}
	};

	return { uploadImage, uploadDocument, uploading, progress };
};

// Utility hook for debounced API calls
export const useDebouncedApi = (apiCall, delay = 500, dependencies = []) => {
	const [debouncedData, setDebouncedData] = useState(null);
	const [debouncedLoading, setDebouncedLoading] = useState(false);
	const [debouncedError, setDebouncedError] = useState(null);

	useEffect(() => {
		const timeoutId = setTimeout(async () => {
			if (apiCall) {
				setDebouncedLoading(true);
				setDebouncedError(null);
				try {
					const response = await apiCall();
					setDebouncedData(response.data);
				} catch (error) {
					setDebouncedError(error.response?.data?.message || error.message);
				} finally {
					setDebouncedLoading(false);
				}
			}
		}, delay);

		return () => clearTimeout(timeoutId);
	}, [...dependencies, delay]);

	return {
		data: debouncedData,
		loading: debouncedLoading,
		error: debouncedError,
	};
};

// Hook for managing local storage state
export const useLocalStorage = (key, initialValue) => {
	const [storedValue, setStoredValue] = useState(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error);
			return initialValue;
		}
	});

	const setValue = (value) => {
		try {
			setStoredValue(value);
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error(`Error setting localStorage key "${key}":`, error);
		}
	};

	return [storedValue, setValue];
};
