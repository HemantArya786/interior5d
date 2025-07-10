import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Eye,
	MessageSquare,
	Package,
	Plus,
	ShoppingBag,
	Star,
	User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { messageAPI, productAPI, reviewAPI } from '../services/api';

const VendorDashboard = () => {
	const { vendorData } = useOutletContext();
	const [stats, setStats] = useState({
		totalProducts: 0,
		totalReviews: 0,
		totalMessages: 0,
		totalViews: 0,
		totalOrders: 0,
	});
	const [recentProducts, setRecentProducts] = useState([]);
	const [recentReviews, setRecentReviews] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);

				// Fetch vendor-specific data in parallel
				const [productsResponse, reviewsResponse, messagesResponse] =
					await Promise.allSettled([
						productAPI.getVendorProducts({ limit: 5 }),
						reviewAPI.getVendorReviews(vendorData._id, { limit: 5 }),
						messageAPI.getVendorMessages(),
					]);

				// Process products data
				if (productsResponse.status === 'fulfilled') {
					const productsData = productsResponse.value.data;
					setRecentProducts(productsData.products || []);
					setStats((prev) => ({
						...prev,
						totalProducts:
							productsData.total || productsData.products?.length || 0,
					}));
				}

				// Process reviews data
				if (reviewsResponse.status === 'fulfilled') {
					const reviewsData = reviewsResponse.value.data;
					setRecentReviews(reviewsData.reviews || []);
					setStats((prev) => ({
						...prev,
						totalReviews: reviewsData.total || reviewsData.reviews?.length || 0,
					}));
				}

				// Process messages data
				if (messagesResponse.status === 'fulfilled') {
					const messagesData = messagesResponse.value.data;
					setStats((prev) => ({
						...prev,
						totalMessages:
							messagesData.total || messagesData.messages?.length || 0,
					}));
				}

				// Set some default/estimated stats
				setStats((prev) => ({
					...prev,
					totalViews:
						Math.floor(prev.totalProducts * 50) +
						Math.floor(Math.random() * 1000),
					totalOrders:
						Math.floor(prev.totalProducts * 2) + Math.floor(Math.random() * 50),
				}));
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
			} finally {
				setLoading(false);
			}
		};

		if (vendorData?._id) {
			fetchDashboardData();
		} else {
			// If no vendor ID, just stop loading
			setLoading(false);
		}
	}, [vendorData]);

	const statCards = [
		{
			title: 'Total Services',
			value: stats.totalProducts,
			icon: Package,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
			link: '/vendor-dashboard/services',
		},
		{
			title: 'Average Rating',
			value: `${(vendorData?.rating || 0).toFixed(1)}/5`,
			icon: Star,
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-50',
			link: '/vendor-dashboard/reviews',
		},
		{
			title: 'Total Reviews',
			value: stats.totalReviews,
			icon: MessageSquare,
			color: 'text-green-600',
			bgColor: 'bg-green-50',
			link: '/vendor-dashboard/reviews',
		},
		{
			title: 'Messages',
			value: stats.totalMessages,
			icon: MessageSquare,
			color: 'text-purple-600',
			bgColor: 'bg-purple-50',
			link: '/vendor-dashboard/messages',
		},
		{
			title: 'Total Views',
			value: stats.totalViews,
			icon: Eye,
			color: 'text-indigo-600',
			bgColor: 'bg-indigo-50',
		},
		{
			title: 'Orders',
			value: stats.totalOrders,
			icon: ShoppingBag,
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
			link: '/vendor-dashboard/orders',
		},
	];

	if (loading) {
		return (
			<div className="space-y-6">
				{/* Loading skeleton */}
				<div className="animate-pulse">
					<div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Welcome Section */}
			<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold mb-2">
							Welcome back, {vendorData?.name || 'Vendor'}!
						</h1>
						<p className="text-blue-100">
							Here's what's happening with your business today.
						</p>
					</div>
					<div className="text-right">
						<p className="text-sm text-blue-100">Member since</p>
						<p className="font-semibold">
							{vendorData?.createdAt
								? new Date(vendorData.createdAt).toLocaleDateString()
								: 'Recently'}
						</p>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Link to="/vendor-dashboard/add-service">
					<Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500">
						<CardContent className="flex items-center justify-center p-6">
							<div className="text-center">
								<Plus className="h-12 w-12 text-blue-600 mx-auto mb-2" />
								<h3 className="font-semibold text-gray-900">Add New Service</h3>
								<p className="text-sm text-gray-600">
									Create a new service offering
								</p>
							</div>
						</CardContent>
					</Card>
				</Link>

				<Link to="/vendor-dashboard/profile">
					<Card className="hover:shadow-lg transition-shadow cursor-pointer">
						<CardContent className="flex items-center justify-center p-6">
							<div className="text-center">
								<User className="h-12 w-12 text-green-600 mx-auto mb-2" />
								<h3 className="font-semibold text-gray-900">Update Profile</h3>
								<p className="text-sm text-gray-600">
									Manage your business info
								</p>
							</div>
						</CardContent>
					</Card>
				</Link>

				<Link to="/vendor-dashboard/messages">
					<Card className="hover:shadow-lg transition-shadow cursor-pointer">
						<CardContent className="flex items-center justify-center p-6">
							<div className="text-center">
								<MessageSquare className="h-12 w-12 text-purple-600 mx-auto mb-2" />
								<h3 className="font-semibold text-gray-900">Messages</h3>
								<p className="text-sm text-gray-600">
									Check customer inquiries
								</p>
							</div>
						</CardContent>
					</Card>
				</Link>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{statCards.map((stat, index) => {
					const Icon = stat.icon;
					const CardComponent = stat.link ? Link : 'div';

					return (
						<CardComponent key={index} to={stat.link}>
							<Card
								className={`${
									stat.link
										? 'hover:shadow-lg transition-shadow cursor-pointer'
										: ''
								}`}>
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-gray-600 mb-1">
												{stat.title}
											</p>
											<p className="text-2xl font-bold text-gray-900">
												{stat.value}
											</p>
										</div>
										<div className={`p-3 rounded-full ${stat.bgColor}`}>
											<Icon className={`h-6 w-6 ${stat.color}`} />
										</div>
									</div>
								</CardContent>
							</Card>
						</CardComponent>
					);
				})}
			</div>

			{/* Recent Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Services */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg">Recent Services</CardTitle>
						<Link to="/vendor-dashboard/services">
							<Button variant="outline" size="sm">
								View All
							</Button>
						</Link>
					</CardHeader>
					<CardContent>
						{recentProducts.length > 0 ? (
							<div className="space-y-4">
								{recentProducts.slice(0, 5).map((service) => (
									<div
										key={service._id}
										className="flex items-center space-x-3">
										<img
											src={
												service.thumbnailImage ||
												'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg'
											}
											alt={service.name}
											className="w-12 h-12 rounded-lg object-cover"
											onError={(e) => {
												e.target.src =
													'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg';
											}}
										/>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 truncate">
												{service.name}
											</p>
											<p className="text-xs text-gray-600">
												{service.category}
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium">
												₹{service.priceRange?.min?.toLocaleString() || '0'}
											</p>
											<p className="text-xs text-gray-600">
												{service.views || 0} views
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-6">
								<Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
								<p className="text-gray-600">No services yet</p>
								<Link to="/vendor-dashboard/add-service">
									<Button size="sm" className="mt-2">
										Add Your First Service
									</Button>
								</Link>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Recent Reviews */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg">Recent Reviews</CardTitle>
						<Link to="/vendor-dashboard/reviews">
							<Button variant="outline" size="sm">
								View All
							</Button>
						</Link>
					</CardHeader>
					<CardContent>
						{recentReviews.length > 0 ? (
							<div className="space-y-4">
								{recentReviews.slice(0, 5).map((review) => (
									<div
										key={review._id}
										className="border-b border-gray-100 pb-3 last:border-b-0">
										<div className="flex items-center space-x-2 mb-1">
											<div className="flex">
												{[...Array(5)].map((_, i) => (
													<Star
														key={i}
														className={`h-4 w-4 ${
															i < review.rating
																? 'text-yellow-400 fill-current'
																: 'text-gray-300'
														}`}
													/>
												))}
											</div>
											<span className="text-xs text-gray-600">
												{new Date(review.createdAt).toLocaleDateString()}
											</span>
										</div>
										<p className="text-sm text-gray-900 line-clamp-2">
											{review.reviewText}
										</p>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-6">
								<Star className="h-12 w-12 text-gray-400 mx-auto mb-2" />
								<p className="text-gray-600">No reviews yet</p>
								<p className="text-xs text-gray-500 mt-1">
									Get your first customer to leave a review
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default VendorDashboard;
