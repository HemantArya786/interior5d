import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useVendors } from './hooks/useApi';
import { apiUtils, messageAPI } from './services/api';

const DesignIdeasPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [zipCode, setZipCode] = useState('');
	const [locationFilter, setLocationFilter] = useState(
		searchParams.get('location') || ''
	);
	const [messageModal, setMessageModal] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState(null);
	const [messageContent, setMessageContent] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedCategories, setSelectedCategories] = useState(
		searchParams.get('categories')
			? searchParams.get('categories').split(',')
			: []
	);
	const [selectedProfession, setSelectedProfession] = useState(
		searchParams.get('profession') || ''
	);
	const [sendingMessage, setSendingMessage] = useState(false);

	// API call with filters
	const vendorParams = {
		page: currentPage,
		limit: 10,
		city: locationFilter || undefined,
		professionType: selectedProfession || undefined,
		categories:
			selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
		zipcode: zipCode || undefined,
	};

	const {
		data: vendorsData,
		loading,
		error,
		refetch,
	} = useVendors(vendorParams);

	const serviceProviders = vendorsData?.vendors || [];
	const totalPages = vendorsData?.totalPages || 1;
	const totalResults = vendorsData?.total || 0;

	// Update URL params when filters change
	useEffect(() => {
		const params = new URLSearchParams();
		if (locationFilter) params.set('location', locationFilter);
		if (selectedProfession) params.set('profession', selectedProfession);
		if (selectedCategories.length > 0)
			params.set('categories', selectedCategories.join(','));
		setSearchParams(params);
	}, [locationFilter, selectedProfession, selectedCategories, setSearchParams]);

	const handleSendMessage = (providerId) => {
		const provider = serviceProviders.find((p) => p._id === providerId);
		setSelectedProvider(provider);
		setMessageModal(true);
	};

	const handleSubmitMessage = async () => {
		try {
			if (!apiUtils.isAuthenticated()) {
				alert('Please login to send messages');
				return;
			}

			setSendingMessage(true);
			const user = apiUtils.getCurrentUser();

			await messageAPI.send({
				vendorId: selectedProvider._id,
				message: messageContent,
				name: user?.name || 'Anonymous User',
				email: user?.email || '',
				phone: user?.phone || '',
			});

			alert('Message sent successfully!');
			setMessageContent('');
			setMessageModal(false);
		} catch (error) {
			console.error('Error sending message:', error);
			alert(error.response?.data?.message || 'Failed to send message');
		} finally {
			setSendingMessage(false);
		}
	};

	const handleCategoryFilter = (category) => {
		setSelectedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
		setCurrentPage(1);
	};

	const clearAllFilters = () => {
		setLocationFilter('');
		setSelectedProfession('');
		setSelectedCategories([]);
		setZipCode('');
		setCurrentPage(1);
		setSearchParams(new URLSearchParams());
	};

	const renderStars = (rating) => {
		const stars = [];
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;

		for (let i = 1; i <= 5; i++) {
			if (i <= fullStars) {
				stars.push(
					<span key={i} className="text-yellow-400">
						★
					</span>
				);
			} else if (i === fullStars + 1 && hasHalfStar) {
				stars.push(
					<span key={i} className="text-yellow-400">
						☆
					</span>
				);
			} else {
				stars.push(
					<span key={i} className="text-gray-300">
						★
					</span>
				);
			}
		}
		return stars;
	};

	const categories = [
		'Kitchen',
		'Living Room',
		'Bedroom',
		'Bathroom',
		'Office',
		'Dining Room',
		'Balcony',
		'Pooja Room',
	];

	const professionTypes = [
		'Interior Designer',
		'Architect',
		'Contractor',
		'Furniture Dealer',
		'Decorator',
	];

	if (loading && currentPage === 1) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Finding design professionals...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<h1 className="text-4xl md:text-6xl font-bold mb-4">
						Find Design Professionals
					</h1>
					<p className="text-xl text-indigo-100 max-w-2xl mx-auto">
						From modular kitchens to vastu-aligned interiors, our expert
						designers bring a perfect blend of tradition and modern design to
						your home.
					</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 py-6">
				{/* Error Display */}
				{error && (
					<div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
						<div className="flex justify-between items-center">
							<span>Error: {error}</span>
							<Button onClick={refetch} size="sm">
								Retry
							</Button>
						</div>
					</div>
				)}

				<div className="flex gap-8">
					{/* Sidebar Filters */}
					<div className="w-64 flex-shrink-0">
						<div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold">Filters</h3>
								<Button variant="ghost" size="sm" onClick={clearAllFilters}>
									Clear All
								</Button>
							</div>

							{/* Location Filter */}
							<div className="mb-6">
								<Label className="block text-sm font-medium text-gray-700 mb-2">
									Location
								</Label>
								<Input
									type="text"
									placeholder="Enter city name"
									value={locationFilter}
									onChange={(e) => {
										setLocationFilter(e.target.value);
										setCurrentPage(1);
									}}
								/>
							</div>

							<div className="mb-6">
								<Label className="block text-sm font-medium text-gray-700 mb-2">
									ZIP Code
								</Label>
								<Input
									type="text"
									placeholder="Enter ZIP code"
									value={zipCode}
									onChange={(e) => {
										setZipCode(e.target.value);
										setCurrentPage(1);
									}}
								/>
							</div>

							{/* Profession Type */}
							<div className="mb-6">
								<Label className="block text-sm font-medium text-gray-700 mb-2">
									Profession Type
								</Label>
								<RadioGroup
									value={selectedProfession}
									onValueChange={(value) => {
										setSelectedProfession(value);
										setCurrentPage(1);
									}}>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="" id="all-professions" />
										<Label htmlFor="all-professions">All</Label>
									</div>
									{professionTypes.map((type) => (
										<div key={type} className="flex items-center space-x-2">
											<RadioGroupItem value={type} id={type} />
											<Label htmlFor={type} className="text-sm">
												{type}
											</Label>
										</div>
									))}
								</RadioGroup>
							</div>

							{/* Categories */}
							<div className="mb-6">
								<Label className="block text-sm font-medium text-gray-700 mb-2">
									Specializations
								</Label>
								<div className="space-y-2 max-h-48 overflow-y-auto">
									{categories.map((category) => (
										<div key={category} className="flex items-center space-x-2">
											<Checkbox
												id={category}
												checked={selectedCategories.includes(category)}
												onCheckedChange={() => handleCategoryFilter(category)}
											/>
											<Label htmlFor={category} className="text-sm">
												{category}
											</Label>
										</div>
									))}
								</div>
							</div>

							{/* Active Filters Summary */}
							{(selectedCategories.length > 0 ||
								selectedProfession ||
								locationFilter) && (
								<div className="mb-4">
									<h4 className="text-sm font-medium text-gray-700 mb-2">
										Active Filters:
									</h4>
									<div className="space-y-1">
										{selectedProfession && (
											<div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
												{selectedProfession}
											</div>
										)}
										{locationFilter && (
											<div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
												📍 {locationFilter}
											</div>
										)}
										{selectedCategories.map((cat) => (
											<div
												key={cat}
												className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
												{cat}
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Main Content */}
					<div className="flex-1">
						{/* Results Header */}
						<div className="mb-6">
							<div className="flex justify-between items-center">
								<p className="text-sm text-gray-600">
									Found {totalResults.toLocaleString()} professionals
									{selectedCategories.length > 0 ||
									selectedProfession ||
									locationFilter
										? ' matching your criteria'
										: ''}
								</p>
								{loading && currentPage > 1 && (
									<div className="text-sm text-gray-500">Loading more...</div>
								)}
							</div>
						</div>

						{/* Service Providers */}
						<div className="space-y-6">
							{serviceProviders.length === 0 ? (
								<div className="text-center py-12">
									<div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
										<i className="fas fa-search text-2xl text-gray-400"></i>
									</div>
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										No professionals found
									</h3>
									<p className="text-gray-500 mb-4">
										Try adjusting your search criteria or location filters
									</p>
									<Button onClick={clearAllFilters}>Clear All Filters</Button>
								</div>
							) : (
								serviceProviders.map((provider) => (
									<div
										key={provider._id}
										className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
										<div className="flex items-start justify-between">
											<div className="flex space-x-4">
												<div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
													<img
														src={
															provider.images?.profileImage ||
															'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg'
														}
														alt={provider.name}
														className="w-full h-full object-cover"
														onError={(e) => {
															e.target.src =
																'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg';
														}}
													/>
												</div>
												<div className="flex-1">
													<h3 className="text-xl font-semibold text-gray-900">
														{provider.title}
													</h3>
													<p className="text-gray-600">{provider.name}</p>
													<p className="text-sm text-gray-500">
														{provider.professionType}
													</p>

													<div className="flex items-center mt-2">
														<div className="flex mr-2">
															{renderStars(provider.rating || 0)}
														</div>
														<span className="text-sm text-gray-600">
															{(provider.rating || 0).toFixed(1)} (
															{provider.reviewCount || 0} reviews)
														</span>
													</div>

													<p className="text-sm text-gray-600 mt-2">
														📍 {provider.location?.city},{' '}
														{provider.location?.state}
														{provider.location?.pincode &&
															` - ${provider.location.pincode}`}
													</p>

													<p className="text-gray-700 mt-3 line-clamp-2">
														{provider.about ||
															'Professional interior design services with years of experience.'}
													</p>

													<div className="flex flex-wrap gap-2 mt-3">
														{(provider.categories || [])
															.slice(0, 3)
															.map((category) => (
																<span
																	key={category}
																	className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
																	{category}
																</span>
															))}
														{(provider.categories || []).length > 3 && (
															<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
																+{(provider.categories || []).length - 3} more
															</span>
														)}
													</div>

													{/* Additional Info */}
													<div className="mt-3 text-sm text-gray-500">
														{provider.budgetLevel && (
															<span className="mr-4">
																💰 {provider.budgetLevel} Budget
															</span>
														)}
														{provider.languages &&
															provider.languages.length > 0 && (
																<span>
																	🗣️ {provider.languages.slice(0, 2).join(', ')}
																</span>
															)}
													</div>
												</div>
											</div>

											<div className="flex flex-col space-y-2">
												<Link to={`/vendor/${provider._id}`}>
													<Button variant="outline" className="w-full">
														View Profile
													</Button>
												</Link>
												<Button
													onClick={() => handleSendMessage(provider._id)}
													className="w-full">
													Send Message
												</Button>
											</div>
										</div>
									</div>
								))
							)}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex justify-center mt-8">
								<div className="flex gap-2">
									<Button
										variant="outline"
										disabled={currentPage === 1 || loading}
										onClick={() => setCurrentPage(currentPage - 1)}>
										Previous
									</Button>

									{[...Array(Math.min(totalPages, 5))].map((_, index) => {
										const pageNum = index + 1;
										return (
											<Button
												key={pageNum}
												variant={
													currentPage === pageNum ? 'default' : 'outline'
												}
												onClick={() => setCurrentPage(pageNum)}
												disabled={loading}>
												{pageNum}
											</Button>
										);
									})}

									<Button
										variant="outline"
										disabled={currentPage === totalPages || loading}
										onClick={() => setCurrentPage(currentPage + 1)}>
										Next
									</Button>
								</div>
							</div>
						)}

						{/* Load More Button (Alternative to pagination) */}
						{currentPage < totalPages && (
							<div className="text-center mt-6">
								<Button
									variant="outline"
									onClick={() => setCurrentPage(currentPage + 1)}
									disabled={loading}>
									{loading ? 'Loading...' : 'Load More Professionals'}
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Message Modal */}
			<Dialog open={messageModal} onOpenChange={setMessageModal}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Send Message to {selectedProvider?.title}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="bg-gray-50 p-3 rounded-lg">
							<p className="text-sm text-gray-600">
								💡 <strong>Tip:</strong> Be specific about your project
								requirements, budget range, and timeline to get better
								responses.
							</p>
						</div>
						<Textarea
							placeholder="Hi! I'm interested in your services for my [room type] project. My budget is around ₹[amount] and I'm looking to start in [timeframe]. Could you please share more details about your services and availability?"
							value={messageContent}
							onChange={(e) => setMessageContent(e.target.value)}
							rows={6}
						/>
						<div className="text-xs text-gray-500">
							Your contact information will be shared with the professional.
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setMessageModal(false);
								setMessageContent('');
							}}
							disabled={sendingMessage}>
							Cancel
						</Button>
						<Button
							onClick={handleSubmitMessage}
							disabled={!messageContent.trim() || sendingMessage}>
							{sendingMessage ? 'Sending...' : 'Send Message'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default DesignIdeasPage;
