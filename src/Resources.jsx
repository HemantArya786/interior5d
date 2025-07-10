import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useEffect, useState } from 'react';
import { productAPI, searchAPI } from './services/api';

const Resources = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [activeTab, setActiveTab] = useState('all');
	// const [selectedResource, setSelectedResource] = useState(null);
	const [resources, setResources] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedFilters, setSelectedFilters] = useState({
		types: [],
		categories: [],
		difficulties: [],
	});
	const [sortOption, setSortOption] = useState('newest');
	const [viewMode, setViewMode] = useState('grid');

	// Fetch resources from backend
	useEffect(() => {
		const fetchResources = async () => {
			try {
				setLoading(true);
				setError(null);

				// Try to fetch from search API or products API
				const searchParams = {
					q: searchQuery || undefined,
					type: activeTab !== 'all' ? activeTab : undefined,
					category:
						selectedFilters.categories.length > 0
							? selectedFilters.categories
							: undefined,
					difficulty:
						selectedFilters.difficulties.length > 0
							? selectedFilters.difficulties
							: undefined,
					sort: sortOption,
				};

				let response;
				try {
					response = await searchAPI.global(searchParams);
				} catch (searchError) {
					// Fallback to products API if search fails
					response = await productAPI.getAll(searchParams);
				}

				if (response.data) {
					// Transform backend data to resources format
					const transformedResources = (
						response.data.products ||
						response.data.results ||
						[]
					).map((item) => ({
						id: item._id,
						title: item.name || item.title || 'Resource',
						description:
							item.shortDescription ||
							item.description ||
							'No description available',
						type: item.type || 'article',
						category: item.category || 'General',
						author: item.vendorName || item.author || 'Unknown',
						date: new Date(item.createdAt).toLocaleDateString(),
						imageUrl:
							item.thumbnailImage ||
							'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg',
						views: item.views || Math.floor(Math.random() * 5000) + 1000,
						downloads: item.downloads || Math.floor(Math.random() * 1000) + 100,
						difficulty: item.difficulty || 'intermediate',
						tags: item.tags || ['design', 'interior'],
						content:
							item.fullDescription ||
							item.description ||
							'Content not available',
						videoUrl: item.videoUrl,
						downloadUrl: item.downloadUrl,
						forumUrl: item.forumUrl,
					}));

					setResources(transformedResources);
				}
			} catch (err) {
				console.error('Error fetching resources:', err);
				setError('Failed to load resources');

				// Fallback to static resources
				setResources([
					{
						id: 1,
						title: 'Color Theory for Interior Design',
						description:
							'Learn how color psychology affects interior spaces and how to create harmonious color schemes for different rooms.',
						type: 'article',
						category: 'Design Fundamentals',
						author: 'Emma Wilson',
						date: 'June 10, 2025',
						imageUrl:
							'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg',
						views: 3452,
						difficulty: 'beginner',
						tags: ['color theory', 'psychology', 'palettes'],
						content:
							'Color theory is the foundation of creating harmonious interior spaces...',
					},
					{
						id: 2,
						title: 'Furniture Arrangement Principles',
						description:
							'Master the art of furniture placement with these essential principles for balance, flow, and functionality.',
						type: 'article',
						category: 'Space Planning',
						author: 'Michael Chen',
						date: 'June 5, 2025',
						imageUrl:
							'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
						views: 2187,
						difficulty: 'intermediate',
						tags: ['furniture', 'layout', 'space planning'],
						content:
							'The arrangement of furniture can make or break an interior space...',
					},
					{
						id: 3,
						title: 'Lighting Design Masterclass',
						description:
							'Comprehensive video tutorial on creating layered lighting designs for residential spaces.',
						type: 'video',
						category: 'Lighting',
						author: 'Sarah Johnson',
						date: 'May 28, 2025',
						imageUrl:
							'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg',
						views: 5621,
						difficulty: 'intermediate',
						tags: ['lighting', 'ambience', 'fixtures'],
						videoUrl: 'https://example.com/videos/lighting-masterclass',
					},
				]);
			} finally {
				setLoading(false);
			}
		};

		fetchResources();
	}, [searchQuery, activeTab, selectedFilters, sortOption]);

	// Filter resources based on active tab, search query, and filters
	const filteredResources = resources.filter((resource) => {
		if (activeTab !== 'all' && resource.type !== activeTab) return false;
		if (
			searchQuery &&
			!resource.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
			!resource.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
			!resource.category.toLowerCase().includes(searchQuery.toLowerCase())
		)
			return false;
		if (
			selectedFilters.types.length > 0 &&
			!selectedFilters.types.includes(resource.type)
		)
			return false;
		if (
			selectedFilters.categories.length > 0 &&
			!selectedFilters.categories.includes(resource.category)
		)
			return false;
		if (
			selectedFilters.difficulties.length > 0 &&
			!selectedFilters.difficulties.includes(resource.difficulty)
		)
			return false;
		return true;
	});

	// Sort resources
	const sortedResources = [...filteredResources].sort((a, b) => {
		switch (sortOption) {
			case 'newest':
				return new Date(b.date).getTime() - new Date(a.date).getTime();
			case 'oldest':
				return new Date(a.date).getTime() - new Date(b.date).getTime();
			case 'popular':
				return b.views - a.views;
			case 'az':
				return a.title.localeCompare(b.title);
			case 'za':
				return b.title.localeCompare(a.title);
			default:
				return 0;
		}
	});

	const handleTypeFilter = (type) => {
		setSelectedFilters((prev) => ({
			...prev,
			types: prev.types.includes(type)
				? prev.types.filter((t) => t !== type)
				: [...prev.types, type],
		}));
	};

	const handleCategoryFilter = (category) => {
		setSelectedFilters((prev) => ({
			...prev,
			categories: prev.categories.includes(category)
				? prev.categories.filter((c) => c !== category)
				: [...prev.categories, category],
		}));
	};

	const handleDifficultyFilter = (difficulty) => {
		setSelectedFilters((prev) => ({
			...prev,
			difficulties: prev.difficulties.includes(difficulty)
				? prev.difficulties.filter((d) => d !== difficulty)
				: [...prev.difficulties, difficulty],
		}));
	};

	const clearFilters = () => {
		setSelectedFilters({
			types: [],
			categories: [],
			difficulties: [],
		});
		setSearchQuery('');
		setSortOption('newest');
	};

	const categories = Array.from(
		new Set(resources.map((resource) => resource.category))
	);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading resources...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 z-0">
					<div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-indigo-700/70 z-10"></div>
					<img
						src="https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg"
						alt="Design Resources"
						className="w-full h-full object-cover object-top"
					/>
				</div>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="py-20 md:py-28 lg:py-32 max-w-3xl">
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
							Design Resources
						</h1>
						<p className="text-xl text-indigo-100 mb-8">
							Explore our curated collection of guides, tutorials, templates,
							and community discussions to elevate your interior design skills
							and projects.
						</p>
						<div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
							<div className="relative">
								<Input
									type="text"
									placeholder="Search for resources, topics, or categories..."
									className="pl-10 pr-4 py-3 bg-white/90 border-none text-gray-800 placeholder-gray-500 w-full text-sm"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
								<i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Error Display */}
			{error && (
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
						<p className="font-semibold">Note:</p>
						<p>
							Backend connection unavailable. Showing sample resources. {error}
						</p>
					</div>
				</div>
			)}

			{/* Category Tabs */}
			<section className="bg-white border-b border-gray-200 sticky top-0 z-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<Tabs
						defaultValue="all"
						className="w-full"
						onValueChange={setActiveTab}>
						<div className="overflow-x-auto">
							<TabsList className="h-16 bg-transparent border-b-0 justify-start">
								<TabsTrigger
									value="all"
									className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-6">
									All Resources
								</TabsTrigger>
								<TabsTrigger
									value="article"
									className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-6">
									<i className="fas fa-book-open mr-2"></i> Articles & Guides
								</TabsTrigger>
								<TabsTrigger
									value="video"
									className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-6">
									<i className="fas fa-video mr-2"></i> Video Tutorials
								</TabsTrigger>
								<TabsTrigger
									value="template"
									className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-6">
									<i className="fas fa-file-alt mr-2"></i> Templates & Downloads
								</TabsTrigger>
								<TabsTrigger
									value="forum"
									className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-6">
									<i className="fas fa-comments mr-2"></i> Community Forum
								</TabsTrigger>
							</TabsList>
						</div>
					</Tabs>
				</div>
			</section>

			{/* Main Content */}
			<section className="py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-8">
						{/* Filters Sidebar */}
						<div className="lg:w-1/4">
							<div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
								<div className="flex justify-between items-center mb-6">
									<h3 className="text-lg font-bold text-gray-900">Filters</h3>
									<Button
										variant="ghost"
										className="text-sm text-indigo-600 hover:text-indigo-800 p-0 h-auto"
										onClick={clearFilters}>
										Clear All
									</Button>
								</div>

								{/* Resource Type Filter */}
								<div className="mb-6">
									<h4 className="text-sm font-medium text-gray-900 mb-3">
										Resource Type
									</h4>
									<div className="space-y-2">
										{['article', 'video', 'template', 'forum'].map((type) => (
											<div key={type} className="flex items-center">
												<Checkbox
													id={type}
													checked={selectedFilters.types.includes(type)}
													onCheckedChange={() => handleTypeFilter(type)}
												/>
												<label
													htmlFor={type}
													className="ml-2 text-sm text-gray-600 cursor-pointer">
													{type.charAt(0).toUpperCase() + type.slice(1)}
												</label>
											</div>
										))}
									</div>
								</div>

								{/* Categories Filter */}
								<div className="mb-6">
									<h4 className="text-sm font-medium text-gray-900 mb-3">
										Categories
									</h4>
									<div className="space-y-2 max-h-48 overflow-y-auto pr-2">
										{categories.map((category, index) => (
											<div key={index} className="flex items-center">
												<Checkbox
													id={`category-${index}`}
													checked={selectedFilters.categories.includes(
														category
													)}
													onCheckedChange={() => handleCategoryFilter(category)}
												/>
												<label
													htmlFor={`category-${index}`}
													className="ml-2 text-sm text-gray-600 cursor-pointer">
													{category}
												</label>
											</div>
										))}
									</div>
								</div>

								{/* Difficulty Level Filter */}
								<div className="mb-6">
									<h4 className="text-sm font-medium text-gray-900 mb-3">
										Difficulty Level
									</h4>
									<div className="space-y-2">
										{['beginner', 'intermediate', 'advanced'].map(
											(difficulty) => (
												<div key={difficulty} className="flex items-center">
													<Checkbox
														id={difficulty}
														checked={selectedFilters.difficulties.includes(
															difficulty
														)}
														onCheckedChange={() =>
															handleDifficultyFilter(difficulty)
														}
													/>
													<label
														htmlFor={difficulty}
														className="ml-2 text-sm text-gray-600 cursor-pointer">
														{difficulty.charAt(0).toUpperCase() +
															difficulty.slice(1)}
													</label>
												</div>
											)
										)}
									</div>
								</div>

								{/* Popular Tags */}
								<div>
									<h4 className="text-sm font-medium text-gray-900 mb-3">
										Popular Tags
									</h4>
									<div className="flex flex-wrap gap-2">
										{[
											'color theory',
											'space planning',
											'lighting',
											'materials',
											'sustainability',
											'business',
											'trends',
											'renovation',
										].map((tag, index) => (
											<Badge
												key={index}
												variant="outline"
												className="bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer">
												{tag}
											</Badge>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Resources Grid */}
						<div className="lg:w-3/4">
							{/* Sort and View Options */}
							<div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-center">
								<div className="flex items-center mb-4 sm:mb-0">
									<span className="text-sm text-gray-500 mr-2">Sort by:</span>
									<Select value={sortOption} onValueChange={setSortOption}>
										<SelectTrigger className="w-[180px] h-9 text-sm">
											<SelectValue placeholder="Sort by" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="newest">Newest First</SelectItem>
											<SelectItem value="oldest">Oldest First</SelectItem>
											<SelectItem value="popular">Most Popular</SelectItem>
											<SelectItem value="az">A-Z</SelectItem>
											<SelectItem value="za">Z-A</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center space-x-2">
									<span className="text-sm text-gray-500">View:</span>
									<Button
										variant={viewMode === 'grid' ? 'default' : 'outline'}
										size="icon"
										className="h-9 w-9"
										onClick={() => setViewMode('grid')}>
										<i className="fas fa-th-large"></i>
									</Button>
									<Button
										variant={viewMode === 'list' ? 'default' : 'outline'}
										size="icon"
										className="h-9 w-9"
										onClick={() => setViewMode('list')}>
										<i className="fas fa-list"></i>
									</Button>
								</div>
							</div>

							{/* Results Count */}
							<div className="mb-6">
								<p className="text-sm text-gray-500">
									Showing{' '}
									<span className="font-medium">{sortedResources.length}</span>{' '}
									resources
									{activeTab !== 'all' && ` in ${activeTab}s`}
									{selectedFilters.categories.length > 0 &&
										` for ${selectedFilters.categories.join(', ')}`}
								</p>
							</div>

							{/* Resources Grid/List */}
							{sortedResources.length === 0 ? (
								<div className="bg-white rounded-lg shadow-sm p-12 text-center">
									<i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
									<h3 className="text-xl font-medium text-gray-900 mb-2">
										No resources found
									</h3>
									<p className="text-gray-500 mb-6">
										Try adjusting your filters or search criteria
									</p>
									<Button
										onClick={clearFilters}
										className="bg-indigo-600 hover:bg-indigo-700 text-white">
										Clear Filters
									</Button>
								</div>
							) : (
								<div
									className={
										viewMode === 'grid'
											? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
											: 'space-y-6'
									}>
									{sortedResources.map((resource) => (
										<Card
											key={resource.id}
											className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
											<div className="relative h-48 overflow-hidden group">
												<img
													src={resource.imageUrl}
													alt={resource.title}
													className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
													onError={(e) => {
														e.target.src =
															'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg';
													}}
												/>
												<div className="absolute top-0 left-0 m-3">
													<Badge
														className={`${
															resource.type === 'article'
																? 'bg-blue-500'
																: resource.type === 'video'
																? 'bg-red-500'
																: resource.type === 'template'
																? 'bg-green-500'
																: 'bg-purple-500'
														} text-white`}>
														{resource.type === 'article' ? (
															<i className="fas fa-book-open mr-1"></i>
														) : resource.type === 'video' ? (
															<i className="fas fa-video mr-1"></i>
														) : resource.type === 'template' ? (
															<i className="fas fa-file-alt mr-1"></i>
														) : (
															<i className="fas fa-comments mr-1"></i>
														)}
														{resource.type.charAt(0).toUpperCase() +
															resource.type.slice(1)}
													</Badge>
												</div>
												<div className="absolute bottom-0 right-0 m-3">
													<Badge className="bg-gray-800/70 text-white">
														{resource.difficulty}
													</Badge>
												</div>
											</div>
											<CardContent className="p-6 flex-grow">
												<div className="flex justify-between items-start mb-2">
													<Badge
														variant="outline"
														className="bg-gray-100 text-gray-800">
														{resource.category}
													</Badge>
													<span className="text-xs text-gray-500">
														{resource.date}
													</span>
												</div>
												<h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
													{resource.title}
												</h3>
												<p className="text-gray-600 mb-4 line-clamp-3">
													{resource.description}
												</p>
												<div className="flex items-center justify-between text-sm text-gray-500 mb-4">
													<span>By {resource.author}</span>
													<div className="flex items-center space-x-4">
														<span className="flex items-center">
															<i className="fas fa-eye mr-1"></i>
															{resource.views.toLocaleString()}
														</span>
														{resource.downloads && (
															<span className="flex items-center">
																<i className="fas fa-download mr-1"></i>
																{resource.downloads.toLocaleString()}
															</span>
														)}
													</div>
												</div>
												<div className="flex flex-wrap gap-1 mb-4">
													{resource.tags.slice(0, 3).map((tag, index) => (
														<Badge
															key={index}
															variant="secondary"
															className="text-xs">
															{tag}
														</Badge>
													))}
												</div>
											</CardContent>
											<CardFooter className="p-6 pt-0">
												<Dialog>
													<DialogTrigger asChild>
														<Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
															{resource.type === 'video'
																? 'Watch Video'
																: resource.type === 'template'
																? 'Download Template'
																: resource.type === 'forum'
																? 'Join Discussion'
																: 'Read Article'}
														</Button>
													</DialogTrigger>
													<DialogContent className="max-w-2xl">
														<DialogHeader>
															<DialogTitle>{resource.title}</DialogTitle>
															<DialogDescription>
																By {resource.author} • {resource.category} •{' '}
																{resource.difficulty}
															</DialogDescription>
														</DialogHeader>
														<div className="space-y-4">
															<img
																src={resource.imageUrl}
																alt={resource.title}
																className="w-full h-48 object-cover rounded-lg"
															/>
															<p className="text-gray-700">
																{resource.content}
															</p>
															<div className="flex justify-between items-center">
																<div className="flex items-center space-x-4 text-sm text-gray-500">
																	<span>
																		<i className="fas fa-eye mr-1"></i>{' '}
																		{resource.views.toLocaleString()}
																	</span>
																	{resource.downloads && (
																		<span>
																			<i className="fas fa-download mr-1"></i>{' '}
																			{resource.downloads.toLocaleString()}
																		</span>
																	)}
																</div>
																<div className="flex gap-2">
																	{resource.videoUrl && (
																		<Button
																			onClick={() =>
																				window.open(resource.videoUrl, '_blank')
																			}>
																			<i className="fas fa-play mr-1"></i> Watch
																		</Button>
																	)}
																	{resource.downloadUrl && (
																		<Button
																			onClick={() =>
																				window.open(
																					resource.downloadUrl,
																					'_blank'
																				)
																			}>
																			<i className="fas fa-download mr-1"></i>{' '}
																			Download
																		</Button>
																	)}
																	{resource.forumUrl && (
																		<Button
																			onClick={() =>
																				window.open(resource.forumUrl, '_blank')
																			}>
																			<i className="fas fa-comments mr-1"></i>{' '}
																			Discuss
																		</Button>
																	)}
																</div>
															</div>
														</div>
													</DialogContent>
												</Dialog>
											</CardFooter>
										</Card>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Resources;
