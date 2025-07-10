import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Edit, Eye, Package, Plus, Search, Star, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';

const VendorServices = () => {
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [filterCategory, setFilterCategory] = useState('all');
	const [error, setError] = useState('');

	useEffect(() => {
		fetchServices();
	}, []);

	const fetchServices = async () => {
		try {
			setLoading(true);
			setError('');
			const response = await productAPI.getVendorProducts();
			setServices(response.data.products || response.data || []);
		} catch (error) {
			console.error('Error fetching services:', error);
			setError('Failed to load services');
			setServices([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteService = async (serviceId) => {
		if (window.confirm('Are you sure you want to delete this service?')) {
			try {
				await productAPI.delete(serviceId);
				setServices(services.filter((s) => s._id !== serviceId));
				alert('Service deleted successfully');
			} catch (error) {
				console.error('Error deleting service:', error);
				alert('Failed to delete service');
			}
		}
	};

	const filteredServices = services.filter((service) => {
		const matchesSearch =
			service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			service.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			service.shortDescription
				?.toLowerCase()
				.includes(searchQuery.toLowerCase());
		const matchesCategory =
			filterCategory === 'all' || service.category === filterCategory;
		return matchesSearch && matchesCategory;
	});

	const categories = [
		...new Set(services.map((s) => s.category).filter(Boolean)),
	];

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">My Services</h1>
					<p className="text-gray-600">Manage your service offerings</p>
				</div>
				<Link to="/vendor-dashboard/add-service">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Service
					</Button>
				</Link>
			</div>

			{/* Error Message */}
			{error && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="pt-6">
						<div className="flex items-center space-x-2 text-red-600">
							<Package className="h-5 w-5" />
							<span>{error}</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center">
							<Package className="h-8 w-8 text-blue-600" />
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">
									Total Services
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{services.length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center">
							<Star className="h-8 w-8 text-yellow-600" />
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Avg Rating</p>
								<p className="text-2xl font-bold text-gray-900">
									{services.length > 0
										? (
												services.reduce((acc, s) => acc + (s.rating || 0), 0) /
												services.length
										  ).toFixed(1)
										: '0.0'}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center">
							<Eye className="h-8 w-8 text-green-600" />
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Total Views</p>
								<p className="text-2xl font-bold text-gray-900">
									{services
										.reduce((acc, s) => acc + (s.views || 0), 0)
										.toLocaleString()}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center">
							<Package className="h-8 w-8 text-purple-600" />
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">
									Active Services
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{services.filter((s) => s.status === 'active').length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									placeholder="Search services..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<div className="sm:w-48">
							<select
								value={filterCategory}
								onChange={(e) => setFilterCategory(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
								<option value="all">All Categories</option>
								{categories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Services Grid */}
			{filteredServices.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredServices.map((service) => (
						<Card
							key={service._id}
							className="hover:shadow-lg transition-shadow">
							<div className="relative">
								<img
									src={
										service.thumbnailImage ||
										'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg'
									}
									alt={service.name}
									className="w-full h-48 object-cover rounded-t-lg"
									onError={(e) => {
										e.target.src =
											'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg';
									}}
								/>
								<Badge
									className={`absolute top-2 right-2 ${
										service.status === 'active'
											? 'bg-green-500'
											: service.status === 'draft'
											? 'bg-yellow-500'
											: 'bg-gray-500'
									}`}>
									{service.status || 'active'}
								</Badge>
							</div>

							<CardContent className="p-4">
								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900 line-clamp-2">
										{service.name}
									</h3>

									<p className="text-sm text-gray-600 line-clamp-2">
										{service.shortDescription}
									</p>

									<div className="flex items-center justify-between text-sm">
										<Badge variant="outline">{service.category}</Badge>
										<div className="flex items-center space-x-1">
											<Star className="h-4 w-4 text-yellow-400 fill-current" />
											<span>{service.rating || 0}</span>
											<span className="text-gray-500">
												({service.reviewCount || 0})
											</span>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<div>
											<p className="font-semibold text-green-600">
												₹{service.priceRange?.min?.toLocaleString() || '0'} - ₹
												{service.priceRange?.max?.toLocaleString() || '0'}
											</p>
										</div>
										<div className="flex items-center space-x-1 text-gray-500">
											<Eye className="h-4 w-4" />
											<span className="text-sm">{service.views || 0}</span>
										</div>
									</div>

									{/* Service Features */}
									{service.features && service.features.length > 0 && (
										<div className="mt-2">
											<div className="flex flex-wrap gap-1">
												{service.features.slice(0, 3).map((feature, index) => (
													<Badge
														key={index}
														variant="secondary"
														className="text-xs">
														{feature}
													</Badge>
												))}
												{service.features.length > 3 && (
													<Badge variant="secondary" className="text-xs">
														+{service.features.length - 3} more
													</Badge>
												)}
											</div>
										</div>
									)}
								</div>

								<div className="flex items-center justify-between mt-4 pt-4 border-t">
									<div className="flex space-x-2">
										<Link to={`/vendor-dashboard/service/${service._id}`}>
											<Button variant="outline" size="sm">
												<Eye className="h-4 w-4 mr-1" />
												View
											</Button>
										</Link>
										<Link to={`/vendor-dashboard/edit-service/${service._id}`}>
											<Button variant="outline" size="sm">
												<Edit className="h-4 w-4 mr-1" />
												Edit
											</Button>
										</Link>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDeleteService(service._id)}
										className="text-red-600 hover:text-red-700">
										<Trash2 className="h-4 w-4 mr-1" />
										Delete
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="py-12">
						<div className="text-center">
							<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								{searchQuery || filterCategory !== 'all'
									? 'No services found'
									: 'No services yet'}
							</h3>
							<p className="text-gray-600 mb-4">
								{searchQuery || filterCategory !== 'all'
									? 'Try adjusting your search or filter criteria'
									: 'Start by creating your first service offering'}
							</p>
							{!searchQuery && filterCategory === 'all' && (
								<Link to="/vendor-dashboard/add-service">
									<Button>
										<Plus className="h-4 w-4 mr-2" />
										Add Your First Service
									</Button>
								</Link>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default VendorServices;
