import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useEffect, useState } from 'react';
import { productAPI, vendorAPI } from './services/api';

const Feature = () => {
	const [stats, setStats] = useState({
		designCount: 50000,
		brandCount: 200,
		categoryCount: 20,
		userCount: 100000,
		vendorCount: 5000,
		reviewCount: 25000,
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchRealStats = async () => {
			try {
				setLoading(true);

				// Fetch real statistics from backend
				const [productsResponse, vendorsResponse] = await Promise.allSettled([
					productAPI.getAll({ limit: 1 }),
					vendorAPI.getAll({ limit: 1 }),
				]);

				let updatedStats = { ...stats };

				if (
					productsResponse.status === 'fulfilled' &&
					productsResponse.value.data
				) {
					const productData = productsResponse.value.data;
					updatedStats.designCount = productData.total || stats.designCount;
					updatedStats.categoryCount =
						productData.categories?.length || stats.categoryCount;
				}

				if (
					vendorsResponse.status === 'fulfilled' &&
					vendorsResponse.value.data
				) {
					const vendorData = vendorsResponse.value.data;
					updatedStats.vendorCount = vendorData.total || stats.vendorCount;
					// Estimate other stats based on vendor count
					updatedStats.userCount = Math.floor(updatedStats.vendorCount * 20);
					updatedStats.reviewCount = Math.floor(updatedStats.vendorCount * 5);
				}

				setStats(updatedStats);
			} catch (error) {
				console.log('Using default stats - API not available', error);
			} finally {
				setLoading(false);
			}
		};

		fetchRealStats();
	}, []);

	const testimonials = [
		{
			name: 'Sarah Johnson',
			role: 'Interior Designer, Studio Spaces',
			content:
				'The AR visualization feature has completely transformed how I present concepts to clients. They can now see exactly how their space will look before making any purchases.',
			rating: 5,
		},
		{
			name: 'Michael Chen',
			role: 'Architect, Modern Designs',
			content:
				"The AI layout suggestions have saved me countless hours of work. It provides intelligent starting points that I can then refine to match my client's specific needs.",
			rating: 4.5,
		},
		{
			name: 'Emma Rodriguez',
			role: 'Home Stager, Perfect Spaces',
			content:
				'The extensive furniture catalog means I can always find exactly what I need for any project. The 4K rendering capabilities have elevated my presentation materials to a new level.',
			rating: 5,
		},
	];

	const features = [
		{
			title: 'Drag-and-Drop Design Tools',
			description:
				'Intuitive design interface with seamless switching between 2D floor plans and immersive 3D environments. Design with precision and ease.',
			icon: 'fas fa-vector-square',
			image:
				'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg',
			tabs: [
				{
					id: '2d',
					label: '2D Mode',
					content:
						'Create precise floor plans with accurate measurements, wall placements, and furniture layouts in an intuitive 2D interface.',
				},
				{
					id: '3d',
					label: '3D Mode',
					content:
						"Walk through your designs in immersive 3D, adjust lighting, materials, and experience spaces before they're built.",
				},
			],
		},
		{
			title: 'AI-powered Layout Suggestions',
			description:
				'Let our advanced AI analyze your space and suggest optimal furniture arrangements based on room dimensions, traffic flow, and design principles.',
			icon: 'fas fa-brain',
			image:
				'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg',
			features: [
				'Smart space optimization recommendations',
				'Style matching based on your preferences',
				'Traffic flow and ergonomic analysis',
			],
		},
		{
			title: 'Real-time AR Visualization',
			description:
				'See your designs in your actual space with our cutting-edge augmented reality technology. Perfect for visualizing before purchasing.',
			icon: 'fas fa-vr-cardboard',
			image:
				'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg',
			compatibility: [
				{ platform: 'iOS', version: '14+', icon: 'fab fa-apple' },
				{ platform: 'Android', version: '10+', icon: 'fab fa-android' },
				{ platform: 'Tablets', version: '', icon: 'fas fa-tablet-alt' },
			],
		},
		{
			title: 'Extensive Furniture Catalog',
			description:
				'Access our vast library of furniture and décor items from leading brands and designers. Find the perfect pieces for any style or budget.',
			icon: 'fas fa-couch',
			image:
				'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg',
			stats: [
				{ value: stats.designCount, label: 'Furniture Items' },
				{ value: stats.brandCount, label: 'Brands' },
				{ value: stats.categoryCount, label: 'Style Categories' },
			],
		},
		{
			title: '4K Realistic Rendering',
			description:
				'Generate stunning photorealistic snapshots of your designs in crystal-clear 4K resolution. Perfect for presentations or sharing on social media.',
			icon: 'fas fa-camera',
			image:
				'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg',
			quality: 'Ultra HD',
		},
		{
			title: 'Cloud Sync Across Devices',
			description:
				'Work seamlessly across all your devices with real-time cloud synchronization. Start on your desktop and continue on your tablet or smartphone.',
			icon: 'fas fa-cloud',
			image:
				'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg',
			devices: [
				{ name: 'Desktop', icon: 'fas fa-desktop' },
				{ name: 'Tablet', icon: 'fas fa-tablet-alt' },
				{ name: 'Mobile', icon: 'fas fa-mobile-alt' },
				{ name: 'Web', icon: 'fas fa-globe' },
			],
		},
	];

	const renderStars = (rating) => {
		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;

		for (let i = 0; i < 5; i++) {
			if (i < fullStars) {
				stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
			} else if (i === fullStars && hasHalfStar) {
				stars.push(
					<i key={i} className="fas fa-star-half-alt text-yellow-400"></i>
				);
			} else {
				stars.push(<i key={i} className="fas fa-star text-gray-300"></i>);
			}
		}
		return stars;
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 z-0">
					<div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-transparent z-10"></div>
					<img
						src="https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg"
						alt="DesignVerse Features"
						className="w-full h-full object-cover object-top"
					/>
				</div>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="py-20 md:py-28 lg:py-32 max-w-3xl">
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
							Powerful Features for Limitless Design
						</h1>
						<p className="text-xl text-gray-700 mb-8">
							Everything you need to bring your design vision to life with
							intuitive tools, AI assistance, and stunning visualizations.
						</p>
						<div className="flex flex-wrap gap-4">
							<Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
								Try For Free
							</Button>
							<Button variant="outline">
								<i className="fas fa-play-circle mr-2"></i> Watch Demo
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-12 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
						<div>
							<div className="text-3xl font-bold text-indigo-600">
								{loading ? '...' : stats.designCount.toLocaleString()}+
							</div>
							<div className="text-gray-600">Design Templates</div>
						</div>
						<div>
							<div className="text-3xl font-bold text-indigo-600">
								{loading ? '...' : stats.vendorCount.toLocaleString()}+
							</div>
							<div className="text-gray-600">Professional Designers</div>
						</div>
						<div>
							<div className="text-3xl font-bold text-indigo-600">
								{loading ? '...' : stats.userCount.toLocaleString()}+
							</div>
							<div className="text-gray-600">Happy Users</div>
						</div>
						<div>
							<div className="text-3xl font-bold text-indigo-600">
								{loading ? '...' : stats.reviewCount.toLocaleString()}+
							</div>
							<div className="text-gray-600">5-Star Reviews</div>
						</div>
					</div>
				</div>
			</section>

			{/* Main Features */}
			<section className="py-16 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Revolutionary Design Tools
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Discover the powerful features that make DesignVerse the ultimate
							platform for interior designers and enthusiasts.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{features.map((feature, index) => (
							<Card
								key={index}
								className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full">
								<div className="h-48 overflow-hidden">
									<img
										src={feature.image}
										alt={feature.title}
										className="w-full h-full object-cover object-top"
										onError={(e) => {
											e.target.src =
												'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg';
										}}
									/>
								</div>
								<CardContent className="p-6">
									<div className="flex items-center mb-4">
										<div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4">
											<i className={`${feature.icon} text-xl`}></i>
										</div>
										<h3 className="text-xl font-bold text-gray-900">
											{feature.title}
										</h3>
									</div>
									<p className="text-gray-600 mb-4">{feature.description}</p>

									{/* Feature-specific content */}
									{feature.tabs && (
										<Tabs defaultValue={feature.tabs[0].id} className="w-full">
											<TabsList className="grid w-full grid-cols-2">
												{feature.tabs.map((tab) => (
													<TabsTrigger key={tab.id} value={tab.id}>
														{tab.label}
													</TabsTrigger>
												))}
											</TabsList>
											{feature.tabs.map((tab) => (
												<TabsContent
													key={tab.id}
													value={tab.id}
													className="mt-4 text-sm text-gray-500">
													{tab.content}
												</TabsContent>
											))}
										</Tabs>
									)}

									{feature.features && (
										<ul className="text-sm text-gray-500 space-y-2">
											{feature.features.map((item, idx) => (
												<li key={idx} className="flex items-start">
													<i className="fas fa-check text-green-500 mt-1 mr-2"></i>
													<span>{item}</span>
												</li>
											))}
										</ul>
									)}

									{feature.compatibility && (
										<div className="bg-gray-50 p-3 rounded-lg">
											<div className="text-sm font-medium text-gray-900 mb-1">
												Compatible with:
											</div>
											<div className="flex space-x-3">
												{feature.compatibility.map((device, idx) => (
													<div key={idx} className="flex items-center">
														<i
															className={`${device.icon} text-gray-700 mr-1`}></i>
														<span className="text-sm text-gray-600">
															{device.platform} {device.version}
														</span>
													</div>
												))}
											</div>
										</div>
									)}

									{feature.stats && (
										<div className="grid grid-cols-3 gap-2 mb-3">
											{feature.stats.map((stat, idx) => (
												<div
													key={idx}
													className="bg-gray-100 p-2 rounded text-center">
													<div className="text-2xl font-bold text-indigo-600">
														{stat.value >= 1000
															? `${Math.floor(stat.value / 1000)}K+`
															: stat.value}
													</div>
													<div className="text-xs text-gray-500">
														{stat.label}
													</div>
												</div>
											))}
										</div>
									)}

									{feature.quality && (
										<div className="bg-gray-50 p-3 rounded-lg">
											<div className="flex justify-between items-center mb-2">
												<span className="text-sm font-medium text-gray-900">
													Rendering Quality
												</span>
												<span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
													{feature.quality}
												</span>
											</div>
											<div className="w-full bg-gray-200 rounded-full h-2.5">
												<div className="bg-indigo-600 h-2.5 rounded-full w-full"></div>
											</div>
										</div>
									)}

									{feature.devices && (
										<div className="flex flex-wrap gap-2">
											{feature.devices.map((device, idx) => (
												<div
													key={idx}
													className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
													<i
														className={`${device.icon} text-gray-600 mr-2`}></i>
													<span className="text-sm text-gray-600">
														{device.name}
													</span>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							What Designers Are Saying
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							Join thousands of professionals who are transforming their design
							workflow with DesignVerse.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{testimonials.map((testimonial, index) => (
							<Card key={index} className="bg-white p-6 shadow-sm">
								<div className="flex items-center mb-4">
									<div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4">
										<i className="fas fa-user text-xl"></i>
									</div>
									<div>
										<h4 className="font-bold text-gray-900">
											{testimonial.name}
										</h4>
										<p className="text-sm text-gray-500">{testimonial.role}</p>
									</div>
								</div>
								<p className="text-gray-600 mb-4">"{testimonial.content}"</p>
								<div className="flex">{renderStars(testimonial.rating)}</div>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 bg-indigo-600">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold text-white mb-6">
						Ready to Transform Your Design Process?
					</h2>
					<p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
						Join thousands of designers who are creating stunning spaces with
						DesignVerse's powerful features.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Button className="bg-white text-indigo-600 hover:bg-indigo-50">
							Start Free Trial
						</Button>
						<Button
							variant="outline"
							className="border-white text-white hover:bg-indigo-700">
							Schedule Demo
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Feature;
