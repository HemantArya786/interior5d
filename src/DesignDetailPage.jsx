import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProductById } from './hooks/useApi';
import { apiUtils, messageAPI, userAPI } from './services/api';

const DesignDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [isFavorite, setIsFavorite] = useState(false);
	const [showContactModal, setShowContactModal] = useState(false);
	const [message, setMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [favoriteLoading, setFavoriteLoading] = useState(false);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	// Fetch product data from backend
	const {
		data: productData,
		loading: productLoading,
		error,
	} = useProductById(id);
	const product = productData?.product || productData;

	useEffect(() => {
		// Check if product is in favorites
		const checkFavoriteStatus = async () => {
			try {
				if (apiUtils.isAuthenticated() && product) {
					const response = await userAPI.getFavorites();
					const favoriteIds =
						response.data.favorites?.map((fav) => fav._id || fav.productId) ||
						[];
					setIsFavorite(favoriteIds.includes(id));
				}
			} catch (error) {
				console.error('Error checking favorite status:', error);
			}
		};

		if (id && product) {
			checkFavoriteStatus();
		}
	}, [id, product]);

	// Prefill message when component loads
	useEffect(() => {
		if (product && !message) {
			setMessage(
				`Hi! I'm interested in your "${product.name}" design. Could you please provide more details about:\n\n• Pricing and customization options\n• Timeline for completion\n• What's included in the service\n• Any additional costs\n\nThank you!`
			);
		}
	}, [product, message]);

	const toggleFavorite = async () => {
		try {
			if (!apiUtils.isAuthenticated()) {
				alert('Please login to save designs');
				return;
			}

			setFavoriteLoading(true);

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

	const handleContactVendor = async () => {
		try {
			if (!apiUtils.isAuthenticated()) {
				alert('Please login to contact designers');
				return;
			}

			setLoading(true);
			const user = apiUtils.getCurrentUser();

			await messageAPI.send({
				vendorId: product.vendorId._id || product.vendorId,
				productId: product._id,
				message: message,
				name: user?.name || 'Anonymous User',
				email: user?.email || '',
				phone: user?.phone || '',
			});

			alert('Message sent successfully! The designer will contact you soon.');
			setMessage('');
			setShowContactModal(false);
		} catch (error) {
			console.error('Error sending message:', error);
			alert(error.response?.data?.message || 'Failed to send message');
		} finally {
			setLoading(false);
		}
	};

	if (productLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading design details...</p>
				</div>
			</div>
		);
	}

	if (error || !product) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
						<i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Design Not Found
					</h2>
					<p className="text-gray-600 mb-4">
						{error ||
							"The design you're looking for doesn't exist or has been removed."}
					</p>
					<div className="space-x-4">
						<Button onClick={() => navigate(-1)} variant="outline">
							Go Back
						</Button>
						<Button onClick={() => navigate('/ideas')}>Browse Designs</Button>
					</div>
				</div>
			</div>
		);
	}

	const images = [
		product.thumbnailImage,
		...(product.galleryImages || []),
	].filter(Boolean);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Breadcrumb */}
			<div className="bg-white border-b">
				<div className="max-w-7xl mx-auto px-4 py-3">
					<nav className="text-sm text-gray-600">
						<Link to="/" className="hover:text-blue-600">
							Home
						</Link>
						<span className="mx-2">›</span>
						<Link to="/ideas" className="hover:text-blue-600">
							Design Ideas
						</Link>
						<span className="mx-2">›</span>
						<span className="text-gray-900">{product.name}</span>
					</nav>
				</div>
			</div>

			{/* Hero Section */}
			<div className="bg-white">
				<div className="max-w-7xl mx-auto px-4 py-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Image Gallery */}
						<div className="space-y-4">
							{/* Main Image */}
							<div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
								<img
									src={
										images[selectedImageIndex] ||
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

							{/* Thumbnail Gallery */}
							{images.length > 1 && (
								<div className="grid grid-cols-4 gap-2">
									{images.slice(0, 4).map((image, index) => (
										<div
											key={index}
											className={`aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer border-2 ${
												selectedImageIndex === index
													? 'border-blue-500'
													: 'border-transparent'
											}`}
											onClick={() => setSelectedImageIndex(index)}>
											<img
												src={image}
												alt={`${product.name} ${index + 1}`}
												className="w-full h-full object-cover"
												onError={(e) => {
													e.target.src =
														'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg';
												}}
											/>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Product Details */}
						<div className="space-y-6">
							<div>
								<h1 className="text-3xl font-bold text-gray-900 mb-2">
									{product.name}
								</h1>
								<p className="text-lg text-gray-600">
									by{' '}
									<Link
										to={`/vendor/${product.vendorId._id || product.vendorId}`}
										className="text-blue-600 hover:underline">
										{product.vendorName}
									</Link>
								</p>
							</div>

							{/* Badges */}
							<div className="flex flex-wrap gap-2">
								<Badge variant="secondary">{product.category}</Badge>
								{product.style && (
									<Badge variant="outline">{product.style}</Badge>
								)}
								{product.features?.slice(0, 3).map((feature, index) => (
									<Badge key={index} variant="outline">
										{feature}
									</Badge>
								))}
								{product.features?.length > 3 && (
									<Badge variant="outline">
										+{product.features.length - 3} more
									</Badge>
								)}
							</div>

							{/* Rating */}
							{product.rating && (
								<div className="flex items-center space-x-2">
									<div className="flex text-yellow-400">
										{[...Array(5)].map((_, i) => (
											<i
												key={i}
												className={`fas fa-star ${
													i < Math.floor(product.rating) ? '' : 'text-gray-300'
												}`}></i>
										))}
									</div>
									<span className="text-gray-600">
										{product.rating.toFixed(1)} ({product.reviewCount || 0}{' '}
										reviews)
									</span>
								</div>
							)}

							{/* Price */}
							<div className="bg-green-50 p-4 rounded-lg">
								<p className="text-2xl font-bold text-green-600">
									₹{product.priceRange?.min?.toLocaleString()} - ₹
									{product.priceRange?.max?.toLocaleString()}
								</p>
								<p className="text-sm text-gray-600 mt-1">
									Price may vary based on customization and room size
								</p>
								{product.consultationFee > 0 && (
									<p className="text-sm text-gray-600">
										Consultation fee: ₹
										{product.consultationFee.toLocaleString()}
									</p>
								)}
							</div>

							{/* Quick Details Grid */}
							<div className="grid grid-cols-2 gap-4">
								<div className="bg-gray-50 p-3 rounded-lg">
									<h3 className="font-semibold text-gray-900 mb-1">
										Room Size
									</h3>
									<p className="text-gray-600 text-sm">
										{product.dimensions
											? `${product.dimensions.length}×${product.dimensions.width}×${product.dimensions.height} ${product.dimensions.unit}`
											: 'Custom dimensions'}
									</p>
								</div>
								<div className="bg-gray-50 p-3 rounded-lg">
									<h3 className="font-semibold text-gray-900 mb-1">Duration</h3>
									<p className="text-gray-600 text-sm">
										{product.durationEstimate || 'Contact for timeline'}
									</p>
								</div>
								<div className="bg-gray-50 p-3 rounded-lg">
									<h3 className="font-semibold text-gray-900 mb-1">
										Availability
									</h3>
									<p className="text-gray-600 text-sm">
										{product.serviceAvailability || 'Available'}
									</p>
								</div>
								<div className="bg-gray-50 p-3 rounded-lg">
									<h3 className="font-semibold text-gray-900 mb-1">
										Budget Level
									</h3>
									<p className="text-gray-600 text-sm">
										{product.budgetLevel || 'Contact for details'}
									</p>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-4">
								<Button
									onClick={toggleFavorite}
									variant={isFavorite ? 'default' : 'outline'}
									className="flex-1"
									disabled={favoriteLoading}>
									{favoriteLoading ? (
										<i className="fas fa-spinner fa-spin mr-2"></i>
									) : (
										<i
											className={`fa${
												isFavorite ? 's' : 'r'
											} fa-heart mr-2`}></i>
									)}
									{isFavorite ? 'Saved' : 'Save Design'}
								</Button>
								<Button
									onClick={() => setShowContactModal(true)}
									className="flex-1">
									<i className="fas fa-envelope mr-2"></i>
									Contact Designer
								</Button>
							</div>

							{/* Share Options */}
							<div className="flex items-center justify-between pt-4 border-t">
								<span className="text-sm text-gray-600">
									Share this design:
								</span>
								<div className="flex space-x-2">
									<Button variant="ghost" size="sm">
										<i className="fab fa-facebook text-blue-600"></i>
									</Button>
									<Button variant="ghost" size="sm">
										<i className="fab fa-twitter text-blue-400"></i>
									</Button>
									<Button variant="ghost" size="sm">
										<i className="fab fa-pinterest text-red-600"></i>
									</Button>
									<Button variant="ghost" size="sm">
										<i className="fas fa-link text-gray-600"></i>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Design Details */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Description */}
				<div className="bg-white rounded-lg p-6 mb-8">
					<h2 className="text-2xl font-bold mb-4">Design Details</h2>
					<p className="text-gray-700 mb-6 leading-relaxed">
						{product.fullDescription ||
							product.shortDescription ||
							'Beautiful interior design solution crafted with attention to detail and functionality.'}
					</p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Features */}
						{product.features && product.features.length > 0 && (
							<div>
								<h3 className="font-semibold text-gray-900 mb-3">
									Features & Inclusions
								</h3>
								<ul className="space-y-2">
									{product.features.map((feature, index) => (
										<li key={index} className="flex items-start">
											<span className="text-green-500 mr-2 mt-0.5">✓</span>
											<span className="text-gray-700">{feature}</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Materials */}
						{product.materialsUsed && product.materialsUsed.length > 0 && (
							<div>
								<h3 className="font-semibold text-gray-900 mb-3">
									Materials Used
								</h3>
								<ul className="space-y-2">
									{product.materialsUsed.map((material, index) => (
										<li key={index} className="flex items-start">
											<span className="text-blue-500 mr-2 mt-0.5">•</span>
											<span className="text-gray-700">{material}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>

					{/* Exclusions */}
					{product.exclusions && product.exclusions.length > 0 && (
						<div className="mt-6">
							<h3 className="font-semibold text-gray-900 mb-3">
								What's Not Included
							</h3>
							<ul className="space-y-2">
								{product.exclusions.map((exclusion, index) => (
									<li key={index} className="flex items-start">
										<span className="text-red-500 mr-2 mt-0.5">✗</span>
										<span className="text-gray-700">{exclusion}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Available Colors */}
					{product.availableColors && product.availableColors.length > 0 && (
						<div className="mt-6">
							<h3 className="font-semibold text-gray-900 mb-3">
								Available Colors & Finishes
							</h3>
							<div className="flex flex-wrap gap-2">
								{product.availableColors.map((color, index) => (
									<Badge key={index} variant="outline">
										{color}
									</Badge>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Vendor Information */}
				<div className="bg-white rounded-lg p-6">
					<h2 className="text-2xl font-bold mb-4">About the Designer</h2>
					<div className="flex items-start space-x-4">
						<div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
							<img
								src={
									product.vendorId?.images?.profileImage ||
									'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg'
								}
								alt={product.vendorName}
								className="w-full h-full object-cover"
								onError={(e) => {
									e.target.src =
										'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg';
								}}
							/>
						</div>
						<div className="flex-1">
							<h3 className="text-xl font-semibold">
								{product.vendorId?.title || product.vendorName}
							</h3>
							<p className="text-gray-600">
								{product.vendorId?.professionType || 'Interior Designer'}
							</p>
							<p className="text-sm text-gray-500 mt-1">
								📍 {product.vendorId?.location?.city || 'Available nationwide'},{' '}
								{product.vendorId?.location?.state || ''}
							</p>
							{product.vendorId?.rating && (
								<div className="flex items-center mt-2">
									<span className="text-yellow-400 mr-1">★</span>
									<span className="text-sm text-gray-600">
										{product.vendorId.rating.toFixed(1)} (
										{product.vendorId.reviewCount || 0} reviews)
									</span>
								</div>
							)}
							{product.vendorId?.about && (
								<p className="text-gray-700 mt-2 text-sm">
									{product.vendorId.about}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Link to={`/vendor/${product.vendorId._id || product.vendorId}`}>
								<Button variant="outline">View Full Profile</Button>
							</Link>
							<Button onClick={() => setShowContactModal(true)}>
								Contact Now
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Contact Modal */}
			<Dialog open={showContactModal} onOpenChange={setShowContactModal}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Contact {product.vendorName}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="bg-blue-50 p-3 rounded-lg">
							<p className="text-sm text-blue-800">
								<i className="fas fa-lightbulb mr-1"></i>
								<strong>Design:</strong> {product.name}
							</p>
							<p className="text-sm text-blue-600 mt-1">
								Your message will include details about this specific design.
							</p>
						</div>
						<Textarea
							placeholder="Tell the designer about your project..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							rows={6}
						/>
						<div className="text-xs text-gray-500">
							💡 Include details about your space, timeline, and budget for
							better responses.
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowContactModal(false);
							}}
							disabled={loading}>
							Cancel
						</Button>
						<Button
							onClick={handleContactVendor}
							disabled={loading || !message.trim()}>
							{loading ? (
								<>
									<i className="fas fa-spinner fa-spin mr-2"></i>
									Sending...
								</>
							) : (
								<>
									<i className="fas fa-paper-plane mr-2"></i>
									Send Message
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default DesignDetailPage;
