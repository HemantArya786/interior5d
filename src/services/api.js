import axios from 'axios';
import { apiCache } from '../utils/apiCache';
// Base API configuration
const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('auth_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem('auth_token');
			localStorage.removeItem('user_data');
			// Only redirect if not already on login page
			if (window.location.pathname !== '/login') {
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	}
);

// Enhanced API Utility functions
export const apiUtils = {
	setAuthToken: (token) => {
		localStorage.setItem('auth_token', token);
	},

	removeAuthToken: () => {
		localStorage.removeItem('auth_token');
		localStorage.removeItem('user_data');
	},

	isAuthenticated: () => {
		return !!localStorage.getItem('auth_token');
	},

	getCurrentUser: () => {
		const userData = localStorage.getItem('user_data');
		return userData ? JSON.parse(userData) : null;
	},

	setCurrentUser: (user) => {
		localStorage.setItem('user_data', JSON.stringify(user));
	},

	getCachedProfile: () => {
		const userData = localStorage.getItem('user_data');
		return userData ? JSON.parse(userData) : null;
	},

	updateCachedProfile: (updates) => {
		const currentUser = apiUtils.getCurrentUser();
		if (currentUser) {
			const updatedUser = { ...currentUser, ...updates };
			apiUtils.setCurrentUser(updatedUser);
			return updatedUser;
		}
		return null;
	},

	clearCache: () => {
		localStorage.removeItem('auth_token');
		localStorage.removeItem('user_data');
		localStorage.removeItem('favorites_cache');
		localStorage.removeItem('search_history');
	},

	// Cache management for favorites
	getFavoritesCache: () => {
		const cache = localStorage.getItem('favorites_cache');
		return cache ? JSON.parse(cache) : [];
	},

	setFavoritesCache: (favorites) => {
		localStorage.setItem('favorites_cache', JSON.stringify(favorites));
	},

	// Search history management
	getSearchHistory: () => {
		const history = localStorage.getItem('search_history');
		return history ? JSON.parse(history) : [];
	},

	addToSearchHistory: (query) => {
		const history = apiUtils.getSearchHistory();
		const updatedHistory = [
			query,
			...history.filter((item) => item !== query),
		].slice(0, 10);
		localStorage.setItem('search_history', JSON.stringify(updatedHistory));
	},

	// Token validation
	isTokenValid: () => {
		const token = localStorage.getItem('auth_token');
		if (!token) return false;

		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			return payload.exp * 1000 > Date.now();
		} catch {
			return false;
		}
	},
};

// Auth API
export const authAPI = {
	register: (data) => api.post('/auth/register', data),
	login: (data) => api.post('/auth/login', data),
	getProfile: () => api.get('/auth/profile'),
	logout: () => api.post('/auth/logout'),
	refreshToken: () => api.post('/auth/refresh'),
	forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
	resetPassword: (data) => api.post('/auth/reset-password', data),
	verifyEmail: (token) => api.post('/auth/verify-email', { token }),
};

// User API
export const userAPI = {
	getProfile: () => api.get('/users/profile'),
	updateProfile: (data) => {
		const formData = new FormData();
		Object.keys(data).forEach((key) => {
			if (data[key] instanceof File) {
				formData.append(key, data[key]);
			} else {
				formData.append(key, JSON.stringify(data[key]));
			}
		});
		return api.put('/users/profile', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
	},
	deleteAccount: () => api.delete('/users/profile'),
	getDashboard: () => api.get('/users/dashboard'),
	getFavorites: () => api.get('/users/favorites'),
	addToFavorites: (productId) => api.post('/users/favorites', { productId }),
	removeFromFavorites: (productId) =>
		api.delete(`/users/favorites/${productId}`),
	getNotifications: () => api.get('/users/notifications'),
	markNotificationRead: (id) => api.patch(`/users/notifications/${id}/read`),
	updatePreferences: (preferences) =>
		api.put('/users/preferences', preferences),
};

// Vendor API
export const vendorAPI = {
	getAll: (params = {}) => api.get('/vendors', { params }),
	getById: (id) => api.get(`/vendors/${id}`),
	updateProfile: (data) => {
		// ✅ Send as JSON for profile updates (not FormData)
		console.log('🔍 API sending data:', data);

		return api.put('/vendors/profile', data, {
			headers: { 'Content-Type': 'application/json' },
		});
	},

	// ✅ Separate method for image uploads if needed
	updateProfileImages: (data) => {
		const formData = new FormData();
		Object.keys(data).forEach((key) => {
			if (data[key] instanceof File) {
				formData.append(key, data[key]);
			} else if (typeof data[key] === 'object') {
				formData.append(key, JSON.stringify(data[key]));
			} else {
				formData.append(key, data[key]);
			}
		});

		return api.put('/vendors/profile/images', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
	},

	getDashboardStats: () => api.get('/vendors/dashboard/stats'),
	getPortfolio: (id) => api.get(`/vendors/${id}/portfolio`),
	updatePortfolio: (data) => api.put('/vendors/portfolio', data),

	// Admin functions
	getPending: () => api.get('/vendors/admin/pending'),
	approve: (id) => api.patch(`/vendors/admin/${id}/approve`),
	reject: (id) => api.patch(`/vendors/admin/${id}/reject`),
	suspend: (id) => api.patch(`/vendors/admin/${id}/suspend`),
	activate: (id) => api.patch(`/vendors/admin/${id}/activate`),
};

export const productAPI = {
	getAll: (params = {}) => {
		console.log('🔍 API: Getting all products with params:', params);
		return apiCache.deduplicate('/products', params, () =>
			api
				.get('/products', { params })
				.then((response) => {
					console.log(
						'✅ API: Products retrieved successfully:',
						response.data
					);
					return response;
				})
				.catch((error) => {
					console.error('❌ API: Error getting products:', error);
					throw error;
				})
		);
	},

	// ✅ Get single product by ID (with caching)
	getById: (id) => {
		console.log('🔍 API: Getting product by ID:', id);
		if (!id) {
			console.error('❌ API: Product ID is required');
			throw new Error('Product ID is required');
		}

		return apiCache.deduplicate(`/products/${id}`, {}, () =>
			api
				.get(`/products/${id}`)
				.then((response) => {
					console.log('✅ API: Product retrieved successfully:', response.data);
					return response;
				})
				.catch((error) => {
					console.error('❌ API: Error getting product:', error);
					throw error;
				})
		);
	},

	// ✅ Get product categories (with longer cache - they don't change often)
	getCategories: () => {
		console.log('🔍 API: Getting product categories');
		return apiCache.deduplicate('/products/categories', {}, () =>
			api
				.get('/products/categories')
				.then((response) => {
					console.log(
						'✅ API: Categories retrieved successfully:',
						response.data
					);
					return response;
				})
				.catch((error) => {
					console.error('❌ API: Error getting categories:', error);
					throw error;
				})
		);
	},

	// ✅ Create service with JSON data (clears cache after creation)
	create: (data) => {
		console.log('🔍 API: Creating service with JSON data');
		console.log('🔍 API: Data being sent:', JSON.stringify(data, null, 2));

		// Validate required fields on frontend
		const requiredFields = [
			'name',
			'category',
			'shortDescription',
			'vendorId',
			'vendorName',
		];
		const missingFields = requiredFields.filter((field) => !data[field]);

		if (missingFields.length > 0) {
			console.error('❌ API: Missing required fields:', missingFields);
			return Promise.reject(
				new Error(`Missing required fields: ${missingFields.join(', ')}`)
			);
		}

		console.log('✅ API: All required fields present');
		console.log('🔍 API: Making POST request to /products');

		return api
			.post('/products', data, {
				headers: { 'Content-Type': 'application/json' },
			})
			.then((response) => {
				console.log('✅ API: Service created successfully:', response.data);
				// Clear relevant cache after creation
				apiCache.clearByPattern('/products');
				apiCache.clearByPattern('/products/vendor');
				return response;
			})
			.catch((error) => {
				console.error('❌ API: Error creating service:', error);
				throw error;
			});
	},

	// ✅ Create service with files (clears cache after creation)
	createWithFiles: (data) => {
		console.log('🔍 API: Creating service with file uploads');

		const formData = new FormData();
		Object.keys(data).forEach((key) => {
			if (data[key] instanceof FileList) {
				Array.from(data[key]).forEach((file) => {
					formData.append(key, file);
				});
			} else if (data[key] instanceof File) {
				formData.append(key, data[key]);
			} else if (typeof data[key] === 'object' && data[key] !== null) {
				formData.append(key, JSON.stringify(data[key]));
			} else {
				formData.append(key, data[key]);
			}
		});

		return api
			.post('/products', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			.then((response) => {
				console.log(
					'✅ API: Service with files created successfully:',
					response.data
				);
				// Clear relevant cache after creation
				apiCache.clearByPattern('/products');
				return response;
			})
			.catch((error) => {
				console.error('❌ API: Error creating service with files:', error);
				throw error;
			});
	},

	// ✅ Update product (clears cache after update)
	update: (id, data) => {
		console.log('🔍 API: Updating product:', id);

		if (!id) {
			console.error('❌ API: Product ID is required for update');
			throw new Error('Product ID is required for update');
		}

		const hasFiles = Object.values(data).some(
			(value) => value instanceof File || value instanceof FileList
		);

		let requestPromise;

		if (hasFiles) {
			const formData = new FormData();
			Object.keys(data).forEach((key) => {
				if (data[key] instanceof FileList) {
					Array.from(data[key]).forEach((file) => {
						formData.append(key, file);
					});
				} else if (data[key] instanceof File) {
					formData.append(key, data[key]);
				} else if (typeof data[key] === 'object' && data[key] !== null) {
					formData.append(key, JSON.stringify(data[key]));
				} else {
					formData.append(key, data[key]);
				}
			});

			requestPromise = api.put(`/products/${id}`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
		} else {
			requestPromise = api.put(`/products/${id}`, data, {
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return requestPromise.then((response) => {
			// Clear relevant cache after update
			apiCache.clearByPattern('/products');
			apiCache.clearByPattern(`/products/${id}`);
			return response;
		});
	},

	// ✅ Delete product (clears cache after deletion)
	delete: (id) => {
		console.log('🔍 API: Deleting product:', id);
		if (!id) {
			console.error('❌ API: Product ID is required for deletion');
			throw new Error('Product ID is required for deletion');
		}

		return api
			.delete(`/products/${id}`)
			.then((response) => {
				console.log('✅ API: Product deleted successfully:', response.data);
				// Clear relevant cache after deletion
				apiCache.clearByPattern('/products');
				apiCache.clearByPattern(`/products/${id}`);
				return response;
			})
			.catch((error) => {
				console.error('❌ API: Error deleting product:', error);
				throw error;
			});
	},

	// ✅ Get vendor's products (with caching)
	getVendorProducts: (params = {}) => {
		console.log('🔍 API: Getting vendor products with params:', params);
		return apiCache.deduplicate('/products/vendor/my-products', params, () =>
			api
				.get('/products/vendor/my-products', { params })
				.then((response) => {
					console.log(
						'✅ API: Vendor products retrieved successfully:',
						response.data
					);
					return response;
				})
				.catch((error) => {
					console.error('❌ API: Error getting vendor products:', error);
					throw error;
				})
		);
	},

	// ✅ Get vendor dashboard statistics (with caching)
	getVendorDashboardStats: () => {
		console.log('🔍 API: Getting vendor dashboard stats');
		return apiCache.deduplicate('/products/vendor/dashboard-stats', {}, () =>
			api
				.get('/products/vendor/dashboard-stats')
				.then((response) => {
					console.log(
						'✅ API: Dashboard stats retrieved successfully:',
						response.data
					);
					return response;
				})
				.catch((error) => {
					console.error('❌ API: Error getting dashboard stats:', error);
					throw error;
				})
		);
	},

	// ✅ Get featured products (with caching)
	getFeatured: () => {
		console.log('🔍 API: Getting featured products');
		return apiCache.deduplicate('/products/featured', {}, () =>
			api
				.get('/products/featured')
				.then((response) => {
					console.log(
						'✅ API: Featured products retrieved successfully:',
						response.data
					);
					return response;
				})
				.catch((error) => {
					console.error('❌ API: Error getting featured products:', error);
					if (error.response?.status === 404) {
						console.log(
							'ℹ️ API: Featured products endpoint not implemented, returning empty array'
						);
						return { data: { products: [] } };
					}
					throw error;
				})
		);
	},

	// ✅ Get trending products (with caching)
	getTrending: () => {
		console.log('🔍 API: Getting trending products');
		return apiCache.deduplicate('/products/trending', {}, () =>
			api
				.get('/products/trending')
				.then((response) => {
					console.log(
						'✅ API: Trending products retrieved successfully:',
						response.data
					);
					return response;
				})
				.catch((error) => {
					console.error('❌ API: Error getting trending products:', error);
					if (error.response?.status === 404) {
						console.log(
							'ℹ️ API: Trending products endpoint not implemented, returning empty array'
						);
						return { data: { products: [] } };
					}
					throw error;
				})
		);
	},

	// ✅ Get similar products (with caching)
	getSimilar: (id) => {
		console.log('🔍 API: Getting similar products for ID:', id);
		if (!id) {
			console.error('❌ API: Product ID is required for similar products');
			throw new Error('Product ID is required for similar products');
		}

		return apiCache.deduplicate(`/products/${id}/similar`, {}, () =>
			api
				.get(`/products/${id}/similar`)
				.then((response) => {
					console.log(
						'✅ API: Similar products retrieved successfully:',
						response.data
					);
					return response;
				})
				.catch((error) => {
					console.error('❌ API: Error getting similar products:', error);
					if (error.response?.status === 404) {
						console.log(
							'ℹ️ API: Similar products endpoint not implemented, returning empty array'
						);
						return { data: { products: [] } };
					}
					throw error;
				})
		);
	},

	// ✅ Search products (with caching for same search terms)
	search: (searchParams) => {
		console.log('🔍 API: Searching products with params:', searchParams);
		return apiCache.deduplicate('/products/search', searchParams, () =>
			api
				.get('/products/search', { params: searchParams })
				.then((response) => {
					console.log(
						'✅ API: Search results retrieved successfully:',
						response.data
					);
					return response;
				})
				.catch((error) => {
					console.error('❌ API: Error searching products:', error);
					throw error;
				})
		);
	},

	// ✅ Get products by category (with caching)
	getByCategory: (category, params = {}) => {
		console.log('🔍 API: Getting products by category:', category);
		return apiCache.deduplicate('/products', { category, ...params }, () =>
			api
				.get('/products', { params: { category, ...params } })
				.then((response) => {
					console.log(
						'✅ API: Category products retrieved successfully:',
						response.data
					);
					return response;
				})
				.catch((error) => {
					console.error('❌ API: Error getting category products:', error);
					throw error;
				})
		);
	},

	// ✅ Get products by vendor (with caching)
	getByVendor: (vendorId, params = {}) => {
		console.log('🔍 API: Getting products by vendor:', vendorId);
		return apiCache.deduplicate('/products', { vendorId, ...params }, () =>
			api
				.get('/products', { params: { vendorId, ...params } })
				.then((response) => {
					console.log(
						'✅ API: Vendor products retrieved successfully:',
						response.data
					);
					return response;
				})
				.catch((error) => {
					console.error('❌ API: Error getting vendor products:', error);
					throw error;
				})
		);
	},

	// ✅ Update product status (clears cache)
	updateStatus: (id, status) => {
		console.log('🔍 API: Updating product status:', id, status);
		return api
			.patch(`/products/${id}/status`, { status })
			.then((response) => {
				console.log(
					'✅ API: Product status updated successfully:',
					response.data
				);
				// Clear relevant cache after status update
				apiCache.clearByPattern('/products');
				apiCache.clearByPattern(`/products/${id}`);
				return response;
			})
			.catch((error) => {
				console.error('❌ API: Error updating product status:', error);
				throw error;
			});
	},

	// ✅ Bulk operations (clear cache after operations)
	bulkUpdate: (ids, updateData) => {
		console.log('🔍 API: Bulk updating products:', ids);
		return api
			.patch('/products/bulk-update', { ids, updateData })
			.then((response) => {
				console.log(
					'✅ API: Bulk update completed successfully:',
					response.data
				);
				// Clear all products cache after bulk update
				apiCache.clearByPattern('/products');
				return response;
			})
			.catch((error) => {
				console.error('❌ API: Error in bulk update:', error);
				throw error;
			});
	},

	bulkDelete: (ids) => {
		console.log('🔍 API: Bulk deleting products:', ids);
		return api
			.delete('/products/bulk-delete', { data: { ids } })
			.then((response) => {
				console.log(
					'✅ API: Bulk delete completed successfully:',
					response.data
				);
				// Clear all products cache after bulk delete
				apiCache.clearByPattern('/products');
				return response;
			})
			.catch((error) => {
				console.error('❌ API: Error in bulk delete:', error);
				throw error;
			});
	},
};

// Message API
export const messageAPI = {
	send: (data) => api.post('/messages', data),
	getUserMessages: () => api.get('/messages/my-messages'),
	getVendorMessages: () => api.get('/messages/vendor/messages'),
	getConversation: (vendorId) => api.get(`/messages/conversation/${vendorId}`),
	markAsRead: (id) => api.patch(`/messages/${id}/read`),
	reply: (id, data) => api.post(`/messages/${id}/reply`, data),
	delete: (id) => api.delete(`/messages/${id}`),
	bulkDelete: (ids) => api.post('/messages/bulk-delete', { ids }),
	archive: (id) => api.patch(`/messages/${id}/archive`),
};

// Review API
export const reviewAPI = {
	create: (data) => {
		const formData = new FormData();
		Object.keys(data).forEach((key) => {
			if (data[key] instanceof FileList) {
				Array.from(data[key]).forEach((file) => {
					formData.append('images', file);
				});
			} else if (data[key] instanceof File) {
				formData.append('images', data[key]);
			} else {
				formData.append(key, data[key]);
			}
		});
		return api.post('/reviews', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
	},
	getVendorReviews: (vendorId, params = {}) =>
		api.get(`/reviews/vendor/${vendorId}`, { params }),
	getProductReviews: (productId, params = {}) =>
		api.get(`/reviews/product/${productId}`, { params }),
	getUserReviews: () => api.get('/reviews/my-reviews'),
	update: (id, data) => {
		const formData = new FormData();
		Object.keys(data).forEach((key) => {
			if (data[key] instanceof FileList) {
				Array.from(data[key]).forEach((file) => {
					formData.append('images', file);
				});
			} else if (data[key] instanceof File) {
				formData.append('images', data[key]);
			} else {
				formData.append(key, data[key]);
			}
		});
		return api.put(`/reviews/${id}`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
	},
	delete: (id) => api.delete(`/reviews/${id}`),
	like: (id) => api.post(`/reviews/${id}/like`),
	unlike: (id) => api.delete(`/reviews/${id}/like`),

	// Admin functions
	getPending: () => api.get('/reviews/admin/pending'),
	approve: (id) => api.patch(`/reviews/admin/${id}/approve`),
	reject: (id) => api.patch(`/reviews/admin/${id}/reject`),
	flag: (id, reason) => api.post(`/reviews/${id}/flag`, { reason }),
};

// Search API
export const searchAPI = {
	global: (params) => api.get('/search', { params }),
	suggestions: (query) =>
		api.get('/search/suggestions', { params: { q: query } }),
	advanced: (params) => api.get('/search/advanced', { params }),
	byLocation: (params) => api.get('/search/location', { params }),
	getAnalytics: () => api.get('/search/analytics'),
	saveSearch: (query, filters) => api.post('/search/save', { query, filters }),
	getSavedSearches: () => api.get('/search/saved'),
	deleteSavedSearch: (id) => api.delete(`/search/saved/${id}`),
};

// Admin API
export const adminAPI = {
	getDashboardStats: () => api.get('/admin/dashboard'),
	getPendingVendors: () => api.get('/admin/vendors/pending'),
	getUsers: (params = {}) => api.get('/admin/users', { params }),
	getUserDetails: (id) => api.get(`/admin/users/${id}`),
	updateUserStatus: (id, status) =>
		api.patch(`/admin/users/${id}/status`, { status }),
	getReports: () => api.get('/admin/reports'),
	getAnalytics: (params = {}) => api.get('/admin/analytics', { params }),
	getSystemHealth: () => api.get('/admin/system/health'),
	manageContent: (action, data) =>
		api.post('/admin/content/manage', { action, data }),
};

// Order API
export const orderAPI = {
	create: (data) => api.post('/orders', data),
	getAll: (params = {}) => api.get('/orders', { params }),
	getById: (id) => api.get(`/orders/${id}`),
	update: (id, data) => api.put(`/orders/${id}`, data),
	updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
	cancel: (id, reason) => api.patch(`/orders/${id}/cancel`, { reason }),
	addPayment: (id, paymentData) =>
		api.post(`/orders/${id}/payment`, paymentData),
	getInvoice: (id) => api.get(`/orders/${id}/invoice`),

	// Vendor specific
	getVendorOrders: (params = {}) => api.get('/orders/vendor', { params }),
	acceptOrder: (id) => api.patch(`/orders/${id}/accept`),
	rejectOrder: (id, reason) => api.patch(`/orders/${id}/reject`, { reason }),
};

// File Upload API
export const uploadAPI = {
	uploadImage: (file) => {
		const formData = new FormData();
		formData.append('image', file);
		return api.post('/upload/image', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
	},
	uploadDocument: (file) => {
		const formData = new FormData();
		formData.append('document', file);
		return api.post('/upload/document', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
	},
	deleteFile: (url) => api.delete('/upload/delete', { data: { url } }),
};

// Notification API
export const notificationAPI = {
	getAll: () => api.get('/notifications'),
	markAsRead: (id) => api.patch(`/notifications/${id}/read`),
	markAllAsRead: () => api.patch('/notifications/read-all'),
	delete: (id) => api.delete(`/notifications/${id}`),
	updateSettings: (settings) => api.put('/notifications/settings', settings),
};

// Test API
export const testAPI = {
	getVendors: () => api.get('/test/vendors'),
	getProducts: () => api.get('/test/products'),
	healthCheck: () => api.get('/health'),
};

export default api;
