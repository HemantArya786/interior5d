import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	MapPin,
	Package,
	Search,
	ShoppingBag,
	User,
	XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

import { useVendorOrders } from '../hooks/useApi';
import { orderAPI } from '../services/api';

const VendorOrders = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [filterStatus, setFilterStatus] = useState('all');

	const { data: ordersData, loading, refetch } = useVendorOrders();
	const orders = ordersData?.orders || [];

	const handleStatusUpdate = async (orderId, newStatus) => {
		try {
			await orderAPI.updateStatus(orderId, newStatus);
			refetch();
			alert('Order status updated successfully!');
		} catch (error) {
			console.error('Error updating order status:', error);
			alert('Failed to update order status');
		}
	};

	const filteredOrders = orders.filter((order) => {
		const matchesSearch =
			order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			order.customerInfo?.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			order.serviceDetails?.serviceName
				?.toLowerCase()
				.includes(searchQuery.toLowerCase());

		const matchesStatus =
			filterStatus === 'all' || order.status === filterStatus;

		return matchesSearch && matchesStatus;
	});

	const getStatusColor = (status) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-500';
			case 'confirmed':
				return 'bg-blue-500';
			case 'in_progress':
				return 'bg-orange-500';
			case 'completed':
				return 'bg-green-500';
			case 'cancelled':
				return 'bg-red-500';
			default:
				return 'bg-gray-500';
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case 'pending':
				return <Clock className="h-4 w-4" />;
			case 'confirmed':
				return <CheckCircle className="h-4 w-4" />;
			case 'in_progress':
				return <Package className="h-4 w-4" />;
			case 'completed':
				return <CheckCircle className="h-4 w-4" />;
			case 'cancelled':
				return <XCircle className="h-4 w-4" />;
			default:
				return <ShoppingBag className="h-4 w-4" />;
		}
	};

	const statusOptions = [
		'pending',
		'confirmed',
		'in_progress',
		'design_review',
		'material_procurement',
		'installation',
		'completed',
		'cancelled',
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
					<h1 className="text-2xl font-bold text-gray-900">Orders</h1>
					<p className="text-gray-600">Manage your customer orders</p>
				</div>
				<div className="flex items-center space-x-2">
					<Badge variant="outline">
						{orders.filter((o) => o.status === 'pending').length} Pending
					</Badge>
					<Badge variant="outline">{orders.length} Total Orders</Badge>
				</div>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									placeholder="Search orders..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<div className="sm:w-48">
							<select
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
								<option value="all">All Statuses</option>
								{statusOptions.map((status) => (
									<option key={status} value={status}>
										{status
											.replace('_', ' ')
											.replace(/\b\w/g, (l) => l.toUpperCase())}
									</option>
								))}
							</select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Orders List */}
			{filteredOrders.length > 0 ? (
				<div className="space-y-4">
					{filteredOrders.map((order) => (
						<Card key={order._id} className="hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-lg">
											Order #{order.orderNumber}
										</CardTitle>
										<p className="text-sm text-gray-600">
											{new Date(order.createdAt).toLocaleDateString()}
										</p>
									</div>
									<Badge className={getStatusColor(order.status)}>
										<div className="flex items-center space-x-1">
											{getStatusIcon(order.status)}
											<span className="capitalize">
												{order.status.replace('_', ' ')}
											</span>
										</div>
									</Badge>
								</div>
							</CardHeader>

							<CardContent className="space-y-4">
								{/* Customer Information */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<h4 className="font-medium text-gray-900 flex items-center">
											<User className="h-4 w-4 mr-2" />
											Customer Information
										</h4>
										<div className="text-sm space-y-1">
											<p>
												<strong>Name:</strong> {order.customerInfo.name}
											</p>
											<p>
												<strong>Email:</strong> {order.customerInfo.email}
											</p>
											<p>
												<strong>Phone:</strong> {order.customerInfo.phone}
											</p>
										</div>
									</div>

									<div className="space-y-2">
										<h4 className="font-medium text-gray-900 flex items-center">
											<MapPin className="h-4 w-4 mr-2" />
											Service Location
										</h4>
										<div className="text-sm space-y-1">
											<p>{order.customerInfo.address}</p>
											<p>
												{order.customerInfo.city}, {order.customerInfo.state}
											</p>
											<p>Pincode: {order.customerInfo.pincode}</p>
										</div>
									</div>
								</div>

								{/* Service Details */}
								{order.serviceDetails && (
									<div className="space-y-2">
										<h4 className="font-medium text-gray-900 flex items-center">
											<Package className="h-4 w-4 mr-2" />
											Service Details
										</h4>
										<div className="bg-gray-50 p-3 rounded-lg">
											<p className="font-medium">
												{order.serviceDetails.serviceName}
											</p>
											{order.serviceDetails.description && (
												<p className="text-sm text-gray-600 mt-1">
													{order.serviceDetails.description}
												</p>
											)}
											{order.serviceDetails.timeline && (
												<p className="text-sm text-gray-600 mt-2">
													<strong>Timeline:</strong>{' '}
													{order.serviceDetails.timeline}
												</p>
											)}
										</div>
									</div>
								)}

								{/* Pricing */}
								<div className="space-y-2">
									<h4 className="font-medium text-gray-900 flex items-center">
										<DollarSign className="h-4 w-4 mr-2" />
										Pricing Details
									</h4>
									<div className="bg-green-50 p-3 rounded-lg">
										<div className="flex justify-between items-center">
											<span>Base Price:</span>
											<span>₹{order.pricing.basePrice.toLocaleString()}</span>
										</div>
										{order.pricing.consultationFee > 0 && (
											<div className="flex justify-between items-center">
												<span>Consultation Fee:</span>
												<span>
													₹{order.pricing.consultationFee.toLocaleString()}
												</span>
											</div>
										)}
										{order.pricing.discount > 0 && (
											<div className="flex justify-between items-center text-red-600">
												<span>Discount:</span>
												<span>-₹{order.pricing.discount.toLocaleString()}</span>
											</div>
										)}
										<div className="flex justify-between items-center font-bold text-lg border-t pt-2 mt-2">
											<span>Total Amount:</span>
											<span>₹{order.pricing.totalAmount.toLocaleString()}</span>
										</div>
									</div>
								</div>

								{/* Timeline */}
								{order.timeline && (
									<div className="space-y-2">
										<h4 className="font-medium text-gray-900 flex items-center">
											<Calendar className="h-4 w-4 mr-2" />
											Timeline
										</h4>
										<div className="text-sm space-y-1">
											{order.timeline.startDate && (
												<p>
													<strong>Start Date:</strong>{' '}
													{new Date(
														order.timeline.startDate
													).toLocaleDateString()}
												</p>
											)}
											{order.timeline.expectedCompletionDate && (
												<p>
													<strong>Expected Completion:</strong>{' '}
													{new Date(
														order.timeline.expectedCompletionDate
													).toLocaleDateString()}
												</p>
											)}
											{order.timeline.actualCompletionDate && (
												<p>
													<strong>Actual Completion:</strong>{' '}
													{new Date(
														order.timeline.actualCompletionDate
													).toLocaleDateString()}
												</p>
											)}
										</div>
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex flex-wrap gap-2 pt-4 border-t">
									{order.status === 'pending' && (
										<>
											<Button
												size="sm"
												onClick={() =>
													handleStatusUpdate(order._id, 'confirmed')
												}>
												Confirm Order
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													handleStatusUpdate(order._id, 'cancelled')
												}>
												Cancel Order
											</Button>
										</>
									)}

									{order.status === 'confirmed' && (
										<Button
											size="sm"
											onClick={() =>
												handleStatusUpdate(order._id, 'in_progress')
											}>
											Start Work
										</Button>
									)}

									{order.status === 'in_progress' && (
										<>
											<Button
												size="sm"
												onClick={() =>
													handleStatusUpdate(order._id, 'design_review')
												}>
												Send for Review
											</Button>
											<Button
												size="sm"
												onClick={() =>
													handleStatusUpdate(order._id, 'completed')
												}>
												Mark Complete
											</Button>
										</>
									)}

									{(order.status === 'design_review' ||
										order.status === 'material_procurement' ||
										order.status === 'installation') && (
										<Button
											size="sm"
											onClick={() =>
												handleStatusUpdate(order._id, 'completed')
											}>
											Mark Complete
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="py-12">
						<div className="text-center">
							<ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								{searchQuery || filterStatus !== 'all'
									? 'No orders found'
									: 'No orders yet'}
							</h3>
							<p className="text-gray-600">
								{searchQuery || filterStatus !== 'all'
									? 'Try adjusting your search or filter criteria'
									: 'Customer orders will appear here when they place orders'}
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default VendorOrders;
