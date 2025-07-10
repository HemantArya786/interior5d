// components/VendorLayout.jsx - Fixed version
import { Button } from '@/components/ui/button';
import { Bell, LogOut, Menu, Search, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useApi';
import { apiUtils, authAPI } from '../services/api';
import VendorSidebar from './VendorSidebar';

const VendorLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [vendorData, setVendorData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [retryCount, setRetryCount] = useState(0);
	const { logout } = useAuth();
	const navigate = useNavigate();

	// Single fetchVendorData function
	const fetchVendorData = async (showLoading = true) => {
		try {
			if (showLoading) setLoading(true);
			setError(null);

			const response = await authAPI.getProfile();

			if (response.data.user.role !== 'vendor') {
				navigate('/login');
				return;
			}

			setVendorData(response.data.user);
			setRetryCount(0); // Reset retry count on success
		} catch (error) {
			console.error('Error fetching vendor data:', error);

			if (error.response?.status === 429) {
				setError('Rate limit exceeded. Please wait a moment before retrying.');
			} else if (error.response?.status === 401) {
				logout();
				navigate('/login');
				return;
			} else {
				setError('Failed to load vendor data. Please try again.');
			}
		} finally {
			// CRITICAL: Always set loading to false
			if (showLoading) setLoading(false);
		}
	};

	// useEffect now calls the main function
	useEffect(() => {
		fetchVendorData(true);
	}, [navigate]);

	const handleRetry = () => {
		setRetryCount((prev) => prev + 1);
		fetchVendorData(true);
	};

	const handleLogout = async () => {
		try {
			await logout();
			apiUtils.clearCache();
			navigate('/login');
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	// Rest of your component remains the same...
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center max-w-md">
					<div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
						<i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Loading Error
					</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<div className="space-x-4">
						<Button onClick={handleRetry}>Try Again</Button>
						<Button variant="outline" onClick={() => navigate('/login')}>
							Login Again
						</Button>
					</div>
					{retryCount > 0 && (
						<p className="text-sm text-gray-500 mt-2">
							Retry attempt: {retryCount}
						</p>
					)}
				</div>
			</div>
		);
	}

	if (!vendorData) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<p className="text-gray-600">No vendor data available</p>
					<Button onClick={handleRetry} className="mt-4">
						Reload
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-gray-50">
			<VendorSidebar
				isOpen={sidebarOpen}
				setIsOpen={setSidebarOpen}
				vendorData={vendorData}
			/>

			<div className="flex-1 flex flex-col overflow-hidden">
				<header className="bg-white shadow-sm border-b px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSidebarOpen(!sidebarOpen)}
								className="lg:hidden">
								<Menu className="h-5 w-5" />
							</Button>
							<div>
								<h1 className="text-xl font-semibold text-gray-900">
									Vendor Dashboard
								</h1>
								<p className="text-sm text-gray-600">{vendorData.title}</p>
							</div>
						</div>

						<div className="flex items-center space-x-4">
							<Button variant="ghost" size="sm">
								<Search className="h-5 w-5" />
							</Button>
							<Button variant="ghost" size="sm">
								<Bell className="h-5 w-5" />
							</Button>
							<div className="flex items-center space-x-2">
								<img
									src={
										vendorData.images?.profileImage ||
										'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
									}
									alt="Vendor"
									className="w-8 h-8 rounded-full object-cover"
								/>
								<span className="text-sm font-medium hidden md:block">
									{vendorData.name}
								</span>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleLogout}
								className="text-red-600 hover:text-red-700">
								<LogOut className="h-5 w-5" />
							</Button>
						</div>
					</div>

					{vendorData.status === 'pending' && (
						<div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
							<p className="text-yellow-800 text-sm">
								<strong>Account Pending:</strong> Your vendor account is under
								review. You'll be notified once approved.
							</p>
						</div>
					)}

					{error && (
						<div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
							<div className="flex justify-between items-center">
								<p className="text-red-800 text-sm">{error}</p>
								<Button size="sm" onClick={() => fetchVendorData(false)}>
									Refresh
								</Button>
							</div>
						</div>
					)}
				</header>

				<main className="flex-1 overflow-y-auto p-6">
					<Outlet context={{ vendorData, setVendorData }} />
				</main>
			</div>
		</div>
	);
};

export default VendorLayout;
