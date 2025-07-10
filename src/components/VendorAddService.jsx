import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { productAPI } from '../services/api';
import ImageUpload from './ImageUpload';

const VendorAddService = () => {
	const { vendorData } = useOutletContext();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [categoriesLoading, setCategoriesLoading] = useState(true);
	const [categories, setCategories] = useState([]);

	// ✅ Update the useEffect for fetching categories
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				setCategoriesLoading(true);
				console.log('🔍 Fetching categories from API...');

				const response = await productAPI.getCategories();
				console.log('✅ Categories response:', response.data);

				let categoriesData = [];
				if (response.data?.categories) {
					categoriesData = response.data.categories;
				} else if (Array.isArray(response.data)) {
					categoriesData = response.data;
				} else {
					console.warn('⚠️ Unexpected categories response structure');
					categoriesData = [
						'Kitchen Design',
						'Living Room Design',
						'Bedroom Design',
						'Bathroom Design',
						'Office Design',
						'Full Home Design',
						'Consultation',
						'3D Visualization',
						'Interior Architecture',
						'Furniture Design',
					];
				}

				setCategories(categoriesData);
				console.log('✅ Categories loaded:', categoriesData);
			} catch (error) {
				console.error('❌ Error fetching categories:', error);
				// Set fallback categories
				setCategories([
					'Kitchen Design',
					'Living Room Design',
					'Bedroom Design',
					'Bathroom Design',
					'Office Design',
					'Full Home Design',
					'Consultation',
					'3D Visualization',
				]);
			} finally {
				setCategoriesLoading(false);
			}
		};

		fetchCategories();
	}, []);

	const [formData, setFormData] = useState({
		name: '',
		category: '',
		priceRange: {
			min: '',
			max: '',
		},
		shortDescription: '',
		fullDescription: '',
		thumbnailImage: '',
		galleryImages: [],
		features: [],
		exclusions: [],
		serviceAvailability: 'Weekdays',
		consultationFee: '',
		customizablePackages: false,
		materialsUsed: [],
		dimensions: {
			length: '',
			width: '',
			height: '',
			unit: 'cm',
		},
		durationEstimate: '',
		availableColors: [],
		tags: [],
		location: {
			serviceableAreas: [],
			cities: [],
		},
	});

	const [currentFeature, setCurrentFeature] = useState('');
	const [currentExclusion, setCurrentExclusion] = useState('');
	const [currentArea, setCurrentArea] = useState('');
	const [currentCity, setCurrentCity] = useState('');

	const serviceAvailabilityOptions = ['Weekdays', 'Weekends', '24x7'];

	const handleInputChange = (field, value) => {
		if (field.includes('.')) {
			const fieldParts = field.split('.');
			setFormData((prev) => {
				const newData = { ...prev };
				let current = newData;

				for (let i = 0; i < fieldParts.length - 1; i++) {
					current[fieldParts[i]] = { ...current[fieldParts[i]] };
					current = current[fieldParts[i]];
				}

				current[fieldParts[fieldParts.length - 1]] = value;
				return newData;
			});
		} else {
			setFormData((prev) => ({
				...prev,
				[field]: value,
			}));
		}
	};

	const handleArrayAdd = (field, value, setter) => {
		if (value.trim()) {
			if (field.includes('.')) {
				const [parent, child] = field.split('.');
				setFormData((prev) => ({
					...prev,
					[parent]: {
						...prev[parent],
						[child]: [...prev[parent][child], value.trim()],
					},
				}));
			} else {
				setFormData((prev) => ({
					...prev,
					[field]: [...prev[field], value.trim()],
				}));
			}
			setter('');
		}
	};

	const handleArrayRemove = (field, index) => {
		if (field.includes('.')) {
			const [parent, child] = field.split('.');
			setFormData((prev) => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: prev[parent][child].filter((_, i) => i !== index),
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[field]: prev[field].filter((_, i) => i !== index),
			}));
		}
	};
	// ✅ Enhanced handleSubmit with detailed logging
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			console.log('🔍 FORM SUBMIT STARTED');
			console.log('🔍 Raw form data:', JSON.stringify(formData, null, 2));
			console.log('🔍 Vendor data:', JSON.stringify(vendorData, null, 2));

			// Enhanced validation with logging
			console.log('🔍 Starting validation checks...');

			if (!formData.name?.trim()) {
				console.log('❌ Validation failed: name is empty');
				setError('Service name is required');
				return;
			}
			console.log('✅ Name validation passed:', formData.name);

			if (!formData.category) {
				console.log('❌ Validation failed: category is empty');
				setError('Please select a category');
				return;
			}
			console.log('✅ Category validation passed:', formData.category);

			if (!formData.shortDescription?.trim()) {
				console.log('❌ Validation failed: shortDescription is empty');
				setError('Short description is required');
				return;
			}
			console.log('✅ Short description validation passed');

			if (!vendorData?._id) {
				console.log('❌ Validation failed: vendorData._id is missing');
				console.log('❌ vendorData:', vendorData);
				setError('Vendor information not found. Please refresh and try again.');
				return;
			}
			console.log('✅ Vendor ID validation passed:', vendorData._id);

			// ✅ Prepare clean service data with logging
			const serviceData = {
				name: formData.name.trim(),
				category: formData.category,
				shortDescription: formData.shortDescription.trim(),
				fullDescription: formData.fullDescription?.trim() || '',
				thumbnailImage: formData.thumbnailImage || '',
				galleryImages: formData.galleryImages || [],
				features: formData.features || [],
				exclusions: formData.exclusions || [],
				serviceAvailability: formData.serviceAvailability,
				customizablePackages: formData.customizablePackages,
				materialsUsed: formData.materialsUsed || [],
				dimensions: {
					length: parseFloat(formData.dimensions.length) || 0,
					width: parseFloat(formData.dimensions.width) || 0,
					height: parseFloat(formData.dimensions.height) || 0,
					unit: formData.dimensions.unit || 'cm',
				},
				durationEstimate: formData.durationEstimate?.trim() || '',
				availableColors: formData.availableColors || [],
				tags: formData.tags || [],
				location: {
					serviceableAreas: formData.location?.serviceableAreas || [],
					cities: formData.location?.cities || [],
				},
				priceRange: {
					min: parseFloat(formData.priceRange.min) || 0,
					max: parseFloat(formData.priceRange.max) || 0,
					currency: 'INR',
				},
				consultationFee: parseFloat(formData.consultationFee) || 0,
				// Required fields
				vendorId: vendorData._id,
				vendorName: vendorData.title || vendorData.name,
				status: 'active',
			};

			console.log('🔍 FINAL SERVICE DATA TO BE SENT:');
			console.log(JSON.stringify(serviceData, null, 2));

			// Check for any undefined or null values
			const hasUndefined = Object.entries(serviceData).some(([key, value]) => {
				if (value === undefined || value === null) {
					console.log(`❌ Found undefined/null value for key: ${key}`);
					return true;
				}
				return false;
			});

			if (hasUndefined) {
				console.log('❌ Service data contains undefined/null values');
			}

			console.log('🔍 Making API call...');
			const response = await productAPI.create(serviceData);

			console.log('✅ API Response received:', response);
			console.log('✅ Response data:', response.data);

			if (response.data) {
				console.log('✅ Service created successfully:', response.data);
				alert('Service added successfully!');
				navigate('/vendor-dashboard/services');
			}
		} catch (err) {
			console.error('❌ COMPLETE ERROR OBJECT:', err);
			console.error('❌ Error message:', err.message);
			console.error('❌ Error response:', err.response);
			console.error('❌ Error response data:', err.response?.data);
			console.error('❌ Error response status:', err.response?.status);
			console.error('❌ Error stack:', err.stack);

			// Enhanced error handling with detailed logging
			let errorMessage = 'Failed to create service. Please try again.';

			if (err.response?.data?.message) {
				errorMessage = err.response.data.message;
				console.log('❌ Using response message:', errorMessage);
			} else if (err.response?.data?.errors) {
				const errors = err.response.data.errors;
				console.log('❌ Response errors array:', errors);
				if (Array.isArray(errors) && errors.length > 0) {
					errorMessage = `Validation errors: ${errors
						.map((e) => e.message || e)
						.join(', ')}`;
				}
			} else if (err.response?.data?.error) {
				errorMessage = err.response.data.error;
				console.log('❌ Using response error:', errorMessage);
			}

			console.log('❌ Final error message to show:', errorMessage);
			setError(errorMessage);
		} finally {
			setLoading(false);
			console.log('🔍 FORM SUBMIT COMPLETED');
		}
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
				<Button
					variant="outline"
					onClick={() => navigate('/vendor-dashboard/services')}>
					Cancel
				</Button>
			</div>

			{/* Error Display */}
			{error && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="pt-6">
						<div className="flex items-center space-x-2 text-red-600">
							<AlertCircle className="h-5 w-5" />
							<span>{error}</span>
						</div>
					</CardContent>
				</Card>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="name">Service Name *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => handleInputChange('name', e.target.value)}
									placeholder="e.g., Modern Kitchen Design"
									required
								/>
							</div>
							<div>
								<Label htmlFor="category">Category *</Label>
								{categoriesLoading ? (
									<div className="flex items-center justify-center h-10 border rounded-md">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
									</div>
								) : (
									<Select
										value={formData.category}
										onValueChange={(value) =>
											handleInputChange('category', value)
										}>
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((category) => (
												<SelectItem key={category} value={category}>
													{category}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>
						</div>

						<div>
							<Label htmlFor="shortDescription">Short Description *</Label>
							<Input
								id="shortDescription"
								value={formData.shortDescription}
								onChange={(e) =>
									handleInputChange('shortDescription', e.target.value)
								}
								placeholder="Brief description of your service"
								required
							/>
						</div>

						<div>
							<Label htmlFor="fullDescription">Full Description</Label>
							<Textarea
								id="fullDescription"
								value={formData.fullDescription}
								onChange={(e) =>
									handleInputChange('fullDescription', e.target.value)
								}
								placeholder="Detailed description of your service and what's included"
								rows={4}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Pricing */}
				<Card>
					<CardHeader>
						<CardTitle>Pricing Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="minPrice">Minimum Price (₹)</Label>
								<Input
									id="minPrice"
									type="number"
									value={formData.priceRange.min}
									onChange={(e) =>
										handleInputChange('priceRange.min', e.target.value)
									}
									placeholder="50000"
								/>
							</div>
							<div>
								<Label htmlFor="maxPrice">Maximum Price (₹)</Label>
								<Input
									id="maxPrice"
									type="number"
									value={formData.priceRange.max}
									onChange={(e) =>
										handleInputChange('priceRange.max', e.target.value)
									}
									placeholder="200000"
								/>
							</div>
							<div>
								<Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
								<Input
									id="consultationFee"
									type="number"
									value={formData.consultationFee}
									onChange={(e) =>
										handleInputChange('consultationFee', e.target.value)
									}
									placeholder="2000"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Service Images */}
				<Card>
					<CardHeader>
						<CardTitle>Service Images</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<ImageUpload
							label="Main Service Image"
							currentImage={formData.thumbnailImage}
							onImageChange={(url) => handleInputChange('thumbnailImage', url)}
							type="service"
							className="w-full"
						/>
					</CardContent>
				</Card>

				{/* Service Features */}
				<Card>
					<CardHeader>
						<CardTitle>Service Features</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label>What's Included</Label>
							<div className="flex space-x-2">
								<Input
									value={currentFeature}
									onChange={(e) => setCurrentFeature(e.target.value)}
									placeholder="e.g., 3D Design Visualization"
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleArrayAdd(
												'features',
												currentFeature,
												setCurrentFeature
											);
										}
									}}
								/>
								<Button
									type="button"
									onClick={() =>
										handleArrayAdd(
											'features',
											currentFeature,
											setCurrentFeature
										)
									}>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							<div className="flex flex-wrap gap-2 mt-2">
								{formData.features.map((feature, index) => (
									<span
										key={index}
										className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
										{feature}
										<button
											type="button"
											onClick={() => handleArrayRemove('features', index)}
											className="ml-2 text-blue-600 hover:text-blue-800">
											<X className="h-3 w-3" />
										</button>
									</span>
								))}
							</div>
						</div>

						<div>
							<Label>What's Not Included</Label>
							<div className="flex space-x-2">
								<Input
									value={currentExclusion}
									onChange={(e) => setCurrentExclusion(e.target.value)}
									placeholder="e.g., Furniture cost"
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleArrayAdd(
												'exclusions',
												currentExclusion,
												setCurrentExclusion
											);
										}
									}}
								/>
								<Button
									type="button"
									onClick={() =>
										handleArrayAdd(
											'exclusions',
											currentExclusion,
											setCurrentExclusion
										)
									}>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							<div className="flex flex-wrap gap-2 mt-2">
								{formData.exclusions.map((exclusion, index) => (
									<span
										key={index}
										className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
										{exclusion}
										<button
											type="button"
											onClick={() => handleArrayRemove('exclusions', index)}
											className="ml-2 text-red-600 hover:text-red-800">
											<X className="h-3 w-3" />
										</button>
									</span>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Service Details */}
				<Card>
					<CardHeader>
						<CardTitle>Service Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="serviceAvailability">
									Service Availability
								</Label>
								<Select
									value={formData.serviceAvailability}
									onValueChange={(value) =>
										handleInputChange('serviceAvailability', value)
									}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{serviceAvailabilityOptions.map((option) => (
											<SelectItem key={option} value={option}>
												{option}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="durationEstimate">Duration Estimate</Label>
								<Input
									id="durationEstimate"
									value={formData.durationEstimate}
									onChange={(e) =>
										handleInputChange('durationEstimate', e.target.value)
									}
									placeholder="e.g., 3-4 weeks"
								/>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="customizablePackages"
								checked={formData.customizablePackages}
								onCheckedChange={(checked) =>
									handleInputChange('customizablePackages', checked)
								}
							/>
							<Label htmlFor="customizablePackages">
								Customizable Packages Available
							</Label>
						</div>
					</CardContent>
				</Card>

				{/* Service Areas */}
				<Card>
					<CardHeader>
						<CardTitle>Service Areas</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label>Cities You Serve</Label>
							<div className="flex space-x-2">
								<Input
									value={currentCity}
									onChange={(e) => setCurrentCity(e.target.value)}
									placeholder="e.g., Mumbai"
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleArrayAdd(
												'location.cities',
												currentCity,
												setCurrentCity
											);
										}
									}}
								/>
								<Button
									type="button"
									onClick={() =>
										handleArrayAdd(
											'location.cities',
											currentCity,
											setCurrentCity
										)
									}>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							<div className="flex flex-wrap gap-2 mt-2">
								{formData.location.cities.map((city, index) => (
									<span
										key={index}
										className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
										{city}
										<button
											type="button"
											onClick={() =>
												handleArrayRemove('location.cities', index)
											}
											className="ml-2 text-green-600 hover:text-green-800">
											<X className="h-3 w-3" />
										</button>
									</span>
								))}
							</div>
						</div>

						<div>
							<Label>States/Areas You Serve</Label>
							<div className="flex space-x-2">
								<Input
									value={currentArea}
									onChange={(e) => setCurrentArea(e.target.value)}
									placeholder="e.g., Maharashtra"
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											handleArrayAdd(
												'location.serviceableAreas',
												currentArea,
												setCurrentArea
											);
										}
									}}
								/>
								<Button
									type="button"
									onClick={() =>
										handleArrayAdd(
											'location.serviceableAreas',
											currentArea,
											setCurrentArea
										)
									}>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							<div className="flex flex-wrap gap-2 mt-2">
								{formData.location.serviceableAreas.map((area, index) => (
									<span
										key={index}
										className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
										{area}
										<button
											type="button"
											onClick={() =>
												handleArrayRemove('location.serviceableAreas', index)
											}
											className="ml-2 text-purple-600 hover:text-purple-800">
											<X className="h-3 w-3" />
										</button>
									</span>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Submit */}
				<div className="flex justify-end space-x-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate('/vendor-dashboard/services')}>
						Cancel
					</Button>
					<Button type="submit" disabled={loading}>
						{loading ? 'Creating Service...' : 'Create Service'}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default VendorAddService;
