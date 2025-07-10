import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	Badge,
	Bell,
	Eye,
	LayoutDashboard,
	MessageSquare,
	Package,
	Plus,
	Settings,
	ShoppingBag,
	Star,
	User,
	X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const VendorSidebar = ({ isOpen, setIsOpen, vendorData }) => {
	const location = useLocation();
	const [notifications] = useState([
		{ id: 1, type: 'message', count: 3 },
		{ id: 2, type: 'review', count: 2 },
		{ id: 3, type: 'order', count: 1 },
	]);

	const navItems = [
		{
			title: 'Dashboard',
			href: '/vendor-dashboard',
			icon: LayoutDashboard,
			notification: null,
		},
		{
			title: 'Add Service',
			href: '/vendor-dashboard/add-service',
			icon: Plus,
			notification: null,
		},
		{
			title: 'My Services',
			href: '/vendor-dashboard/services',
			icon: Package,
			notification: null,
		},
		{
			title: 'Orders',
			href: '/vendor-dashboard/orders',
			icon: ShoppingBag,
			notification:
				notifications.find((n) => n.type === 'order')?.count || null,
		},
		{
			title: 'Messages',
			href: '/vendor-dashboard/messages',
			icon: MessageSquare,
			notification:
				notifications.find((n) => n.type === 'message')?.count || null,
		},
		{
			title: 'Reviews',
			href: '/vendor-dashboard/reviews',
			icon: Star,
			notification:
				notifications.find((n) => n.type === 'review')?.count || null,
		},
		{
			title: 'Profile',
			href: '/vendor-dashboard/profile',
			icon: User,
			notification: null,
		},
	];

	const getStatusColor = (status) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'suspended':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case 'active':
				return '✓';
			case 'pending':
				return '⏳';
			case 'suspended':
				return '⚠️';
			default:
				return '●';
		}
	};

	return (
		<>
			{/* Mobile overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={cn(
					'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
					isOpen ? 'translate-x-0' : '-translate-x-full'
				)}>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<div className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
							<Package className="w-5 h-5 text-white" />
						</div>
						<div>
							<span className="text-lg font-bold text-gray-900">Vendor</span>
							<div className="flex items-center space-x-1">
								<span className="text-xs">Panel</span>
							</div>
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsOpen(false)}
						className="lg:hidden">
						<X className="h-5 w-5" />
					</Button>
				</div>

				{/* Vendor Info */}
				<div className="p-4 border-b bg-gray-50">
					<div className="flex items-center space-x-3">
						<img
							src={
								vendorData?.images?.profileImage ||
								'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
							}
							alt="Vendor"
							className="w-12 h-12 rounded-full object-cover"
						/>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{vendorData?.title || 'Your Business'}
							</p>
							<p className="text-xs text-gray-600 truncate">
								{vendorData?.professionType || 'Professional'}
							</p>
							<div className="flex items-center space-x-1 mt-1">
								<Star className="w-3 h-3 text-yellow-400 fill-current" />
								<span className="text-xs text-gray-600">
									{vendorData?.rating?.toFixed(1) || '0.0'} (
									{vendorData?.reviewCount || 0} reviews)
								</span>
							</div>
						</div>
					</div>

					{/* Status Badge */}
					<div className="mt-3">
						<span
							className={cn(
								'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
								getStatusColor(vendorData?.status)
							)}>
							<span className="mr-1">{getStatusIcon(vendorData?.status)}</span>
							{vendorData?.status || 'Unknown'} Account
						</span>
					</div>
				</div>

				{/* Navigation */}
				<nav className="mt-4 px-2 space-y-1">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = location.pathname === item.href;

						return (
							<Link
								key={item.href}
								to={item.href}
								className={cn(
									'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative',
									isActive
										? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
										: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
								)}
								onClick={() => setIsOpen(false)}>
								<Icon
									className={cn(
										'mr-3 h-5 w-5 flex-shrink-0',
										isActive
											? 'text-blue-600'
											: 'text-gray-400 group-hover:text-gray-500'
									)}
								/>
								<span className="truncate">{item.title}</span>
								{item.notification && (
									<Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-4 flex items-center justify-center">
										{item.notification}
									</Badge>
								)}
							</Link>
						);
					})}
				</nav>

				{/* Quick Stats */}
				<div className="mt-8 mx-4 p-4 bg-blue-50 rounded-lg">
					<h3 className="text-sm font-medium text-blue-900 mb-3">
						Quick Stats
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between text-xs">
							<span className="text-blue-700">Services</span>
							<span className="font-medium text-blue-900">
								{vendorData?.productsCount || 0}
							</span>
						</div>
						<div className="flex justify-between text-xs">
							<span className="text-blue-700">Reviews</span>
							<span className="font-medium text-blue-900">
								{vendorData?.reviewCount || 0}
							</span>
						</div>
						<div className="flex justify-between text-xs">
							<span className="text-blue-700">Rating</span>
							<span className="font-medium text-blue-900">
								{vendorData?.rating?.toFixed(1) || '0.0'}/5
							</span>
						</div>
						<div className="flex justify-between text-xs">
							<span className="text-blue-700">Profile Views</span>
							<span className="font-medium text-blue-900">
								{vendorData?.profileViews || 0}
							</span>
						</div>
					</div>
				</div>

				{/* Support Section */}
				<div className="mt-4 mx-4 p-3 border border-gray-200 rounded-lg">
					<h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
					<p className="text-xs text-gray-600 mb-3">
						Get support or learn how to optimize your vendor profile.
					</p>
					<div className="space-y-2">
						<Button variant="outline" size="sm" className="w-full text-xs h-8">
							<MessageSquare className="h-3 w-3 mr-1" />
							Contact Support
						</Button>
						<Button variant="ghost" size="sm" className="w-full text-xs h-8">
							<Eye className="h-3 w-3 mr-1" />
							View Help Center
						</Button>
					</div>
				</div>

				{/* Performance Indicator */}
				{vendorData?.status === 'active' && (
					<div className="mt-4 mx-4 p-3 bg-green-50 rounded-lg border border-green-200">
						<div className="flex items-center">
							<div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
							<span className="text-xs text-green-800 font-medium">
								Account Active
							</span>
						</div>
						<p className="text-xs text-green-700 mt-1">
							Your services are visible to customers
						</p>
					</div>
				)}

				{/* Upgrade CTA */}
				<div className="mt-4 mx-4 mb-6 p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg text-white">
					<h4 className="text-sm font-medium mb-1">Boost Your Business</h4>
					<p className="text-xs opacity-90 mb-3">
						Upgrade to Premium for more features and better visibility.
					</p>
					<Button
						variant="outline"
						size="sm"
						className="w-full text-xs h-8 border-white text-white hover:bg-white hover:text-purple-600">
						<Star className="h-3 w-3 mr-1" />
						Upgrade Now
					</Button>
				</div>
			</div>
		</>
	);
};

export default VendorSidebar;
