import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Heart,
	Mail,
	MapPin,
	MessageSquare,
	Package,
	Phone,
	Star,
	User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	apiUtils,
	messageAPI,
	productAPI,
	reviewAPI,
	userAPI,
	vendorAPI,
} from './services/api';

const VendorDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	// State management
	const [vendor, setVendor] = useState(null);
	const [reviews, setReviews] = useState([]);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [reviewsLoading, setReviewsLoading] = useState(true);
	const [productsLoading, setProductsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isFavorite, setIsFavorite] = useState(false);

	// Modal states
	const [messageModal, setMessageModal] = useState(false);
	const [reviewModal, setReviewModal] = useState(false);

	// Form states
	const [messageForm, setMessageForm] = useState({
		name: '',
		email: '',
		phone: '',
		message: '',
		projectType: '',
		budget: '',
		timeline: '',
	});

	const [reviewForm, setReviewForm] = useState({
		rating: 5,
		reviewText: '',
		images: [],
	});

	// Loading states
	const [messageSubmitting, setMessageSubmitting] = useState(false);
	const [reviewSubmitting, setReviewSubmitting] = useState(false);
	const [favoriteLoading, setFavoriteLoading] = useState(false);

	// Current user data
	const currentUser = apiUtils.getCurrentUser();
	const isAuthenticated = apiUtils.isAuthenticated();

	// Initialize form with user data if logged in
	useEffect(() => {
		if (isAuthenticated && currentUser) {
			setMessageForm((prev) => ({
				...prev,
				name: currentUser.name || '',
				email: currentUser.email || '',
				phone: currentUser.phone || '',
			}));
		}
	}, [isAuthenticated, currentUser]);

	// Fetch vendor data
	useEffect(() => {
		const fetchVendor = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await vendorAPI.getById(id);
				setVendor(response.data.vendor || response.data);
			} catch (err) {
				console.error('Error fetching vendor:', err);
				setError('Failed to load vendor details');
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchVendor();
		}
	}, [id]);

	// Fetch vendor reviews
	useEffect(() => {
		const fetchReviews = async () => {
			try {
				setReviewsLoading(true);
				const response = await reviewAPI.getVendorReviews(id, { limit: 10 });
				setReviews(response.data.reviews || []);
			} catch (err) {
				console.error('Error fetching reviews:', err);
				setReviews([]);
			} finally {
				setReviewsLoading(false);
			}
		};

		if (id) {
			fetchReviews();
		}
	}, [id]);

	// Fetch vendor products/services
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setProductsLoading(true);
				const response = await productAPI.getVendorProducts({
					vendorId: id,
					limit: 8,
				});
				setProducts(response.data.products || []);
			} catch (err) {
				console.error('Error fetching products:', err);
				setProducts([]);
			} finally {
				setProductsLoading(false);
			}
		};

		if (id) {
			fetchProducts();
		}
	}, [id]);

	// Check if vendor is in favorites
	useEffect(() => {
		const checkFavoriteStatus = async () => {
			if (!isAuthenticated) return;

			try {
				const response = await userAPI.getFavorites();
				const favoriteVendors = response.data.vendors || [];
				setIsFavorite(favoriteVendors.some((fav) => fav._id === id));
			} catch (error) {
				console.error('Error checking favorite status:', error);
			}
		};

		checkFavoriteStatus();
	}, [id, isAuthenticated]);

	// Handle Message Form Submission
	const handleMessageSubmit = async (e) => {
		e.preventDefault();

		if (!isAuthenticated) {
			alert('Please login to send messages');
			navigate('/login');
			return;
		}

		// Validate required fields
		if (
			!messageForm.name.trim() ||
			!messageForm.email.trim() ||
			!messageForm.message.trim()
		) {
			alert('Please fill in all required fields');
			return;
		}

		setMessageSubmitting(true);

		try {
			const messageData = {
				vendorId: id,
				name: messageForm.name.trim(),
				email: messageForm.email.trim(),
				phone: messageForm.phone.trim(),
				message: messageForm.message.trim(),
				projectType: messageForm.projectType,
				budget: messageForm.budget,
				timeline: messageForm.timeline,
				subject: `New inquiry from ${messageForm.name}`,
			};

			const response = await messageAPI.send(messageData);

			if (response.data) {
				alert('Message sent successfully! The vendor will contact you soon.');
				setMessageForm({
					name: currentUser?.name || '',
					email: currentUser?.email || '',
					phone: currentUser?.phone || '',
					message: '',
					projectType: '',
					budget: '',
					timeline: '',
				});
				setMessageModal(false);
			}
		} catch (error) {
			console.error('Error sending message:', error);
			const errorMessage =
				error.response?.data?.message ||
				'Failed to send message. Please try again.';
			alert(errorMessage);
		} finally {
			setMessageSubmitting(false);
		}
	};

	// Handle Review Form Submission
	const handleReviewSubmit = async (e) => {
		e.preventDefault();

		if (!isAuthenticated) {
			alert('Please login to submit reviews');
			navigate('/login');
			return;
		}

		// Validate review
		if (!reviewForm.reviewText.trim()) {
			alert('Please write a review');
			return;
		}

		if (reviewForm.rating < 1 || reviewForm.rating > 5) {
			alert('Please select a rating between 1 and 5');
			return;
		}

		setReviewSubmitting(true);

		try {
			const reviewData = {
				vendorId: id,
				rating: reviewForm.rating,
				reviewText: reviewForm.reviewText.trim(),
				images: reviewForm.images,
			};

			const response = await reviewAPI.create(reviewData);

			if (response.data) {
				alert('Review submitted successfully!');

				// Reset form
				setReviewForm({
					rating: 5,
					reviewText: '',
					images: [],
				});
				setReviewModal(false);

				// Refresh reviews
				const reviewsResponse = await reviewAPI.getVendorReviews(id, {
					limit: 10,
				});
				setReviews(reviewsResponse.data.reviews || []);

				// Update vendor rating if provided in response
				if (response.data.newAverageRating) {
					setVendor((prev) => ({
						...prev,
						rating: response.data.newAverageRating,
						reviewCount: (prev.reviewCount || 0) + 1,
					}));
				}
			}
		} catch (error) {
			console.error('Error submitting review:', error);
			const errorMessage =
				error.response?.data?.message ||
				'Failed to submit review. Please try again.';
			alert(errorMessage);
		} finally {
			setReviewSubmitting(false);
		}
	};

	// Handle Toggle Favorite
	const handleToggleFavorite = async () => {
		if (!isAuthenticated) {
			alert('Please login to save favorites');
			navigate('/login');
			return;
		}

		setFavoriteLoading(true);

		try {
			if (isFavorite) {
				await userAPI.removeFromFavorites(id);
				setIsFavorite(false);
				alert('Removed from favorites');
			} else {
				await userAPI.addToFavorites(id);
				setIsFavorite(true);
				alert('Added to favorites');
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
			alert(error.response?.data?.message || 'Failed to update favorites');
		} finally {
			setFavoriteLoading(false);
		}
	};

	// Handle Image Upload for Reviews
	const handleImageUpload = (e) => {
		const files = Array.from(e.target.files);
		setReviewForm((prev) => ({
			...prev,
			images: [...prev.images, ...files].slice(0, 5), // Max 5 images
		}));
	};

	// Remove uploaded image
	const removeImage = (index) => {
		setReviewForm((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	// Render star rating
	const renderStars = (rating, interactive = false, onRatingChange = null) => {
		const stars = [];

		for (let i = 1; i <= 5; i++) {
			stars.push(
				<button
					key={i}
					type="button"
					onClick={
						interactive ? () => onRatingChange && onRatingChange(i) : undefined
					}
					className={`${
						interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
					} transition-transform`}
					disabled={!interactive}>
					<Star
						className={`h-5 w-5 ${
							i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
						}`}
					/>
				</button>
			);
		}
		return stars;
	};

	// Loading state
	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	// Error state
	if (error || !vendor) {
		return (
			<div className="text-center py-8">
				<AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
				<p className="text-red-600 mb-4">{error || 'Vendor not found'}</p>
				<Button onClick={() => navigate('/design-ideas')}>
					Back to Vendors
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header Section */}
			<div className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 py-8">
					<div className="flex items-start justify-between">
						<div className="flex space-x-6">
							<div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
								<img
									src={
										vendor.images?.profileImage ||
										'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg'
									}
									alt={vendor.name || vendor.title}
									className="w-full h-full object-cover"
									onError={(e) => {
										e.target.src =
											'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg';
									}}
								/>
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									{vendor.title || vendor.name}
								</h1>
								<p className="text-xl text-gray-600 mt-1">
									{vendor.professionType || 'Interior Designer'}
								</p>

								<div className="flex items-center mt-3">
									<div className="flex mr-2">
										{renderStars(vendor.rating || 0)}
									</div>
									<span className="text-sm text-gray-600">
										{(vendor.rating || 0).toFixed(1)} (
										{vendor.reviewCount || reviews.length} reviews)
									</span>
								</div>

								<div className="flex items-center mt-2 text-gray-600">
									<MapPin className="h-4 w-4 mr-1" />
									<span className="text-sm">
										{vendor.location?.city}, {vendor.location?.state}
									</span>
								</div>

								{vendor.budgetLevel && (
									<Badge variant="outline" className="mt-2">
										{vendor.budgetLevel} Budget
									</Badge>
								)}
							</div>
						</div>

						<div className="flex space-x-3">
							<Button
								variant="outline"
								onClick={handleToggleFavorite}
								disabled={favoriteLoading}
								className="flex items-center space-x-2">
								<Heart
									className={`h-4 w-4 ${
										isFavorite ? 'fill-current text-red-500' : ''
									}`}
								/>
								<span>{isFavorite ? 'Saved' : 'Save'}</span>
							</Button>
							<Button onClick={() => setMessageModal(true)}>
								<MessageSquare className="h-4 w-4 mr-2" />
								Send Message
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 py-6">
				<Tabs defaultValue="about" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="about">About</TabsTrigger>
						<TabsTrigger value="services">Services</TabsTrigger>
						<TabsTrigger value="reviews">Reviews</TabsTrigger>
						<TabsTrigger value="portfolio">Portfolio</TabsTrigger>
					</TabsList>

					{/* About Tab */}
					<TabsContent value="about" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>About {vendor.title || vendor.name}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-gray-700 mb-4">
									{vendor.about ||
										'Professional interior design services with years of experience.'}
								</p>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<h3 className="font-semibold text-gray-900 mb-2">
											Specializations
										</h3>
										<div className="flex flex-wrap gap-2">
											{(vendor.categories || []).map((category, index) => (
												<Badge key={index} variant="secondary">
													{category}
												</Badge>
											))}
										</div>
									</div>

									<div>
										<h3 className="font-semibold text-gray-900 mb-2">
											Design Styles
										</h3>
										<div className="flex flex-wrap gap-2">
											{(vendor.styles || []).map((style, index) => (
												<Badge key={index} variant="outline">
													{style}
												</Badge>
											))}
										</div>
									</div>
								</div>

								{vendor.businessHighlights &&
									vendor.businessHighlights.length > 0 && (
										<div className="mt-6">
											<h3 className="font-semibold text-gray-900 mb-2">
												Business Highlights
											</h3>
											<ul className="space-y-1">
												{vendor.businessHighlights.map((highlight, index) => (
													<li
														key={index}
														className="flex items-center text-gray-700">
														<CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
														{highlight}
													</li>
												))}
											</ul>
										</div>
									)}

								{/* Contact Information */}
								<div className="mt-6 p-4 bg-gray-50 rounded-lg">
									<h3 className="font-semibold text-gray-900 mb-3">
										Contact Information
									</h3>
									<div className="space-y-2">
										{vendor.email && (
											<div className="flex items-center">
												<Mail className="h-4 w-4 text-gray-500 mr-2" />
												<span className="text-gray-700">{vendor.email}</span>
											</div>
										)}
										{vendor.phone && (
											<div className="flex items-center">
												<Phone className="h-4 w-4 text-gray-500 mr-2" />
												<span className="text-gray-700">{vendor.phone}</span>
											</div>
										)}
										<div className="flex items-center">
											<MapPin className="h-4 w-4 text-gray-500 mr-2" />
											<span className="text-gray-700">
												{vendor.location?.city}, {vendor.location?.state} -{' '}
												{vendor.location?.pincode}
											</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Services Tab */}
					<TabsContent value="services" className="space-y-6">
						{productsLoading ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
								<p className="text-gray-600">Loading services...</p>
							</div>
						) : products.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{products.map((product) => (
									<Card
										key={product._id}
										className="hover:shadow-lg transition-shadow">
										<div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
											<img
												src={
													product.thumbnailImage ||
													'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg'
												}
												alt={product.name}
												className="w-full h-full object-cover"
												onError={(e) => {
													e.target.src =
														'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg';
												}}
											/>
										</div>
										<CardContent className="p-4">
											<h3 className="font-semibold mb-2">{product.name}</h3>
											<p className="text-sm text-gray-600 mb-2">
												{product.category}
											</p>
											<p className="text-sm text-gray-500 mb-3 line-clamp-2">
												{product.shortDescription}
											</p>
											<div className="flex justify-between items-center">
												<span className="text-green-600 font-semibold">
													₹{product.priceRange?.min?.toLocaleString()} - ₹
													{product.priceRange?.max?.toLocaleString()}
												</span>
												<Link to={`/product/${product._id}`}>
													<Button size="sm" variant="outline">
														View Details
													</Button>
												</Link>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<Card>
								<CardContent className="text-center py-8">
									<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-600">No services available</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* Reviews Tab */}
					<TabsContent value="reviews" className="space-y-6">
						<div className="flex justify-between items-center">
							<h2 className="text-xl font-bold">Customer Reviews</h2>
							<Button onClick={() => setReviewModal(true)}>
								Write a Review
							</Button>
						</div>

						{reviewsLoading ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
								<p className="text-gray-600">Loading reviews...</p>
							</div>
						) : reviews.length > 0 ? (
							<div className="space-y-6">
								{reviews.map((review) => (
									<Card key={review._id}>
										<CardContent className="pt-6">
											<div className="flex items-start justify-between mb-3">
												<div className="flex items-center space-x-3">
													<Avatar className="w-10 h-10">
														<div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
															{(review.userId?.name || 'U')
																.charAt(0)
																.toUpperCase()}
														</div>
													</Avatar>
													<div>
														<p className="font-semibold">
															{review.userId?.name || 'Anonymous'}
														</p>
														<div className="flex items-center">
															{renderStars(review.rating)}
															<span className="ml-2 text-sm text-gray-600">
																{new Date(
																	review.createdAt
																).toLocaleDateString()}
															</span>
														</div>
													</div>
												</div>
											</div>
											<p className="text-gray-700">{review.reviewText}</p>

											{review.images && review.images.length > 0 && (
												<div className="grid grid-cols-3 gap-2 mt-4">
													{review.images.map((image, index) => (
														<img
															key={index}
															src={image}
															alt={`Review image ${index + 1}`}
															className="w-full h-20 object-cover rounded-lg"
														/>
													))}
												</div>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<Card>
								<CardContent className="text-center py-8">
									<Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-600">
										No reviews yet. Be the first to write a review!
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* Portfolio Tab */}
					<TabsContent value="portfolio" className="space-y-6">
						{vendor.images?.portfolio && vendor.images.portfolio.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{vendor.images.portfolio.map((image, index) => (
									<div
										key={index}
										className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
										<img
											src={image}
											alt={`Portfolio ${index + 1}`}
											className="w-full h-full object-cover"
										/>
									</div>
								))}
							</div>
						) : (
							<Card>
								<CardContent className="text-center py-8">
									<p className="text-gray-600">
										Portfolio images will be displayed here
									</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>
			</div>

			{/* Message Modal */}
			<Dialog open={messageModal} onOpenChange={setMessageModal}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>
							Send Message to {vendor.title || vendor.name}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleMessageSubmit}>
						<div className="space-y-4">
							<div>
								<Label htmlFor="name">Name *</Label>
								<Input
									id="name"
									value={messageForm.name}
									onChange={(e) =>
										setMessageForm((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div>
								<Label htmlFor="email">Email *</Label>
								<Input
									id="email"
									type="email"
									value={messageForm.email}
									onChange={(e) =>
										setMessageForm((prev) => ({
											...prev,
											email: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div>
								<Label htmlFor="phone">Phone</Label>
								<Input
									id="phone"
									value={messageForm.phone}
									onChange={(e) =>
										setMessageForm((prev) => ({
											...prev,
											phone: e.target.value,
										}))
									}
								/>
							</div>
							<div>
								<Label htmlFor="projectType">Project Type</Label>
								<select
									id="projectType"
									value={messageForm.projectType}
									onChange={(e) =>
										setMessageForm((prev) => ({
											...prev,
											projectType: e.target.value,
										}))
									}
									className="w-full p-2 border border-gray-300 rounded-md">
									<option value="">Select project type</option>
									<option value="Residential">Residential</option>
									<option value="Commercial">Commercial</option>
									<option value="Renovation">Renovation</option>
									<option value="Consultation">Consultation Only</option>
								</select>
							</div>
							<div>
								<Label htmlFor="budget">Budget Range</Label>
								<select
									id="budget"
									value={messageForm.budget}
									onChange={(e) =>
										setMessageForm((prev) => ({
											...prev,
											budget: e.target.value,
										}))
									}
									className="w-full p-2 border border-gray-300 rounded-md">
									<option value="">Select budget range</option>
									<option value="Under ₹50,000">Under ₹50,000</option>
									<option value="₹50,000 - ₹1,00,000">
										₹50,000 - ₹1,00,000
									</option>
									<option value="₹1,00,000 - ₹2,00,000">
										₹1,00,000 - ₹2,00,000
									</option>
									<option value="₹2,00,000 - ₹5,00,000">
										₹2,00,000 - ₹5,00,000
									</option>
									<option value="Above ₹5,00,000">Above ₹5,00,000</option>
								</select>
							</div>
							<div>
								<Label htmlFor="timeline">Timeline</Label>
								<select
									id="timeline"
									value={messageForm.timeline}
									onChange={(e) =>
										setMessageForm((prev) => ({
											...prev,
											timeline: e.target.value,
										}))
									}
									className="w-full p-2 border border-gray-300 rounded-md">
									<option value="">Select timeline</option>
									<option value="Immediate">Immediate (within 1 month)</option>
									<option value="1-3 months">1-3 months</option>
									<option value="3-6 months">3-6 months</option>
									<option value="6+ months">6+ months</option>
									<option value="Planning stage">Just planning</option>
								</select>
							</div>
							<div>
								<Label htmlFor="message">Message *</Label>
								<Textarea
									id="message"
									rows={4}
									placeholder="Tell us about your project requirements..."
									value={messageForm.message}
									onChange={(e) =>
										setMessageForm((prev) => ({
											...prev,
											message: e.target.value,
										}))
									}
									required
								/>
							</div>
						</div>
						<DialogFooter className="mt-6">
							<Button
								type="button"
								variant="outline"
								onClick={() => setMessageModal(false)}
								disabled={messageSubmitting}>
								Cancel
							</Button>
							<Button type="submit" disabled={messageSubmitting}>
								{messageSubmitting ? 'Sending...' : 'Send Message'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Review Modal */}
			<Dialog open={reviewModal} onOpenChange={setReviewModal}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>
							Write a Review for {vendor.title || vendor.name}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleReviewSubmit}>
						<div className="space-y-4">
							<div>
								<Label>Rating *</Label>
								<div className="flex space-x-1 mt-2">
									{renderStars(reviewForm.rating, true, (rating) =>
										setReviewForm((prev) => ({ ...prev, rating }))
									)}
								</div>
							</div>
							<div>
								<Label htmlFor="reviewText">Review *</Label>
								<Textarea
									id="reviewText"
									rows={4}
									placeholder="Share your experience..."
									value={reviewForm.reviewText}
									onChange={(e) =>
										setReviewForm((prev) => ({
											...prev,
											reviewText: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div>
								<Label htmlFor="images">Add Photos (optional)</Label>
								<Input
									id="images"
									type="file"
									multiple
									accept="image/*"
									onChange={handleImageUpload}
									className="mt-1"
								/>
								{reviewForm.images.length > 0 && (
									<div className="grid grid-cols-3 gap-2 mt-2">
										{reviewForm.images.map((image, index) => (
											<div key={index} className="relative">
												<img
													src={URL.createObjectURL(image)}
													alt={`Upload ${index + 1}`}
													className="w-full h-20 object-cover rounded-lg"
												/>
												<button
													type="button"
													onClick={() => removeImage(index)}
													className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
													×
												</button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
						<DialogFooter className="mt-6">
							<Button
								type="button"
								variant="outline"
								onClick={() => setReviewModal(false)}
								disabled={reviewSubmitting}>
								Cancel
							</Button>
							<Button type="submit" disabled={reviewSubmitting}>
								{reviewSubmitting ? 'Submitting...' : 'Submit Review'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default VendorDetail;
