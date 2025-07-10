import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Star, User } from 'lucide-react';
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useVendorReviews } from '../hooks/useApi';
import { reviewAPI } from '../services/api';

const VendorReviews = () => {
	const { vendorData } = useOutletContext();
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [replyingTo, setReplyingTo] = useState(null);
	const [replyText, setReplyText] = useState('');
	const [replying, setReplying] = useState(false);

	const {
		data: reviewsData,
		loading,
		refetch,
	} = useVendorReviews(vendorData._id, { page: currentPage, limit: 10 });

	const reviews = reviewsData?.reviews || [];
	const totalPages = reviewsData?.totalPages || 1;

	const handleReplyToReview = async (reviewId) => {
		if (!replyText.trim()) return;

		try {
			setReplying(true);
			await reviewAPI.update(reviewId, { reply: replyText });
			setReplyText('');
			setReplyingTo(null);
			refetch();
			alert('Reply sent successfully!');
		} catch (error) {
			console.error('Error replying to review:', error);
			alert('Failed to send reply');
		} finally {
			setReplying(false);
		}
	};

	const filteredReviews = reviews.filter(
		(review) =>
			review.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			review.reviewText?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const renderStars = (rating) => {
		return [...Array(5)].map((_, i) => (
			<Star
				key={i}
				className={`h-4 w-4 ${
					i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
				}`}
			/>
		));
	};

	const getRatingColor = (rating) => {
		if (rating >= 4) return 'text-green-600';
		if (rating >= 3) return 'text-yellow-600';
		return 'text-red-600';
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
					<p className="text-gray-600">Customer feedback and ratings</p>
				</div>
				<div className="flex items-center space-x-2">
					<Badge variant="outline">
						⭐ {(vendorData.rating || 0).toFixed(1)} Average
					</Badge>
					<Badge variant="outline">{reviews.length} Total Reviews</Badge>
				</div>
			</div>

			{/* Search */}
			<Card>
				<CardContent className="pt-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search reviews..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Reviews List */}
			{filteredReviews.length > 0 ? (
				<div className="space-y-4">
					{filteredReviews.map((review) => (
						<Card
							key={review._id}
							className="hover:shadow-md transition-shadow">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center space-x-3">
										<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
											<User className="h-5 w-5 text-blue-600" />
										</div>
										<div>
											<p className="font-semibold text-gray-900">
												{review.userId?.name || 'Anonymous'}
											</p>
											<div className="flex items-center space-x-2 mt-1">
												<div className="flex">{renderStars(review.rating)}</div>
												<span
													className={`text-sm font-medium ${getRatingColor(
														review.rating
													)}`}>
													{review.rating}/5
												</span>
											</div>
										</div>
									</div>
									<div className="text-sm text-gray-500">
										{new Date(review.createdAt).toLocaleDateString()}
									</div>
								</div>
							</CardHeader>

							<CardContent className="space-y-4">
								<div>
									<p className="text-gray-900">{review.reviewText}</p>
								</div>

								{/* Review Images */}
								{review.images && review.images.length > 0 && (
									<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
										{review.images.map((image, index) => (
											<img
												key={index}
												src={image}
												alt={`Review ${index + 1}`}
												className="w-full h-20 object-cover rounded-lg"
											/>
										))}
									</div>
								)}

								{/* Vendor Reply */}
								{review.reply && (
									<div className="bg-blue-50 p-3 rounded-lg">
										<p className="text-sm font-medium text-blue-900 mb-1">
											Your Reply:
										</p>
										<p className="text-sm text-blue-800">{review.reply}</p>
									</div>
								)}

								{/* Reply Form */}
								{replyingTo === review._id && (
									<div className="space-y-3 p-3 bg-gray-50 rounded-lg">
										<Textarea
											placeholder="Write your reply..."
											value={replyText}
											onChange={(e) => setReplyText(e.target.value)}
											rows={3}
										/>
										<div className="flex justify-end space-x-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setReplyingTo(null);
													setReplyText('');
												}}>
												Cancel
											</Button>
											<Button
												size="sm"
												onClick={() => handleReplyToReview(review._id)}
												disabled={replying || !replyText.trim()}>
												{replying ? 'Sending...' : 'Send Reply'}
											</Button>
										</div>
									</div>
								)}

								{/* Action Buttons */}
								{!review.reply && (
									<div className="flex justify-end pt-2 border-t">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setReplyingTo(review._id)}>
											Reply
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="py-12">
						<div className="text-center">
							<Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								{searchQuery ? 'No reviews found' : 'No reviews yet'}
							</h3>
							<p className="text-gray-600">
								{searchQuery
									? 'Try adjusting your search criteria'
									: 'Customer reviews will appear here once they rate your services'}
							</p>
						</div>
					</CardContent>
				</Card>
			)}

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
		</div>
	);
};

export default VendorReviews;
