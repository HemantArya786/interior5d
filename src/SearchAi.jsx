import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, searchAPI, vendorAPI } from './services/api';

const SearchAi = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState({
		products: [],
		vendors: [],
		suggestions: [],
	});
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('all');
	const [recentSearches, setRecentSearches] = useState([]);
	const navigate = useNavigate();

	// Load recent searches from localStorage
	useEffect(() => {
		const saved = localStorage.getItem('recentSearches');
		if (saved) {
			setRecentSearches(JSON.parse(saved));
		}
	}, []);

	// Save search to recent searches
	const saveSearch = (query) => {
		const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(
			0,
			10
		);
		setRecentSearches(updated);
		localStorage.setItem('recentSearches', JSON.stringify(updated));
	};

	// Perform search
	const handleSearch = async (query = searchQuery) => {
		if (!query.trim()) return;

		setLoading(true);
		try {
			saveSearch(query);

			// Parallel search requests
			const [vendorResults, productResults, suggestionsResults] =
				await Promise.allSettled([
					searchAPI.global({ q: query, limit: 20 }),
					vendorAPI.getAll({ search: query, limit: 10 }),
					productAPI.getAll({ search: query, limit: 15 }),
					searchAPI.suggestions(query),
				]);

			setSearchResults({
				products:
					productResults.status === 'fulfilled'
						? productResults.value.data.products || []
						: [],
				vendors:
					vendorResults.status === 'fulfilled'
						? vendorResults.value.data.vendors || []
						: [],
				suggestions:
					suggestionsResults.status === 'fulfilled'
						? suggestionsResults.value.data.suggestions || []
						: [],
			});
		} catch (error) {
			console.error('Search error:', error);
			// Fallback results
			setSearchResults({
				products: [
					{
						_id: '1',
						name: 'Modern Kitchen Design',
						shortDescription: 'Contemporary kitchen with sleek finishes',
						category: 'Kitchen',
						priceRange: { min: 50000, max: 150000 },
						thumbnailImage:
							'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg',
						vendorName: 'Elite Interiors',
					},
				],
				vendors: [
					{
						_id: '1',
						title: 'Elite Interiors',
						professionType: 'Interior Designer',
						location: { city: 'Mumbai', state: 'Maharashtra' },
						rating: 4.8,
						categories: ['Kitchen', 'Living Room'],
					},
				],
				suggestions: [
					{ text: 'modern kitchen design', type: 'product' },
					{ text: 'living room ideas', type: 'product' },
					{ text: 'interior designers near me', type: 'vendor' },
				],
			});
		} finally {
			setLoading(false);
		}
	};

	// Handle suggestion click
	const handleSuggestionClick = (suggestion) => {
		setSearchQuery(suggestion.text);
		handleSearch(suggestion.text);
	};

	// Clear recent searches
	const clearRecentSearches = () => {
		setRecentSearches([]);
		localStorage.removeItem('recentSearches');
	};

	const totalResults =
		searchResults.products.length + searchResults.vendors.length;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b">
				<div className="max-w-7xl mx-auto px-4 py-6">
					<h1 className="text-3xl font-bold text-gray-900 mb-6">Search</h1>

					{/* Search Bar */}
					<div className="relative max-w-2xl">
						<Input
							type="text"
							placeholder="Search for designs, vendors, or ideas..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
							className="pl-12 pr-4 py-3 text-lg"
						/>
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<i className="fas fa-search text-gray-400"></i>
						</div>
						<Button
							onClick={() => handleSearch()}
							disabled={loading}
							className="absolute right-2 top-1/2 transform -translate-y-1/2">
							{loading ? 'Searching...' : 'Search'}
						</Button>
					</div>

					{/* Recent Searches */}
					{recentSearches.length > 0 && !searchQuery && (
						<div className="mt-4">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-sm font-medium text-gray-700">
									Recent Searches
								</h3>
								<Button variant="ghost" size="sm" onClick={clearRecentSearches}>
									Clear All
								</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								{recentSearches.map((search, index) => (
									<Button
										key={index}
										variant="outline"
										size="sm"
										onClick={() => handleSuggestionClick({ text: search })}
										className="text-sm">
										<i className="fas fa-clock mr-1"></i>
										{search}
									</Button>
								))}
							</div>
						</div>
					)}

					{/* Search Suggestions */}
					{searchResults.suggestions.length > 0 && (
						<div className="mt-4">
							<h3 className="text-sm font-medium text-gray-700 mb-2">
								Suggestions
							</h3>
							<div className="flex flex-wrap gap-2">
								{searchResults.suggestions.map((suggestion, index) => (
									<Button
										key={index}
										variant="outline"
										size="sm"
										onClick={() => handleSuggestionClick(suggestion)}
										className="text-sm">
										<i
											className={`fas ${
												suggestion.type === 'vendor'
													? 'fa-user'
													: 'fa-lightbulb'
											} mr-1`}></i>
										{suggestion.text}
									</Button>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Results */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">Searching...</p>
					</div>
				) : totalResults > 0 ? (
					<>
						<div className="mb-6">
							<p className="text-gray-600">
								Found {totalResults} results for "{searchQuery}"
							</p>
						</div>

						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className="mb-6">
								<TabsTrigger value="all">All ({totalResults})</TabsTrigger>
								<TabsTrigger value="products">
									Designs ({searchResults.products.length})
								</TabsTrigger>
								<TabsTrigger value="vendors">
									Vendors ({searchResults.vendors.length})
								</TabsTrigger>
							</TabsList>

							<TabsContent value="all" className="space-y-8">
								{/* Products Section */}
								{searchResults.products.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-4">Design Ideas</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
											{searchResults.products.map((product) => (
												<Card
													key={product._id}
													className="overflow-hidden hover:shadow-lg transition-shadow">
													<div className="aspect-[4/3] bg-gray-200">
														<img
															src={product.thumbnailImage}
															alt={product.name}
															className="w-full h-full object-cover"
															onError={(e) => {
																e.target.src =
																	'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg';
															}}
														/>
													</div>
													<CardContent className="p-4">
														<h4 className="font-semibold mb-2">
															{product.name}
														</h4>
														<p className="text-sm text-gray-600 mb-2">
															{product.shortDescription}
														</p>
														<div className="flex justify-between items-center">
															<Badge variant="secondary">
																{product.category}
															</Badge>
															<span className="text-sm text-green-600 font-medium">
																₹{product.priceRange?.min?.toLocaleString()}+
															</span>
														</div>
													</CardContent>
												</Card>
											))}
										</div>
									</div>
								)}

								{/* Vendors Section */}
								{searchResults.vendors.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-4">Professionals</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{searchResults.vendors.map((vendor) => (
												<Card
													key={vendor._id}
													className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
													onClick={() => navigate(`/vendor/${vendor._id}`)}>
													<div className="flex items-center space-x-4">
														<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
															<i className="fas fa-user text-gray-500 text-xl"></i>
														</div>
														<div className="flex-1">
															<h4 className="font-semibold">{vendor.title}</h4>
															<p className="text-sm text-gray-600">
																{vendor.professionType}
															</p>
															<p className="text-sm text-gray-500">
																{vendor.location?.city},{' '}
																{vendor.location?.state}
															</p>
															<div className="flex items-center mt-1">
																<div className="flex text-yellow-400">
																	{[...Array(5)].map((_, i) => (
																		<i
																			key={i}
																			className={`fas fa-star ${
																				i < Math.floor(vendor.rating)
																					? ''
																					: 'text-gray-300'
																			}`}></i>
																	))}
																</div>
																<span className="ml-1 text-sm text-gray-600">
																	{vendor.rating}
																</span>
															</div>
														</div>
													</div>
													<div className="mt-4">
														<div className="flex flex-wrap gap-1">
															{vendor.categories
																?.slice(0, 3)
																.map((category, index) => (
																	<Badge
																		key={index}
																		variant="outline"
																		className="text-xs">
																		{category}
																	</Badge>
																))}
														</div>
													</div>
												</Card>
											))}
										</div>
									</div>
								)}
							</TabsContent>

							<TabsContent value="products">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
									{searchResults.products.map((product) => (
										<Card
											key={product._id}
											className="overflow-hidden hover:shadow-lg transition-shadow">
											<div className="aspect-[4/3] bg-gray-200">
												<img
													src={product.thumbnailImage}
													alt={product.name}
													className="w-full h-full object-cover"
													onError={(e) => {
														e.target.src =
															'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg';
													}}
												/>
											</div>
											<CardContent className="p-4">
												<h4 className="font-semibold mb-2">{product.name}</h4>
												<p className="text-sm text-gray-600 mb-2">
													{product.shortDescription}
												</p>
												<p className="text-sm text-gray-500 mb-2">
													by {product.vendorName}
												</p>
												<div className="flex justify-between items-center">
													<Badge variant="secondary">{product.category}</Badge>
													<span className="text-sm text-green-600 font-medium">
														₹{product.priceRange?.min?.toLocaleString()} - ₹
														{product.priceRange?.max?.toLocaleString()}
													</span>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</TabsContent>

							<TabsContent value="vendors">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{searchResults.vendors.map((vendor) => (
										<Card
											key={vendor._id}
											className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
											onClick={() => navigate(`/vendor/${vendor._id}`)}>
											<div className="flex items-center space-x-4">
												<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
													<i className="fas fa-user text-gray-500 text-xl"></i>
												</div>
												<div className="flex-1">
													<h4 className="font-semibold">{vendor.title}</h4>
													<p className="text-sm text-gray-600">
														{vendor.professionType}
													</p>
													<p className="text-sm text-gray-500">
														{vendor.location?.city}, {vendor.location?.state}
													</p>
													<div className="flex items-center mt-1">
														<div className="flex text-yellow-400">
															{[...Array(5)].map((_, i) => (
																<i
																	key={i}
																	className={`fas fa-star ${
																		i < Math.floor(vendor.rating)
																			? ''
																			: 'text-gray-300'
																	}`}></i>
															))}
														</div>
														<span className="ml-1 text-sm text-gray-600">
															{vendor.rating}
														</span>
													</div>
												</div>
											</div>
											<div className="mt-4">
												<div className="flex flex-wrap gap-1">
													{vendor.categories
														?.slice(0, 3)
														.map((category, index) => (
															<Badge
																key={index}
																variant="outline"
																className="text-xs">
																{category}
															</Badge>
														))}
												</div>
											</div>
										</Card>
									))}
								</div>
							</TabsContent>
						</Tabs>
					</>
				) : searchQuery ? (
					<div className="text-center py-12">
						<i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
						<h3 className="text-xl font-medium text-gray-900 mb-2">
							No results found
						</h3>
						<p className="text-gray-600 mb-6">
							Try different keywords or browse our categories
						</p>
						<div className="flex flex-wrap justify-center gap-2">
							{['Kitchen', 'Living Room', 'Bedroom', 'Bathroom'].map(
								(category) => (
									<Button
										key={category}
										variant="outline"
										onClick={() => handleSuggestionClick({ text: category })}>
										{category}
									</Button>
								)
							)}
						</div>
					</div>
				) : (
					<div className="text-center py-12">
						<i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
						<h3 className="text-xl font-medium text-gray-900 mb-2">
							Search for anything
						</h3>
						<p className="text-gray-600">
							Find designs, vendors, or get inspiration for your next project
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default SearchAi;
