// components/ServiceDetail.jsx
import { Badge } from '@/components/ui/badge';
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
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	CheckCircle,
	Edit3,
	Eye,
	MapPin,
	Plus,
	Save,
	Star,
	X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import ImageUpload from './ImageUpload';

const ServiceDetail = () => {
	const { serviceId } = useParams();
	// const navigate = useNavigate();

	const [service, setService] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [unsavedChanges, setUnsavedChanges] = useState(false);

	// Form data state
	const [formData, setFormData] = useState({
		name: '',
		category: '',
		shortDescription: '',
		fullDescription: '',
		thumbnailImage: '',
		galleryImages: [],
		features: [],
		exclusions: [],
		serviceAvailability: 'Weekdays',
		consultationFee: 0,
		customizablePackages: false,
		materialsUsed: [],
		dimensions: {
			length: 0,
			width: 0,
			height: 0,
			unit: 'cm',
		},
		durationEstimate: '',
		availableColors: [],
		tags: [],
		location: {
			serviceableAreas: [],
			cities: [],
		},
		priceRange: {
			min: 0,
			max: 0,
			currency: 'INR',
		},
		status: 'active',
	});

	// Helper states for adding new items
	const [newFeature, setNewFeature] = useState('');
	const [newExclusion, setNewExclusion] = useState('');
	// const [newMaterial, setNewMaterial] = useState('');
	// const [newColor, setNewColor] = useState('');
	const [newTag, setNewTag] = useState('');
	const [newArea, setNewArea] = useState('');
	const [newCity, setNewCity] = useState('');

	const serviceAvailabilityOptions = ['Weekdays', 'Weekends', '24x7'];
	const statusOptions = ['active', 'inactive', 'draft'];
	// const dimensionUnits = ['cm', 'm', 'ft', 'in'];

	// Categories from your previous form
	const categories = [
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

	// Fetch service details
	useEffect(() => {
		if (serviceId) {
			fetchServiceDetails();
		}
	}, [serviceId]);

	const fetchServiceDetails = async () => {
		try {
			setLoading(true);
			setError('');
			const response = await productAPI.getById(serviceId);
			const serviceData = response.data.product || response.data;

			if (!serviceData) {
				throw new Error('Service not found');
			}

			setService(serviceData);
			setFormData({
				name: serviceData.name || '',
				category: serviceData.category || '',
				shortDescription: serviceData.shortDescription || '',
				fullDescription: serviceData.fullDescription || '',
				thumbnailImage: serviceData.thumbnailImage || '',
				galleryImages: serviceData.galleryImages || [],
				features: serviceData.features || [],
				exclusions: serviceData.exclusions || [],
				serviceAvailability: serviceData.serviceAvailability || 'Weekdays',
				consultationFee: serviceData.consultationFee || 0,
				customizablePackages: serviceData.customizablePackages || false,
				materialsUsed: serviceData.materialsUsed || [],
				dimensions: serviceData.dimensions || {
					length: 0,
					width: 0,
					height: 0,
					unit: 'cm',
				},
				durationEstimate: serviceData.durationEstimate || '',
				availableColors: serviceData.availableColors || [],
				tags: serviceData.tags || [],
				location: serviceData.location || {
					serviceableAreas: [],
					cities: [],
				},
				priceRange: serviceData.priceRange || {
					min: 0,
					max: 0,
					currency: 'INR',
				},
				status: serviceData.status || 'active',
			});
		} catch (err) {
			console.error('Error fetching service:', err);
			setError(
				err.response?.data?.message || err.message || 'Failed to load service'
			);
		} finally {
			setLoading(false);
		}
	};

	// Handle input changes
	const handleInputChange = (field, value) => {
		if (!editMode) return;

		setUnsavedChanges(true);

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

	// Handle array operations
	const addToArray = (field, value, setter) => {
		if (!editMode || !value.trim()) return;

		const trimmedValue = value.trim();
		if (field.includes('.')) {
			const [parent, child] = field.split('.');
			setFormData((prev) => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: [...prev[parent][child], trimmedValue],
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[field]: [...prev[field], trimmedValue],
			}));
		}
		setter('');
		setUnsavedChanges(true);
	};

	const removeFromArray = (field, index) => {
		if (!editMode) return;

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
		setUnsavedChanges(true);
	};

	// Save changes
	const handleSave = async () => {
		if (!editMode) return;

		setSaving(true);
		setError('');
		setSuccess('');

		try {
			const response = await productAPI.update(serviceId, formData);
			const updatedService = response.data.product || response.data;

			setService(updatedService);
			setEditMode(false);
			setUnsavedChanges(false);
			setSuccess('Service updated successfully!');

			setTimeout(() => setSuccess(''), 5000);
		} catch (err) {
			console.error('Error updating service:', err);
			setError(
				err.response?.data?.message || err.message || 'Failed to update service'
			);
		} finally {
			setSaving(false);
		}
	};

	// Cancel edit mode
	const handleCancel = () => {
		if (unsavedChanges) {
			if (
				window.confirm(
					'You have unsaved changes. Are you sure you want to cancel?'
				)
			) {
				setEditMode(false);
				setUnsavedChanges(false);
				fetchServiceDetails(); // Reset form data
			}
		} else {
			setEditMode(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading service details...</p>
				</div>
			</div>
		);
	}

	if (!service) {
		return (
			<div className="max-w-4xl mx-auto">
				<Card className="border-red-200 bg-red-50">
					<CardContent className="pt-6">
						<div className="text-center">
							<AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-red-900 mb-2">
								Service Not Found
							</h3>
							<p className="text-red-700 mb-4">
								The service you're looking for doesn't exist or has been
								removed.
							</p>
							<Link to="/vendor-dashboard/services">
								<Button variant="outline">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to Services
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Link to="/vendor-dashboard/services">
						<Button variant="outline" size="sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Services
						</Button>
					</Link>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">{service.name}</h1>
						<p className="text-gray-600">
							{editMode ? 'Edit service details' : 'View service details'}
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-4">
					<Badge
						variant={service.status === 'active' ? 'default' : 'secondary'}
						className={`${
							service.status === 'active'
								? 'bg-green-500'
								: service.status === 'draft'
								? 'bg-yellow-500'
								: 'bg-gray-500'
						}`}>
						{service.status}
					</Badge>
					{editMode ? (
						<div className="flex space-x-2">
							<Button
								variant="outline"
								onClick={handleCancel}
								disabled={saving}>
								<X className="h-4 w-4 mr-2" />
								Cancel
							</Button>
							<Button onClick={handleSave} disabled={saving || !unsavedChanges}>
								<Save className="h-4 w-4 mr-2" />
								{saving ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>
					) : (
						<Button onClick={() => setEditMode(true)}>
							<Edit3 className="h-4 w-4 mr-2" />
							Edit Service
						</Button>
					)}
				</div>
			</div>

			{/* Messages */}
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

			{success && (
				<Card className="border-green-200 bg-green-50">
					<CardContent className="pt-6">
						<div className="flex items-center space-x-2 text-green-600">
							<CheckCircle className="h-5 w-5" />
							<span>{success}</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Service Overview */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle>Service Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{editMode ? (
								<>
									<div>
										<Label htmlFor="name">Service Name *</Label>
										<Input
											id="name"
											value={formData.name}
											onChange={(e) =>
												handleInputChange('name', e.target.value)
											}
											placeholder="Enter service name"
										/>
									</div>
									<div>
										<Label htmlFor="category">Category *</Label>
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
									</div>
									<div>
										<Label htmlFor="shortDescription">
											Short Description *
										</Label>
										<Input
											id="shortDescription"
											value={formData.shortDescription}
											onChange={(e) =>
												handleInputChange('shortDescription', e.target.value)
											}
											placeholder="Brief description of your service"
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
											placeholder="Detailed description of your service"
											rows={4}
										/>
									</div>
								</>
							) : (
								<>
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											{service.name}
										</h3>
										<Badge variant="outline" className="mb-4">
											{service.category}
										</Badge>
										<p className="text-gray-600 mb-4">
											{service.shortDescription}
										</p>
										{service.fullDescription && (
											<div>
												<h4 className="font-medium text-gray-900 mb-2">
													Full Description
												</h4>
												<p className="text-gray-600">
													{service.fullDescription}
												</p>
											</div>
										)}
									</div>
								</>
							)}
						</CardContent>
					</Card>

					{/* Pricing */}
					<Card>
						<CardHeader>
							<CardTitle>Pricing Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{editMode ? (
								<>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
									</div>
									<div>
										<Label htmlFor="consultationFee">
											Consultation Fee (₹)
										</Label>
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
								</>
							) : (
								<div className="space-y-4">
									<div>
										<h4 className="font-medium text-gray-900 mb-2">
											Price Range
										</h4>
										<p className="text-2xl font-bold text-green-600">
											₹{service.priceRange?.min?.toLocaleString() || '0'} - ₹
											{service.priceRange?.max?.toLocaleString() || '0'}
										</p>
									</div>
									{service.consultationFee > 0 && (
										<div>
											<h4 className="font-medium text-gray-900 mb-2">
												Consultation Fee
											</h4>
											<p className="text-lg font-semibold text-blue-600">
												₹{service.consultationFee.toLocaleString()}
											</p>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Features & Exclusions */}
					<Card>
						<CardHeader>
							<CardTitle>Service Features</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Features */}
							<div>
								<Label className="text-sm font-medium mb-2 block">
									What's Included
								</Label>
								{editMode && (
									<div className="flex space-x-2 mb-3">
										<Input
											value={newFeature}
											onChange={(e) => setNewFeature(e.target.value)}
											placeholder="e.g., 3D Design Visualization"
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													addToArray('features', newFeature, setNewFeature);
												}
											}}
										/>
										<Button
											type="button"
											onClick={() =>
												addToArray('features', newFeature, setNewFeature)
											}>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								)}
								<div className="flex flex-wrap gap-2">
									{formData.features.map((feature, index) => (
										<Badge
											key={index}
											variant="secondary"
											className="flex items-center gap-1">
											{feature}
											{editMode && (
												<button
													type="button"
													onClick={() => removeFromArray('features', index)}
													className="ml-1 text-red-600 hover:text-red-800">
													<X className="h-3 w-3" />
												</button>
											)}
										</Badge>
									))}
								</div>
							</div>

							{/* Exclusions */}
							<div>
								<Label className="text-sm font-medium mb-2 block">
									What's Not Included
								</Label>
								{editMode && (
									<div className="flex space-x-2 mb-3">
										<Input
											value={newExclusion}
											onChange={(e) => setNewExclusion(e.target.value)}
											placeholder="e.g., Furniture cost"
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													addToArray(
														'exclusions',
														newExclusion,
														setNewExclusion
													);
												}
											}}
										/>
										<Button
											type="button"
											onClick={() =>
												addToArray('exclusions', newExclusion, setNewExclusion)
											}>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								)}
								<div className="flex flex-wrap gap-2">
									{formData.exclusions.map((exclusion, index) => (
										<Badge
											key={index}
											variant="outline"
											className="flex items-center gap-1 border-red-200 text-red-700">
											{exclusion}
											{editMode && (
												<button
													type="button"
													onClick={() => removeFromArray('exclusions', index)}
													className="ml-1 text-red-600 hover:text-red-800">
													<X className="h-3 w-3" />
												</button>
											)}
										</Badge>
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
							{editMode ? (
								<>
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
											<Label htmlFor="durationEstimate">
												Duration Estimate
											</Label>
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

									<div>
										<Label htmlFor="status">Status</Label>
										<Select
											value={formData.status}
											onValueChange={(value) =>
												handleInputChange('status', value)
											}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{statusOptions.map((status) => (
													<SelectItem key={status} value={status}>
														{status.charAt(0).toUpperCase() + status.slice(1)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
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
								</>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<h4 className="font-medium text-gray-900 mb-1">
											Service Availability
										</h4>
										<p className="text-gray-600">
											{service.serviceAvailability}
										</p>
									</div>
									{service.durationEstimate && (
										<div>
											<h4 className="font-medium text-gray-900 mb-1">
												Duration Estimate
											</h4>
											<p className="text-gray-600">
												{service.durationEstimate}
											</p>
										</div>
									)}
									<div>
										<h4 className="font-medium text-gray-900 mb-1">
											Customizable Packages
										</h4>
										<p className="text-gray-600">
											{service.customizablePackages
												? 'Available'
												: 'Not Available'}
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Service Areas */}
					<Card>
						<CardHeader>
							<CardTitle>Service Areas</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Cities */}
							<div>
								<Label className="text-sm font-medium mb-2 block">
									Cities You Serve
								</Label>
								{editMode && (
									<div className="flex space-x-2 mb-3">
										<Input
											value={newCity}
											onChange={(e) => setNewCity(e.target.value)}
											placeholder="e.g., Mumbai"
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													addToArray('location.cities', newCity, setNewCity);
												}
											}}
										/>
										<Button
											type="button"
											onClick={() =>
												addToArray('location.cities', newCity, setNewCity)
											}>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								)}
								<div className="flex flex-wrap gap-2">
									{formData.location.cities.map((city, index) => (
										<Badge
											key={index}
											variant="secondary"
											className="flex items-center gap-1">
											<MapPin className="h-3 w-3" />
											{city}
											{editMode && (
												<button
													type="button"
													onClick={() =>
														removeFromArray('location.cities', index)
													}
													className="ml-1 text-red-600 hover:text-red-800">
													<X className="h-3 w-3" />
												</button>
											)}
										</Badge>
									))}
								</div>
							</div>

							{/* Serviceable Areas */}
							<div>
								<Label className="text-sm font-medium mb-2 block">
									States/Areas You Serve
								</Label>
								{editMode && (
									<div className="flex space-x-2 mb-3">
										<Input
											value={newArea}
											onChange={(e) => setNewArea(e.target.value)}
											placeholder="e.g., Maharashtra"
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													addToArray(
														'location.serviceableAreas',
														newArea,
														setNewArea
													);
												}
											}}
										/>
										<Button
											type="button"
											onClick={() =>
												addToArray(
													'location.serviceableAreas',
													newArea,
													setNewArea
												)
											}>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								)}
								<div className="flex flex-wrap gap-2">
									{formData.location.serviceableAreas.map((area, index) => (
										<Badge
											key={index}
											variant="outline"
											className="flex items-center gap-1">
											<MapPin className="h-3 w-3" />
											{area}
											{editMode && (
												<button
													type="button"
													onClick={() =>
														removeFromArray('location.serviceableAreas', index)
													}
													className="ml-1 text-red-600 hover:text-red-800">
													<X className="h-3 w-3" />
												</button>
											)}
										</Badge>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Service Image */}
					<Card>
						<CardHeader>
							<CardTitle>Service Image</CardTitle>
						</CardHeader>
						<CardContent>
							{editMode ? (
								<ImageUpload
									label="Service Image"
									currentImage={formData.thumbnailImage}
									onImageChange={(url) =>
										handleInputChange('thumbnailImage', url)
									}
									type="service"
									className="w-full"
								/>
							) : (
								<div className="aspect-video relative rounded-lg overflow-hidden">
									<img
										src={
											service.thumbnailImage ||
											'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg'
										}
										alt={service.name}
										className="w-full h-full object-cover"
										onError={(e) => {
											e.target.src =
												'https://images.pexels.com/photos/3797991/pexels-photo-3797991.jpeg';
										}}
									/>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Service Stats */}
					<Card>
						<CardHeader>
							<CardTitle>Service Statistics</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Star className="h-4 w-4 text-yellow-400 fill-current" />
									<span className="text-sm text-gray-600">Rating</span>
								</div>
								<span className="font-semibold">
									{service.rating || 0}/5 ({service.reviewCount || 0} reviews)
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Eye className="h-4 w-4 text-blue-600" />
									<span className="text-sm text-gray-600">Views</span>
								</div>
								<span className="font-semibold">{service.views || 0}</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Calendar className="h-4 w-4 text-green-600" />
									<span className="text-sm text-gray-600">Created</span>
								</div>
								<span className="font-semibold">
									{new Date(service.createdAt).toLocaleDateString()}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Calendar className="h-4 w-4 text-purple-600" />
									<span className="text-sm text-gray-600">Updated</span>
								</div>
								<span className="font-semibold">
									{new Date(service.updatedAt).toLocaleDateString()}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Tags */}
					{(formData.tags.length > 0 || editMode) && (
						<Card>
							<CardHeader>
								<CardTitle>Tags</CardTitle>
							</CardHeader>
							<CardContent>
								{editMode && (
									<div className="flex space-x-2 mb-3">
										<Input
											value={newTag}
											onChange={(e) => setNewTag(e.target.value)}
											placeholder="Add tag"
											onKeyPress={(e) => {
												if (e.key === 'Enter') {
													e.preventDefault();
													addToArray('tags', newTag, setNewTag);
												}
											}}
										/>
										<Button
											type="button"
											onClick={() => addToArray('tags', newTag, setNewTag)}>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								)}
								<div className="flex flex-wrap gap-2">
									{formData.tags.map((tag, index) => (
										<Badge
											key={index}
											variant="outline"
											className="flex items-center gap-1">
											#{tag}
											{editMode && (
												<button
													type="button"
													onClick={() => removeFromArray('tags', index)}
													className="ml-1 text-red-600 hover:text-red-800">
													<X className="h-3 w-3" />
												</button>
											)}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
};

export default ServiceDetail;
