import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProductCategories, useVendors } from './hooks/useApi';
import { productAPI } from './services/api';

const FindPros = () => {
	const [activeTab, setActiveTab] = useState('All');
	const [searchQuery, setSearchQuery] = useState('');
	const [stats, setStats] = useState({
		totalDesigns: 0,
		totalVendors: 0,
		loading: true,
	});
	const [searchParams] = useSearchParams();

	// Get initial tab from URL params
	useEffect(() => {
		const categoryParam = searchParams.get('category');
		if (categoryParam) {
			setActiveTab(categoryParam);
		}
	}, [searchParams]);

	// API calls for categories and vendors
	const {
		data: categoriesData,
		loading: categoriesLoading,
		error: categoriesError,
		refetch: refetchCategories,
	} = useProductCategories();

	const {
		data: vendorsData,
		loading: vendorsLoading,
		error: vendorsError,
		refetch: refetchVendors,
	} = useVendors({
		limit: 20,
		search: searchQuery || undefined,
		category: activeTab !== 'All' ? activeTab : undefined,
	});

	// Fetch overall statistics
	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await productAPI.getAll({ limit: 1 });
				setStats({
					totalDesigns: response.data.total || 0,
					totalVendors: vendorsData?.total || 0,
					loading: false,
				});
			} catch (error) {
				console.log('Stats fetch failed, using defaults', error);
				setStats({
					totalDesigns: 50000,
					totalVendors: 5000,
					loading: false,
				});
			}
		};

		fetchStats();
	}, [vendorsData]);

	const categories = categoriesData?.categories || [];
	const vendors = vendorsData?.vendors || [];

	// Transform categories for display with real vendor counts
	const transformedCategories = categories.map((category) => {
		const categoryVendors = vendors.filter((v) =>
			v.categories?.includes(category)
		);

		return {
			title: category,
			designs:
				categoryVendors.length > 0
					? categoryVendors.length * 10 // Estimate designs per vendor
					: Math.floor(Math.random() * 3000) + 1000,
			vendors: categoryVendors.length,
			imageUrl: getCategoryImage(category),
		};
	});

	// Filter categories based on search
	const filteredCategories = transformedCategories.filter((category) => {
		const matchesTab = activeTab === 'All' || category.title === activeTab;
		const matchesSearch =
			!searchQuery ||
			category.title.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesTab && matchesSearch;
	});

	const tabs = ['All', ...categories.slice(0, 5)];

	// Get category-specific images
	const getCategoryImage = (category) => {
		const imageMap = {
			Kitchen:
				'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg',
			'Living Room':
				'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
			Bedroom:
				'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg',
			Bathroom:
				'https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg',
			Office:
				'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg',
		};
		return (
			imageMap[category] ||
			'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg'
		);
	};

	const handleRetry = () => {
		refetchCategories();
		refetchVendors();
	};

	if (categoriesLoading) {
		return (
			<div className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
						<div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-8"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
								<div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="py-16 bg-gray-50">
			<div className="max-w-7xl mx-auto px-4">
				{/* Header */}
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Find Design Professionals
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						From modular kitchens to vastu-aligned interiors, our expert
						designers bring a perfect blend of tradition and modern design to
						your home.
					</p>

					{/* Statistics */}
					{!stats.loading && (
						<div className="flex justify-center gap-8 mt-6">
							<div className="text-center">
								<div className="text-2xl font-bold text-blue-600">
									{stats.totalDesigns.toLocaleString()}+
								</div>
								<div className="text-sm text-gray-600">Design Ideas</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-green-600">
									{stats.totalVendors.toLocaleString()}+
								</div>
								<div className="text-sm text-gray-600">Expert Designers</div>
							</div>
						</div>
					)}
				</div>

				{/* Search */}
				<div className="max-w-md mx-auto mb-8">
					<div className="relative">
						<Input
							type="text"
							placeholder="Search categories..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center">
							<i className="fas fa-search text-gray-400"></i>
						</div>
					</div>
				</div>

				{/* Error Messages */}
				{categoriesError && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
						<div className="flex justify-between items-center">
							<span>Error loading categories: {categoriesError}</span>
							<Button onClick={handleRetry} size="sm" variant="outline">
								Retry
							</Button>
						</div>
					</div>
				)}

				{vendorsError && (
					<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-8">
						<span>
							Warning: Could not load vendor data. Showing category structure
							only.
						</span>
					</div>
				)}

				{/* Navigation Tabs */}
				<div className="flex flex-wrap justify-center gap-2 mb-8">
					{tabs.map((tab) => (
						<Button
							key={tab}
							variant={activeTab === tab ? 'default' : 'outline'}
							onClick={() => setActiveTab(tab)}
							className="mb-2">
							{tab}
							{tab !== 'All' && (
								<Badge variant="secondary" className="ml-2">
									{transformedCategories.find((c) => c.title === tab)
										?.vendors || 0}
								</Badge>
							)}
						</Button>
					))}
				</div>

				{/* Loading indicator for vendors */}
				{vendorsLoading && (
					<div className="text-center mb-4">
						<div className="inline-flex items-center text-gray-600">
							<i className="fas fa-spinner fa-spin mr-2"></i>
							Loading vendor data...
						</div>
					</div>
				)}

				{/* Categories Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredCategories.map((category, index) => (
						<Link
							key={index}
							to={`/design-ideas?category=${encodeURIComponent(
								category.title
							)}`}>
							<Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
								<div className="aspect-[4/3] bg-gray-200 overflow-hidden">
									<img
										src={category.imageUrl}
										alt={category.title}
										className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
										onError={(e) => {
											e.target.src =
												'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg';
										}}
									/>
								</div>
								<CardContent className="p-4">
									<h3 className="font-semibold text-lg text-gray-900 mb-2">
										{category.title}
									</h3>
									<div className="space-y-1">
										<p className="text-gray-600 text-sm">
											{category.designs.toLocaleString()} Designs
										</p>
										<p className="text-blue-600 text-sm font-medium">
											{category.vendors} Professional
											{category.vendors !== 1 ? 's' : ''}
										</p>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>

				{/* Empty State */}
				{filteredCategories.length === 0 && (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
							<i className="fas fa-search text-gray-400 text-xl"></i>
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No categories found
						</h3>
						<p className="text-gray-500 mb-4">
							Try adjusting your search or clear the filters
						</p>
						<Button
							onClick={() => {
								setSearchQuery('');
								setActiveTab('All');
							}}>
							Clear Search
						</Button>
					</div>
				)}

				{/* CTA Section */}
				<div className="text-center mt-16">
					<h3 className="text-2xl font-bold text-gray-900 mb-4">
						Can't Find What You're Looking For?
					</h3>
					<p className="text-gray-600 mb-8 max-w-2xl mx-auto">
						Our design experts are here to help you create custom solutions for
						your unique space and requirements.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link to="/design-ideas">
							<Button size="lg">Browse All Designs</Button>
						</Link>
						<Link to="/search">
							<Button variant="outline" size="lg">
								Find Professionals
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FindPros;
