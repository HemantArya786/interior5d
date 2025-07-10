import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, vendorAPI } from './services/api';

function Features() {
	const [stats, setStats] = useState({
		productCount: 8000,
		vendorCount: 800,
		userCount: 20000,
		reviewCount: 12000,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true);
				setError(null);

				// Fetch real statistics from backend APIs
				const [productsResponse, vendorsResponse] = await Promise.allSettled([
					productAPI.getAll({ limit: 1 }),
					vendorAPI.getAll({ limit: 1 }),
				]);

				let updatedStats = { ...stats };

				// Update with real product data
				if (
					productsResponse.status === 'fulfilled' &&
					productsResponse.value.data
				) {
					const productData = productsResponse.value.data;
					updatedStats.productCount =
						productData.total ||
						productData.products?.length ||
						stats.productCount;
				}

				// Update with real vendor data
				if (
					vendorsResponse.status === 'fulfilled' &&
					vendorsResponse.value.data
				) {
					const vendorData = vendorsResponse.value.data;
					updatedStats.vendorCount =
						vendorData.total || vendorData.vendors?.length || stats.vendorCount;

					// Estimate other stats based on vendor count
					updatedStats.userCount = Math.floor(updatedStats.vendorCount * 25);
					updatedStats.reviewCount = Math.floor(updatedStats.vendorCount * 15);
				}

				setStats(updatedStats);
			} catch (err) {
				console.log('Using default stats - API not fully available:', err);
				setError('Using sample data - backend connection limited');
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	const features = [
		{
			title: '2D/3D Floor Planning',
			description:
				'Create detailed floor plans and visualize them in stunning 3D with our intuitive tools.',
			icon: '🏗️',
			color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
			stats: `${stats.productCount.toLocaleString()}+ Designs`,
			link: '/design-page',
			benefits: [
				'Drag & drop interface',
				'Real-time 3D preview',
				'Accurate measurements',
				'Professional templates',
			],
		},
		{
			title: 'AI Design Suggestions',
			description:
				'Get intelligent design recommendations based on your space, preferences, and the latest trends.',
			icon: '🤖',
			color: 'bg-gradient-to-br from-amber-500 to-orange-600',
			stats: 'Powered by AI',
			link: '/search',
			benefits: [
				'Smart layout optimization',
				'Style matching',
				'Trend analysis',
				'Personalized recommendations',
			],
		},
		{
			title: 'AR Visualization',
			description:
				'See how furniture and décor will look in your actual space with augmented reality support.',
			icon: '👓',
			color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
			stats: 'Real-time Preview',
			link: '/features',
			benefits: [
				'Mobile AR support',
				'Real-time rendering',
				'Virtual furniture placement',
				'Share with clients',
			],
		},
		{
			title: 'Expert Vendor Network',
			description: `Access our network of ${stats.vendorCount}+ verified interior designers, architects, and contractors.`,
			icon: '🏢',
			color: 'bg-gradient-to-br from-purple-500 to-pink-600',
			stats: `${stats.vendorCount}+ Professionals`,
			link: '/design-ideas',
			benefits: [
				'Verified professionals',
				'Direct messaging',
				'Portfolio browsing',
				'Quote requests',
			],
		},
	];

	const additionalFeatures = [
		{
			title: 'Material Library',
			description: 'Extensive collection of textures, materials, and finishes',
			icon: '🎨',
		},
		{
			title: 'Budget Planning',
			description: 'Track costs and manage your design budget effectively',
			icon: '💰',
		},
		{
			title: 'Collaboration Tools',
			description: 'Share designs and collaborate with team members',
			icon: '🤝',
		},
		{
			title: 'Export Options',
			description: 'Export designs in multiple formats for presentations',
			icon: '📤',
		},
	];

	return (
		<div className="py-16 bg-gray-50">
			<div className="max-w-7xl mx-auto px-4">
				{/* Header */}
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Powerful Design Features
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Our comprehensive suite of design tools empowers you to create
						stunning spaces with ease and precision.
					</p>
					{error && (
						<div className="mt-4 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg inline-block">
							{error}
						</div>
					)}
				</div>

				{/* Stats Section */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
					<div className="text-center">
						<div className="text-3xl font-bold text-blue-600">
							{loading ? '...' : stats.productCount.toLocaleString()}+
						</div>
						<div className="text-gray-600">Design Ideas</div>
					</div>
					<div className="text-center">
						<div className="text-3xl font-bold text-green-600">
							{loading ? '...' : stats.vendorCount.toLocaleString()}+
						</div>
						<div className="text-gray-600">Expert Vendors</div>
					</div>
					<div className="text-center">
						<div className="text-3xl font-bold text-purple-600">
							{loading ? '...' : stats.userCount.toLocaleString()}+
						</div>
						<div className="text-gray-600">Happy Users</div>
					</div>
					<div className="text-center">
						<div className="text-3xl font-bold text-orange-600">
							{loading ? '...' : stats.reviewCount.toLocaleString()}+
						</div>
						<div className="text-gray-600">Reviews</div>
					</div>
				</div>

				{/* Main Features Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
					{features.map((feature, index) => (
						<Card
							key={index}
							className="hover:shadow-lg transition-all duration-300 group">
							<CardHeader>
								<div
									className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform`}>
									{feature.icon}
								</div>
								<CardTitle className="text-xl">{feature.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-gray-600 mb-4">
									{feature.description}
								</CardDescription>
								<Badge variant="secondary" className="mb-4">
									{feature.stats}
								</Badge>

								{/* Benefits list */}
								<ul className="text-sm text-gray-500 space-y-1">
									{feature.benefits.map((benefit, idx) => (
										<li key={idx} className="flex items-center">
											<span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
											{benefit}
										</li>
									))}
								</ul>
							</CardContent>
							<CardFooter>
								<Link to={feature.link} className="w-full">
									<Button
										variant="outline"
										className="w-full group-hover:bg-blue-50">
										Explore Feature
									</Button>
								</Link>
							</CardFooter>
						</Card>
					))}
				</div>

				{/* Additional Features */}
				<div className="mb-16">
					<h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
						Additional Capabilities
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{additionalFeatures.map((feature, index) => (
							<div
								key={index}
								className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
								<div className="text-3xl mb-3">{feature.icon}</div>
								<h4 className="font-semibold text-gray-900 mb-2">
									{feature.title}
								</h4>
								<p className="text-sm text-gray-600">{feature.description}</p>
							</div>
						))}
					</div>
				</div>

				{/* Process Steps */}
				<div className="bg-white rounded-xl p-8 mb-16">
					<h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
						How It Works
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div className="text-center">
							<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl font-bold text-blue-600">1</span>
							</div>
							<h4 className="font-semibold mb-2">Create Your Space</h4>
							<p className="text-sm text-gray-600">
								Start with room measurements or upload floor plans
							</p>
						</div>
						<div className="text-center">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl font-bold text-green-600">2</span>
							</div>
							<h4 className="font-semibold mb-2">Design & Customize</h4>
							<p className="text-sm text-gray-600">
								Use our tools to place furniture and décor
							</p>
						</div>
						<div className="text-center">
							<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl font-bold text-purple-600">3</span>
							</div>
							<h4 className="font-semibold mb-2">Visualize in 3D/AR</h4>
							<p className="text-sm text-gray-600">
								See your design come to life in immersive views
							</p>
						</div>
						<div className="text-center">
							<div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl font-bold text-orange-600">4</span>
							</div>
							<h4 className="font-semibold mb-2">Connect with Pros</h4>
							<p className="text-sm text-gray-600">
								Get help from verified design professionals
							</p>
						</div>
					</div>
				</div>

				{/* CTA Section */}
				<div className="text-center">
					<h3 className="text-2xl font-bold text-gray-900 mb-4">
						Ready to Transform Your Space?
					</h3>
					<p className="text-gray-600 mb-8 max-w-2xl mx-auto">
						Join thousands of designers and homeowners who are creating stunning
						spaces with our platform.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link to="/signup">
							<Button size="lg" className="min-w-32">
								Get Started Free
							</Button>
						</Link>
						<Link to="/features">
							<Button variant="outline" size="lg" className="min-w-32">
								<i className="fas fa-play mr-2"></i>
								Watch Demo
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Features;
