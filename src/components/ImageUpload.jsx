import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
	AlertCircle,
	Check,
	CloudUpload,
	ExternalLink,
	Link,
	Loader2,
	Trash2,
	Upload,
	X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { uploadAPI } from '../services/api';

const ImageUpload = ({
	label,
	currentImage,
	onImageChange,
	type = 'profile',
	accept = 'image/*',
	maxSize = 5 * 1024 * 1024, // 5MB
	className = '',
	multiple = false,
	disabled = false,
}) => {
	const [dragActive, setDragActive] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [imageUrl, setImageUrl] = useState(currentImage || '');
	// ✅ FIX 1: Default to 'file' mode instead of 'url'
	const [uploadMode, setUploadMode] = useState('file');
	const [preview, setPreview] = useState(currentImage || '');
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState('');
	const [imageLoadError, setImageLoadError] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const fileInputRef = useRef(null);

	// ✅ FIX 2: Simplified useEffect to prevent dependency loops
	useEffect(() => {
		if (currentImage && currentImage !== preview) {
			setPreview(currentImage);
			setImageUrl(currentImage);
			setImageLoadError(false);
			setImageLoaded(false);
		}
	}, [currentImage]); // Only depend on currentImage

	const validateFile = useCallback(
		(file) => {
			// Check if file is an image
			if (!file.type.startsWith('image/')) {
				throw new Error('Please select an image file');
			}

			// Check file size
			if (file.size > maxSize) {
				throw new Error(
					`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`
				);
			}

			// Check image dimensions for profile images
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => {
					if (type === 'profile') {
						// Recommend square images for profile
						const aspectRatio = img.width / img.height;
						if (aspectRatio < 0.5 || aspectRatio > 2) {
							console.warn(
								'For best results, use square or near-square images for profile pictures'
							);
						}
					}
					resolve(true);
				};
				img.onerror = () => reject(new Error('Invalid image file'));
				img.src = URL.createObjectURL(file);
			});
		},
		[maxSize, type]
	);

	const uploadToBackend = useCallback(async (file) => {
		try {
			console.log(
				'🔄 Uploading file to backend:',
				file.name,
				file.size,
				'bytes'
			);

			const response = await uploadAPI.uploadImage(file);
			console.log('🔍 Upload response:', response.data);

			// Handle response structure
			let uploadedUrl;
			if (response.data?.success && response.data?.url) {
				uploadedUrl = response.data.url;
			} else if (response.data?.url) {
				uploadedUrl = response.data.url;
			} else if (response.data?.secure_url) {
				uploadedUrl = response.data.secure_url;
			} else if (typeof response.data === 'string') {
				uploadedUrl = response.data;
			} else {
				console.error('❌ Invalid response structure:', response.data);
				throw new Error('Invalid response from upload server');
			}

			console.log('✅ File uploaded successfully:', uploadedUrl);
			return uploadedUrl;
		} catch (error) {
			console.error('❌ Backend upload failed:', error);
			console.error('❌ Error response:', error.response?.data);

			let errorMessage = 'Failed to upload image';
			if (error.response?.data?.message) {
				errorMessage = error.response.data.message;
			} else if (error.message) {
				errorMessage = error.message;
			}

			throw new Error(errorMessage);
		}
	}, []);

	const uploadFile = useCallback(
		async (file) => {
			try {
				setError('');
				setUploading(true);
				setUploadProgress(0);
				setImageLoadError(false);
				setImageLoaded(false);

				// Validate file
				await validateFile(file);

				// Simulate progress for better UX
				const progressInterval = setInterval(() => {
					setUploadProgress((prev) => {
						if (prev >= 90) {
							clearInterval(progressInterval);
							return 90;
						}
						return prev + 10;
					});
				}, 200);

				// Upload using backend API
				const uploadedUrl = await uploadToBackend(file);

				clearInterval(progressInterval);
				setUploadProgress(100);

				// ✅ FIX 3: Wait a bit before setting preview to ensure backend file is ready
				setTimeout(() => {
					setPreview(uploadedUrl);
					onImageChange(uploadedUrl);
					setImageLoadError(false);
					setUploadProgress(0);
				}, 500);

				return uploadedUrl;
			} catch (error) {
				console.error('Upload error:', error);
				setError(error.message);
				setUploadProgress(0);
				setImageLoadError(false);
				throw error;
			} finally {
				setUploading(false);
			}
		},
		[validateFile, uploadToBackend, onImageChange]
	);

	const handleDrag = useCallback((e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback(
		async (e) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(false);

			if (disabled) return;

			if (e.dataTransfer.files && e.dataTransfer.files[0]) {
				const file = e.dataTransfer.files[0];
				try {
					await uploadFile(file);
				} catch (error) {
					console.error('Drop upload error:', error);
				}
			}
		},
		[disabled, uploadFile]
	);

	const handleFileSelect = useCallback(
		async (e) => {
			if (disabled) return;

			if (e.target.files && e.target.files[0]) {
				const file = e.target.files[0];
				try {
					await uploadFile(file);
				} catch (error) {
					console.error('File select upload error:', error);
				}
			}
		},
		[disabled, uploadFile]
	);

	const handleUrlSubmit = useCallback(() => {
		if (disabled) return;

		setError('');
		setImageLoadError(false);
		setImageLoaded(false);

		if (!imageUrl.trim()) {
			setError('Please enter a valid image URL');
			return;
		}

		// Validate URL format
		try {
			new URL(imageUrl);
		} catch {
			setError('Please enter a valid URL');
			return;
		}

		// Test if image loads
		const img = new Image();
		img.onload = () => {
			setPreview(imageUrl);
			onImageChange(imageUrl);
			setError('');
			setImageLoadError(false);
			setImageLoaded(true);
		};
		img.onerror = () => {
			setError('Could not load image from this URL');
			setImageLoadError(true);
			setImageLoaded(false);
		};
		img.src = imageUrl;
	}, [disabled, imageUrl, onImageChange]);

	const clearImage = useCallback(() => {
		if (disabled) return;

		setPreview('');
		setImageUrl('');
		setError('');
		setImageLoadError(false);
		setImageLoaded(false);
		onImageChange('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}, [disabled, onImageChange]);

	// ✅ FIX 4: More lenient image error handler with retry logic
	const handleImageError = useCallback(
		(e) => {
			console.log('⚠️ Image failed to load:', e.target.src);

			// Only show error if we've tried loading for a bit
			setTimeout(() => {
				if (!imageLoaded) {
					console.log('❌ Setting image load error after timeout');
					setImageLoadError(true);
					setError('Image failed to load. Please try again.');
				}
			}, 2000); // Wait 2 seconds before showing error
		},
		[imageLoaded]
	);

	// ✅ FIX 5: Handle successful image load
	const handleImageLoad = useCallback(() => {
		console.log('✅ Image loaded successfully');
		setImageLoaded(true);
		setImageLoadError(false);
		setError('');
	}, []);

	return (
		<div className={`space-y-4 ${className}`}>
			<Label className="text-sm font-medium">{label}</Label>

			{/* Upload Mode Toggle */}
			<div className="flex gap-2 mb-4">
				<Button
					type="button"
					variant={uploadMode === 'url' ? 'default' : 'outline'}
					size="sm"
					onClick={() => setUploadMode('url')}
					disabled={disabled}>
					<Link className="h-4 w-4 mr-2" />
					URL
				</Button>
				<Button
					type="button"
					variant={uploadMode === 'file' ? 'default' : 'outline'}
					size="sm"
					onClick={() => setUploadMode('file')}
					disabled={disabled}>
					<Upload className="h-4 w-4 mr-2" />
					Upload File
				</Button>
			</div>

			{/* Error Display */}
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
					<AlertCircle className="h-4 w-4 inline mr-2" />
					{error}
				</div>
			)}

			{uploadMode === 'url' ? (
				/* URL Input Mode */
				<div className="space-y-3">
					<Input
						type="url"
						placeholder="Enter image URL (https://example.com/image.jpg)"
						value={imageUrl}
						onChange={(e) => {
							setImageUrl(e.target.value);
							setError('');
							setImageLoadError(false);
						}}
						className="w-full"
						disabled={disabled}
						onKeyPress={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								handleUrlSubmit();
							}
						}}
					/>
					<Button
						type="button"
						onClick={handleUrlSubmit}
						disabled={!imageUrl.trim() || disabled}
						className="w-full">
						<Check className="h-4 w-4 mr-2" />
						Set Image
					</Button>
				</div>
			) : (
				/* File Upload Mode */
				<div>
					{/* Upload Progress */}
					{uploading && (
						<div className="mb-4 space-y-2">
							<div className="flex justify-between text-sm">
								<span>Uploading to server...</span>
								<span>{uploadProgress}%</span>
							</div>
							<Progress value={uploadProgress} className="w-full" />
						</div>
					)}

					{/* Drag & Drop Area */}
					<Card
						className={`border-2 border-dashed transition-colors cursor-pointer ${
							dragActive
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-300 hover:border-gray-400'
						} ${uploading || disabled ? 'pointer-events-none opacity-60' : ''}`}
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
						onDrop={handleDrop}
						onClick={() =>
							!uploading && !disabled && fileInputRef.current?.click()
						}>
						<CardContent className="flex flex-col items-center justify-center py-10">
							{uploading ? (
								<div className="text-center">
									<Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
									<p className="text-sm text-gray-600">
										Uploading to server...
									</p>
								</div>
							) : (
								<div className="text-center">
									<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
										<CloudUpload className="h-8 w-8 text-gray-400" />
									</div>
									<p className="text-lg font-medium text-gray-700 mb-2">
										Drag & drop an image here
									</p>
									<p className="text-sm text-gray-500 mb-4">
										or click to browse files
									</p>
									<div className="text-xs text-gray-400 space-y-1">
										<p>Supported formats: JPG, PNG, GIF, WebP</p>
										<p>Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB</p>
										{type === 'profile' && (
											<p>Recommended: Square images (1:1 ratio)</p>
										)}
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Hidden File Input */}
					<input
						ref={fileInputRef}
						type="file"
						accept={accept}
						multiple={multiple}
						onChange={handleFileSelect}
						className="hidden"
						disabled={uploading || disabled}
					/>
				</div>
			)}

			{/* ✅ FIX 6: Improved Image Preview with better error handling */}
			{preview && !imageLoadError && (
				<div className="relative">
					<div className="relative group">
						{/* ✅ Loading state while image loads */}
						{!imageLoaded && (
							<div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
								<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
							</div>
						)}

						<img
							src={preview}
							alt="Preview"
							className={`w-full object-cover rounded-lg border ${
								type === 'profile' ? 'h-40' : 'h-48'
							} ${
								!imageLoaded ? 'opacity-0' : 'opacity-100'
							} transition-opacity duration-300`}
							onLoad={handleImageLoad}
							onError={handleImageError}
							crossOrigin="anonymous"
						/>

						{/* Image overlay with actions - only show when image is loaded */}
						{imageLoaded && (
							<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
								<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
									<Button
										type="button"
										variant="secondary"
										size="sm"
										onClick={() => window.open(preview, '_blank')}
										className="bg-white/90 hover:bg-white"
										disabled={disabled}>
										<ExternalLink className="h-4 w-4 mr-1" />
										View
									</Button>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										onClick={clearImage}
										className="bg-red-500/90 hover:bg-red-500"
										disabled={disabled}>
										<Trash2 className="h-4 w-4 mr-1" />
										Remove
									</Button>
								</div>
							</div>
						)}

						{/* Clear button (always visible on mobile) */}
						{imageLoaded && (
							<Button
								type="button"
								variant="destructive"
								size="sm"
								onClick={clearImage}
								className="absolute top-2 right-2 md:hidden"
								disabled={disabled}>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>

					{/* Image info - only show when loaded */}
					{imageLoaded && (
						<div className="mt-2 text-xs text-gray-500">
							<p>✓ Image uploaded successfully</p>
							<p>📁 Stored on server</p>
						</div>
					)}
				</div>
			)}

			{/* Show error state instead of broken image */}
			{imageLoadError && (
				<div className="relative">
					<Card className="border-red-200 bg-red-50">
						<CardContent className="flex flex-col items-center justify-center py-10">
							<AlertCircle className="h-12 w-12 text-red-400 mb-2" />
							<p className="text-sm text-red-600 text-center">
								Image took too long to load. The upload might have succeeded -
								try refreshing the page.
							</p>
							<div className="flex gap-2 mt-3">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										setImageLoadError(false);
										setImageLoaded(false);
										// Try to reload the image
										const img = new Image();
										img.onload = () => setImageLoaded(true);
										img.src = preview;
									}}
									className="text-xs">
									<Upload className="h-4 w-4 mr-1" />
									Retry
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={clearImage}
									className="text-xs">
									<Trash2 className="h-4 w-4 mr-1" />
									Clear
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
};

export default ImageUpload;
