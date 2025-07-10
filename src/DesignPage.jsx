import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useProducts, useToggleFavorite } from './hooks/useApi';
import { apiUtils, userAPI } from './services/api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const DesignPage = () => {
	const [searchParams] = useSearchParams();
	const [activeFilters, setActiveFilters] = useState([]);
	const [priceRange, setPriceRange] = useState([500, 25000]);
	const [selectedDesign, setSelectedDesign] = useState(null);
	const [savedDesigns, setSavedDesigns] = useState([]);
	// const [loading, setLoading] = useState(true);
	// const [error, setError] = useState(null);
	const [sortOption, setSortOption] = useState('newest');
	const [currentPage, setCurrentPage] = useState(1);

	// const swiperModules = [Pagination, Autoplay];
	const categoryName = searchParams.get('category') || 'Kitchen';

	// API Integration
	const apiParams = {
		page: currentPage,
		limit: 12,
		category: categoryName,
		style: activeFilters.filter((f) => styles.includes(f)),
		roomSize: activeFilters.filter((f) => roomSizes.includes(f)),
		colorScheme: activeFilters.filter((f) => colorSchemes.includes(f)),
		priceMin: priceRange[0],
		priceMax: priceRange[1],
		sort: sortOption,
	};

	const {
		data: productsData,
		loading: productsLoading,
		error: productsError,
	} = useProducts(apiParams);
	const { toggleFavorite, loading: favoriteLoading } = useToggleFavorite();

	const designs = productsData?.products || [];
	const totalPages = productsData?.totalPages || 1;

	// Load user favorites
	useEffect(() => {
		const loadFavorites = async () => {
			if (apiUtils.isAuthenticated()) {
				try {
					const response = await userAPI.getFavorites();
					setSavedDesigns(response.data.favorites?.map((f) => f._id) || []);
				} catch (error) {
					console.error('Error loading favorites:', error);
				}
			}
		};
		loadFavorites();
	}, []);

	// Filter and sort options
	const styles = [
		'Modern',
		'Traditional',
		'Contemporary',
		'Minimalist',
		'Industrial',
		'Scandinavian',
	];

	const roomSizes = ['Small', 'Medium', 'Large', 'Open Concept'];
	const colorSchemes = ['Neutral', 'Warm', 'Cool', 'Monochromatic', 'Colorful'];
	const sortOptions = [
		{ value: 'newest', label: 'Latest' },
		{ value: 'popular', label: 'Popular' },
		{ value: 'price_low', label: 'Price: Low to High' },
		{ value: 'price_high', label: 'Price: High to Low' },
		{ value: 'rating', label: 'Highest Rated' },
	];

	const toggleFilter = (filter) => {
		if (activeFilters.includes(filter)) {
			setActiveFilters(activeFilters.filter((f) => f !== filter));
		} else {
			setActiveFilters([...activeFilters, filter]);
		}
		setCurrentPage(1);
	};

	const toggleSaveDesign = async (id, event) => {
		event.stopPropagation();

		if (!apiUtils.isAuthenticated()) {
			alert('Please login to save designs');
			return;
		}

		try {
			const isFavorite = savedDesigns.includes(id);
			await toggleFavorite(id, isFavorite);

			if (isFavorite) {
				setSavedDesigns(savedDesigns.filter((designId) => designId !== id));
			} else {
				setSavedDesigns([...savedDesigns, id]);
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
			alert('Failed to update favorites');
		}
	};

	const openDesignDetail = (design) => {
		setSelectedDesign(design);
	};

	// Transform backend data to match component structure
	const transformedDesigns = designs.map((product) => ({
		id: product._id,
		title: product.name,
		designer: product.vendorName || 'Professional Designer',
		description:
			product.shortDescription ||
			product.description ||
			'Beautiful interior design',
		priceRange: `₹${product.priceRange?.min?.toLocaleString()} - ₹${product.priceRange?.max?.toLocaleString()}`,
		dimensions: product.dimensions
			? `${product.dimensions.length}' x ${product.dimensions.width}'`
			: "12' x 14'",
		style: product.style || product.category || 'Modern',
		rating: product.rating || 4.5,
		features: product.features || [
			'Custom design',
			'Premium materials',
			'Professional installation',
			'Quality guarantee',
		],
		imageUrl:
			product.thumbnailImage ||
			'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg',
	}));

	// Fallback designs if no backend data
	const fallbackDesigns = [
		{
			id: 1,
			title: 'Modern Elegance Kitchen',
			designer: 'Elena Designs',
			description:
				'A sleek, modern kitchen with high-end appliances and minimalist cabinetry, perfect for contemporary homes.',
			priceRange: '₹8,00,000 - ₹12,00,000',
			dimensions: "15' x 18'",
			style: 'Modern',
			rating: 4.8,
			features: [
				'Custom cabinetry',
				'Marble countertops',
				'Smart appliances',
				'Island with seating',
			],
			imageUrl:
				'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg',
		},
		{
			id: 2,
			title: 'Rustic Farmhouse Kitchen',
			designer: 'Countryside Interiors',
			description:
				'A warm, inviting kitchen with rustic elements and modern functionality, ideal for family gatherings.',
			priceRange: '₹6,50,000 - ₹9,00,000',
			dimensions: "14' x 16'",
			style: 'Traditional',
			rating: 4.6,
			features: [
				'Farmhouse sink',
				'Butcher block island',
				'Open shelving',
				'Vintage fixtures',
			],
			imageUrl:
				'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
		},
	];

	const displayDesigns =
		transformedDesigns.length > 0 ? transformedDesigns : fallbackDesigns;

	if (productsLoading && currentPage === 1) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading {categoryName} designs...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-[1024px] bg-gray-50">
			<div className="max-w-[1440px] mx-auto px-8 py-12">
				{/* Error Display */}
				{productsError && (
					<div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
						<p className="font-semibold">Notice:</p>
						<p>
							Backend connection unavailable. Showing sample designs.{' '}
							{productsError}
						</p>
					</div>
				)}

				{/* Hero Banner */}
				<div className="relative h-[400px] mb-16 rounded-2xl overflow-hidden">
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{
							backgroundImage: `url('https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg')`,
						}}></div>
					<div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent"></div>
					<div className="relative h-full flex items-center">
						<div className="text-white max-w-xl px-12">
							<h2 className="text-4xl font-bold mb-4 font-serif">
								Transform Your {categoryName}
							</h2>
							<p className="text-lg mb-6">
								Discover how our expert designers can help you create the
								perfect {categoryName.toLowerCase()} that combines style,
								functionality, and your personal taste.
							</p>
							<Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 !rounded-button cursor-pointer whitespace-nowrap">
								Get a Custom Design
							</Button>
						</div>
					</div>
				</div>

				{/* Filtering Section */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-10">
					<div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
						<div className="flex flex-wrap gap-4">
							<div className="w-full md:w-auto">
								<p className="text-sm font-medium text-gray-700 mb-2">Style</p>
								<div className="flex flex-wrap gap-2">
									{styles.map((style) => (
										<Badge
											key={style}
											variant={
												activeFilters.includes(style) ? 'default' : 'outline'
											}
											className={`cursor-pointer ${
												activeFilters.includes(style)
													? 'bg-blue-600'
													: 'hover:bg-gray-100'
											}`}
											onClick={() => toggleFilter(style)}>
											{style}
										</Badge>
									))}
								</div>
							</div>

							<div className="w-full md:w-auto">
								<p className="text-sm font-medium text-gray-700 mb-2">
									Room Size
								</p>
								<div className="flex flex-wrap gap-2">
									{roomSizes.map((size) => (
										<Badge
											key={size}
											variant={
												activeFilters.includes(size) ? 'default' : 'outline'
											}
											className={`cursor-pointer ${
												activeFilters.includes(size)
													? 'bg-blue-600'
													: 'hover:bg-gray-100'
											}`}
											onClick={() => toggleFilter(size)}>
											{size}
										</Badge>
									))}
								</div>
							</div>

							<div className="w-full md:w-auto">
								<p className="text-sm font-medium text-gray-700 mb-2">
									Color Scheme
								</p>
								<div className="flex flex-wrap gap-2">
									{colorSchemes.map((color) => (
										<Badge
											key={color}
											variant={
												activeFilters.includes(color) ? 'default' : 'outline'
											}
											className={`cursor-pointer ${
												activeFilters.includes(color)
													? 'bg-blue-600'
													: 'hover:bg-gray-100'
											}`}
											onClick={() => toggleFilter(color)}>
											{color}
										</Badge>
									))}
								</div>
							</div>
						</div>

						<div className="w-full lg:w-64">
							<p className="text-sm font-medium text-gray-700 mb-2">Sort By</p>
							<select
								className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer"
								value={sortOption}
								onChange={(e) => setSortOption(e.target.value)}>
								{sortOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="border-t border-gray-200 pt-6">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
							<div>
								<p className="text-sm font-medium text-gray-700 mb-2">
									Price Range
								</p>
								<div className="w-full md:w-80">
									<Slider
										defaultValue={[500, 25000]}
										max={50000}
										min={500}
										step={500}
										value={priceRange}
										onValueChange={setPriceRange}
										className="my-4"
									/>
									<div className="flex justify-between text-sm text-gray-600">
										<span>₹{priceRange[0].toLocaleString()}</span>
										<span>₹{priceRange[1].toLocaleString()}</span>
									</div>
								</div>
							</div>

							<div>
								{activeFilters.length > 0 && (
									<div className="flex flex-wrap items-center gap-2">
										<span className="text-sm text-gray-600">
											Active Filters:
										</span>
										{activeFilters.map((filter) => (
											<Badge
												key={filter}
												className="bg-blue-100 text-blue-800 cursor-pointer"
												onClick={() => toggleFilter(filter)}>
												{filter} <i className="fas fa-times ml-1"></i>
											</Badge>
										))}
										<Button
											variant="link"
											className="text-blue-600 hover:text-blue-800 p-0 h-auto text-sm !rounded-button whitespace-nowrap cursor-pointer"
											onClick={() => setActiveFilters([])}>
											Clear All
										</Button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Results Count */}
				<div className="mb-6">
					<p className="text-gray-600">
						Showing {displayDesigns.length} {categoryName} designs
						{activeFilters.length > 0 && ` with filters applied`}
					</p>
				</div>

				{/* Design Gallery Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
					{displayDesigns.map((design) => (
						<Card
							key={design.id}
							className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
							onClick={() => openDesignDetail(design)}>
							<div className="relative h-64 overflow-hidden">
								<img
									src={design.imageUrl}
									alt={design.title}
									className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
									onError={(e) => {
										e.target.src =
											'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg';
									}}
								/>
								<div className="absolute top-4 right-4 z-10">
									<Button
										variant="outline"
										size="icon"
										className={`rounded-full bg-white/80 backdrop-blur-sm hover:bg-white ${
											savedDesigns.includes(design.id)
												? 'text-red-500'
												: 'text-gray-600'
										} !rounded-button cursor-pointer`}
										onClick={(e) => toggleSaveDesign(design.id, e)}
										disabled={favoriteLoading}>
										<i
											className={`${
												savedDesigns.includes(design.id) ? 'fas' : 'far'
											} fa-heart`}></i>
									</Button>
								</div>
								<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<div className="flex justify-between items-center">
										<Badge className="bg-blue-600">{design.style}</Badge>
										<div className="flex items-center text-yellow-400">
											<i className="fas fa-star mr-1"></i>
											<span className="text-white text-sm">
												{design.rating}
											</span>
										</div>
									</div>
								</div>
							</div>
							<div className="p-6">
								<div className="flex justify-between items-start mb-2">
									<h3 className="text-xl font-semibold text-gray-800">
										{design.title}
									</h3>
								</div>
								<p className="text-gray-600 text-sm mb-2">
									By {design.designer}
								</p>
								<p className="text-gray-700 mb-4 line-clamp-2">
									{design.description}
								</p>
								<div className="flex justify-between items-center">
									<p className="font-medium text-blue-600">
										{design.priceRange}
									</p>
									<Button
										variant="outline"
										className="text-blue-600 border-blue-600 hover:bg-blue-50 !rounded-button cursor-pointer whitespace-nowrap">
										Details <i className="fas fa-arrow-right ml-2"></i>
									</Button>
								</div>
							</div>
						</Card>
					))}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex justify-center mb-16">
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
										variant={currentPage === pageNum ? 'default' : 'outline'}
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

				{/* Loading State for Pagination */}
				{productsLoading && currentPage > 1 && (
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
						<p className="text-gray-600">Loading more designs...</p>
					</div>
				)}
			</div>

			{/* Design Detail Dialog */}
			{selectedDesign && (
				<Dialog
					open={!!selectedDesign}
					onOpenChange={(open) => !open && setSelectedDesign(null)}>
					<DialogContent className="max-w-4xl p-0 overflow-hidden">
						<div className="grid grid-cols-1 md:grid-cols-2">
							<div className="h-full">
								<img
									src={selectedDesign.imageUrl}
									alt={selectedDesign.title}
									className="w-full h-full object-cover object-top"
								/>
							</div>
							<div className="p-6 overflow-y-auto max-h-[80vh]">
								<DialogHeader className="mb-4">
									<div className="flex justify-between items-start">
										<DialogTitle className="text-2xl font-bold">
											{selectedDesign.title}
										</DialogTitle>
										<Button
											variant="outline"
											size="icon"
											className={`rounded-full ${
												savedDesigns.includes(selectedDesign.id)
													? 'text-red-500 border-red-200'
													: 'text-gray-600'
											} !rounded-button cursor-pointer`}
											onClick={(e) => toggleSaveDesign(selectedDesign.id, e)}>
											<i
												className={`${
													savedDesigns.includes(selectedDesign.id)
														? 'fas'
														: 'far'
												} fa-heart`}></i>
										</Button>
									</div>
								</DialogHeader>

								<div className="mb-4">
									<p className="text-gray-600">By {selectedDesign.designer}</p>
									<div className="flex items-center mt-1">
										<div className="flex text-yellow-400">
											{[...Array(5)].map((_, i) => (
												<i
													key={i}
													className={`${
														i < Math.floor(selectedDesign.rating)
															? 'fas'
															: i < selectedDesign.rating
															? 'fas fa-star-half-alt'
															: 'far'
													} fa-star`}></i>
											))}
										</div>
										<span className="ml-2 text-gray-600">
											{selectedDesign.rating}
										</span>
									</div>
								</div>

								<div className="mb-6">
									<Badge className="bg-blue-600 mb-4">
										{selectedDesign.style}
									</Badge>
									<p className="text-gray-700 mb-4">
										{selectedDesign.description}
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4 mb-6">
									<div className="bg-gray-50 p-3 rounded-md">
										<p className="text-sm text-gray-500">Price Range</p>
										<p className="font-medium text-blue-600">
											{selectedDesign.priceRange}
										</p>
									</div>
									<div className="bg-gray-50 p-3 rounded-md">
										<p className="text-sm text-gray-500">Dimensions</p>
										<p className="font-medium">{selectedDesign.dimensions}</p>
									</div>
								</div>

								<div className="mb-6">
									<h4 className="font-medium text-gray-900 mb-2">
										Key Features
									</h4>
									<ul className="grid grid-cols-2 gap-2">
										{selectedDesign.features.map((feature, index) => (
											<li key={index} className="flex items-start">
												<i className="fas fa-check text-green-500 mt-1 mr-2"></i>
												<span>{feature}</span>
											</li>
										))}
									</ul>
								</div>

								<div className="flex flex-col gap-3">
									<Button className="bg-blue-600 hover:bg-blue-700 text-white w-full !rounded-button cursor-pointer whitespace-nowrap">
										Request Quote
									</Button>
									<Button
										variant="outline"
										className="w-full !rounded-button cursor-pointer whitespace-nowrap">
										<i className="fas fa-share-alt mr-2"></i> Share Design
									</Button>
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
};

export default DesignPage;
