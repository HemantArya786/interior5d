import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import React, { useState } from 'react';
import { useProducts, useToggleFavorite } from './hooks/useApi';
import { apiUtils } from './services/api';

const Ideas = () => {
	const [activeCategory, setActiveCategory] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedProject, setSelectedProject] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [budgetRange, setBudgetRange] = useState([0, 200000]);

	// API call with filters
	const apiParams = {
		page: currentPage,
		limit: 12,
		category: activeCategory !== 'all' ? activeCategory : undefined,
		search: searchQuery || undefined,
		priceMin: budgetRange[0],
		priceMax: budgetRange[1],
	};

	const {
		data: productsData,
		loading,
		error,
		refetch,
	} = useProducts(apiParams);
	const { toggleFavorite, loading: favoriteLoading } = useToggleFavorite();

	const projects = productsData?.products || [];
	const totalPages = productsData?.totalPages || 1;
	const total = productsData?.total || 0;

	const handleAddToFavorites = async (productId) => {
		try {
			if (!apiUtils.isAuthenticated()) {
				alert('Please login to add favorites');
				return;
			}

			await toggleFavorite(productId, false);
			alert('Added to favorites!');
		} catch (error) {
			console.error('Error adding to favorites:', error);
			alert(error.response?.data?.message || 'Failed to add to favorites');
		}
	};

	const handleSearch = (e) => {
		e.preventDefault();
		setCurrentPage(1);
		refetch();
	};

	const clearFilters = () => {
		setBudgetRange([0, 200000]);
		setSearchQuery('');
		setActiveCategory('all');
		setCurrentPage(1);
	};

	if (loading && currentPage === 1) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading design ideas...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<h1 className="text-4xl md:text-6xl font-bold mb-4">Design Ideas</h1>
					<p className="text-xl text-blue-100 max-w-2xl mx-auto">
						Explore our curated collection of stunning interior designs created
						with DesignVerse. Get inspired for your next project.
					</p>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Error Display */}
				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
						<p className="font-semibold">Error:</p>
						<p>{error}</p>
					</div>
				)}

				<div className="flex gap-8">
					{/* Sidebar Filters */}
					<div className="w-64 flex-shrink-0">
						<div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold">Filters</h3>
								<Button variant="ghost" size="sm" onClick={clearFilters}>
									Clear All
								</Button>
							</div>

							{/* Search */}
							<div className="mb-6">
								<form onSubmit={handleSearch}>
									<Input
										type="text"
										placeholder="Search designs..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="mb-2"
									/>
									<Button type="submit" size="sm" className="w-full">
										Search
									</Button>
								</form>
							</div>

							{/* Categories */}
							<div className="mb-6">
								<h4 className="font-medium mb-3">Categories</h4>
								<div className="space-y-2">
									{[
										'all',
										'Kitchen',
										'Living Room',
										'Bedroom',
										'Bathroom',
										'Office',
									].map((category) => (
										<Button
											key={category}
											variant={
												activeCategory === category ? 'default' : 'ghost'
											}
											onClick={() => {
												setActiveCategory(category);
												setCurrentPage(1);
											}}
											className="w-full justify-start text-sm">
											{category === 'all' ? 'All' : category}
										</Button>
									))}
								</div>
							</div>

							{/* Budget Range */}
							<div className="mb-6">
								<h4 className="font-medium mb-3">Budget Range</h4>
								<Slider
									value={budgetRange}
									onValueChange={setBudgetRange}
									max={500000}
									min={0}
									step={5000}
									className="mb-2"
								/>
								<div className="flex justify-between text-sm text-gray-600">
									<span>₹{budgetRange[0].toLocaleString()}</span>
									<span>₹{budgetRange[1].toLocaleString()}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Main Content */}
					<div className="flex-1">
						{/* Results Info */}
						<div className="mb-6">
							<p className="text-sm text-gray-600">
								Showing {(currentPage - 1) * 12 + 1} to{' '}
								{Math.min(currentPage * 12, total)} of {total} results
							</p>
						</div>

						{/* Projects Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{projects.map((project) => (
								<Card
									key={project._id}
									className="overflow-hidden hover:shadow-lg transition-shadow">
									<div className="aspect-[4/3] bg-gray-200">
										<img
											src={
												project.thumbnailImage ||
												'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg'
											}
											alt={project.name}
											className="w-full h-full object-cover"
											onError={(e) => {
												e.target.src =
													'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg';
											}}
										/>
									</div>
									<CardContent className="p-4">
										<h3 className="font-semibold text-lg mb-2 line-clamp-1">
											{project.name}
										</h3>
										<p className="text-gray-600 text-sm mb-2">
											by {project.vendorName}
										</p>
										<p className="text-gray-500 text-sm mb-3 line-clamp-2">
											{project.shortDescription}
										</p>
										<div className="flex justify-between items-center">
											<span className="text-green-600 font-semibold text-sm">
												₹{project.priceRange?.min?.toLocaleString()} - ₹
												{project.priceRange?.max?.toLocaleString()}
											</span>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleAddToFavorites(project._id)}
													disabled={favoriteLoading}>
													♡
												</Button>
												<Dialog>
													<DialogTrigger asChild>
														<Button
															size="sm"
															onClick={() => setSelectedProject(project)}>
															View
														</Button>
													</DialogTrigger>
													<DialogContent className="max-w-2xl">
														<DialogHeader>
															<DialogTitle>{selectedProject?.name}</DialogTitle>
															<DialogDescription>
																by {selectedProject?.vendorName}
															</DialogDescription>
														</DialogHeader>
														{selectedProject && (
															<div className="space-y-4">
																<img
																	src={selectedProject.thumbnailImage}
																	alt={selectedProject.name}
																	className="w-full h-64 object-cover rounded-lg"
																/>
																<p className="text-gray-700">
																	{selectedProject.shortDescription}
																</p>
																<div className="flex justify-between items-center">
																	<span className="text-lg font-semibold text-green-600">
																		₹
																		{selectedProject.priceRange?.min?.toLocaleString()}{' '}
																		- ₹
																		{selectedProject.priceRange?.max?.toLocaleString()}
																	</span>
																	<Button
																		onClick={() =>
																			handleAddToFavorites(selectedProject._id)
																		}>
																		Add to Favorites
																	</Button>
																</div>
															</div>
														)}
													</DialogContent>
												</Dialog>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex justify-center mt-8">
								<div className="flex gap-2">
									<Button
										variant="outline"
										disabled={currentPage === 1}
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
												onClick={() => setCurrentPage(pageNum)}>
												{pageNum}
											</Button>
										);
									})}

									<Button
										variant="outline"
										disabled={currentPage === totalPages}
										onClick={() => setCurrentPage(currentPage + 1)}>
										Next
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Ideas;
