// components/VendorProfile.jsx - Complete working version
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
import { AlertCircle, CheckCircle, Edit3, Plus, Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiUtils, vendorAPI } from '../services/api';
import ImageUpload from './ImageUpload';

const VendorProfile = () => {
	const { vendorData, setVendorData } = useOutletContext();
	const [loading, setLoading] = useState(false);
	const [dataLoading, setDataLoading] = useState(true);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [editMode, setEditMode] = useState(false);
	const [unsavedChanges, setUnsavedChanges] = useState(false);

	// ✅ Complete form data structure
	const [formData, setFormData] = useState({
		name: '',
		title: '',
		email: '',
		phone: '',
		professionType: '',
		license: '',
		about: '',
		location: {
			pincode: '',
			city: '',
			state: '',
			geo: {
				type: 'Point',
				coordinates: [0, 0],
			},
		},
		categories: [],
		projectTypes: [],
		styles: [],
		businessHighlights: [],
		languages: [],
		budgetLevel: 'Medium',
		images: {
			profileImage: '',
			coverImage: '',
			portfolio: [],
		},
		credentials: '',
		rating: 0,
		reviewCount: 0,
		status: 'pending',
	});

	// ✅ Custom input states for adding new items
	const [newCategory, setNewCategory] = useState('');
	const [newProjectType, setNewProjectType] = useState('');
	const [newStyle, setNewStyle] = useState('');
	const [newLanguage, setNewLanguage] = useState('');
	const [newHighlight, setNewHighlight] = useState('');

	// ✅ Complete form options
	const professionTypes = [
		'Interior Designer',
		'Architect',
		'Contractor',
		'Furniture Dealer',
		'Decorator',
		'Home Stylist',
		'Space Planner',
	];

	const categoryOptions = [
		'Kitchen',
		'Bedroom',
		'Living Room',
		'Bathroom',
		'Office',
		'Dining Room',
		'Balcony',
		'Pooja Room',
		'Study Room',
		'Kids Room',
		'Master Suite',
		'Guest Room',
	];

	const styleOptions = [
		'Modern',
		'Traditional',
		'Contemporary',
		'Minimalist',
		'Industrial',
		'Scandinavian',
		'Indian',
		'European',
		'Bohemian',
		'Art Deco',
		'Mediterranean',
		'Rustic',
	];

	const projectTypeOptions = [
		'Residential',
		'Commercial',
		'Industrial',
		'Hospitality',
		'Healthcare',
		'Educational',
		'Retail',
		'Office',
	];

	const languageOptions = [
		'English',
		'Hindi',
		'Bengali',
		'Telugu',
		'Marathi',
		'Tamil',
		'Gujarati',
		'Kannada',
		'Malayalam',
		'Punjabi',
		'Urdu',
		'Odia',
	];

	const budgetLevelOptions = [
		{ value: 'Low', label: 'Low (Under ₹50,000)' },
		{ value: 'Medium', label: 'Medium (₹50,000 - ₹2,00,000)' },
		{ value: 'High', label: 'High (Above ₹2,00,000)' },
	];

	// ✅ Load vendor data
	useEffect(() => {
		const loadVendorData = async () => {
			try {
				setDataLoading(true);
				setError('');

				const response = await vendorAPI.getDashboardStats();

				let userData;
				if (response.data?.data?.vendor) {
					userData = response.data.data.vendor;
				} else if (response.data?.vendor) {
					userData = response.data.vendor;
				} else {
					throw new Error('Invalid response structure');
				}

				if (!userData) {
					setError('Vendor profile not found.');
					return;
				}

				setVendorData(userData);

				// ✅ Safely populate form data
				const safeFormData = {
					name: String(userData.name || ''),
					title: String(userData.title || ''),
					email: String(userData.email || ''),
					phone: String(userData.phone || ''),
					professionType: String(userData.professionType || ''),
					license: String(userData.license || ''),
					about: String(userData.about || ''),
					location: {
						pincode: String(userData.location?.pincode || ''),
						city: String(userData.location?.city || ''),
						state: String(userData.location?.state || ''),
						geo: userData.location?.geo || {
							type: 'Point',
							coordinates: [0, 0],
						},
					},
					categories: Array.isArray(userData.categories)
						? userData.categories
						: [],
					projectTypes: Array.isArray(userData.projectTypes)
						? userData.projectTypes
						: [],
					styles: Array.isArray(userData.styles) ? userData.styles : [],
					businessHighlights: Array.isArray(userData.businessHighlights)
						? userData.businessHighlights
						: [],
					languages: Array.isArray(userData.languages)
						? userData.languages
						: [],
					budgetLevel: String(userData.budgetLevel || 'Medium'),
					images: {
						profileImage: String(userData.images?.profileImage || ''),
						coverImage: String(userData.images?.coverImage || ''),
						portfolio: Array.isArray(userData.images?.portfolio)
							? userData.images.portfolio
							: [],
					},
					credentials: String(userData.credentials || ''),
					rating: Number(userData.rating) || 0,
					reviewCount: Number(userData.reviewCount) || 0,
					status: String(userData.status || 'pending'),
				};

				setFormData(safeFormData);
			} catch (err) {
				console.error('Error loading vendor data:', err);
				setError(
					err.response?.data?.message ||
						err.message ||
						'Failed to load profile data'
				);
			} finally {
				setDataLoading(false);
			}
		};

		loadVendorData();
	}, [setVendorData]);

	// ✅ Handle input changes
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

				current[fieldParts[fieldParts.length - 1]] =
					value != null ? String(value) : '';
				return newData;
			});
		} else {
			setFormData((prev) => ({
				...prev,
				[field]: value != null ? String(value) : '',
			}));
		}
	};

	// ✅ Handle array changes (checkboxes)
	const handleArrayChange = (field, value, checked) => {
		if (!editMode) return;

		setUnsavedChanges(true);
		setFormData((prev) => ({
			...prev,
			[field]: checked
				? [...(prev[field] || []), value]
				: (prev[field] || []).filter((item) => item !== value),
		}));
	};

	// ✅ Add new items to arrays
	const addToArray = (field, value, setter) => {
		if (!editMode || !value.trim()) return;

		const trimmedValue = value.trim();
		setFormData((prev) => ({
			...prev,
			[field]: [...(prev[field] || []), trimmedValue],
		}));
		setter('');
		setUnsavedChanges(true);
	};

	// ✅ Remove items from arrays
	const removeFromArray = (field, index) => {
		if (!editMode) return;

		setFormData((prev) => ({
			...prev,
			[field]: prev[field].filter((_, i) => i !== index),
		}));
		setUnsavedChanges(true);
	};

	// ✅ Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!editMode) return;

		setLoading(true);
		setError('');
		setSuccess('');

		try {
			// ✅ Prepare data for submission
			const submitData = {
				name: String(formData.name || '').trim(),
				title: String(formData.title || '').trim(),
				email: String(formData.email || '')
					.trim()
					.toLowerCase(),
				phone: String(formData.phone || '').trim(),
				professionType: String(formData.professionType || ''),
				license: String(formData.license || '').trim(),
				about: String(formData.about || '').trim(),
				budgetLevel: String(formData.budgetLevel || 'Medium'),
				location: {
					city: String(formData.location?.city || '').trim(),
					state: String(formData.location?.state || '').trim(),
					pincode: String(formData.location?.pincode || '').trim(),
					...(formData.location?.geo && { geo: formData.location.geo }),
				},
				categories: Array.isArray(formData.categories)
					? formData.categories
					: [],
				projectTypes: Array.isArray(formData.projectTypes)
					? formData.projectTypes
					: [],
				styles: Array.isArray(formData.styles) ? formData.styles : [],
				languages: Array.isArray(formData.languages) ? formData.languages : [],
				businessHighlights: Array.isArray(formData.businessHighlights)
					? formData.businessHighlights
					: [],
				images: {
					profileImage: String(formData.images?.profileImage || '').trim(),
					coverImage: String(formData.images?.coverImage || '').trim(),
					portfolio: Array.isArray(formData.images?.portfolio)
						? formData.images.portfolio
						: [],
				},
				// ✅ Fix credentials - convert string to array
				credentials: Array.isArray(formData.credentials)
					? formData.credentials
					: formData.credentials
					? [formData.credentials]
					: [],
			};

			console.log('🔄 Updating vendor profile with data:', submitData);

			// ✅ Call the API
			const response = await vendorAPI.updateProfile(submitData);

			// ✅ Handle response
			let updatedVendor;
			if (response.data?.data?.vendor) {
				updatedVendor = response.data.data.vendor;
			} else if (response.data?.vendor) {
				updatedVendor = response.data.vendor;
			} else {
				throw new Error('Invalid response structure from server');
			}

			// ✅ Update all state
			setVendorData(updatedVendor);
			setFormData({
				name: String(updatedVendor.name || ''),
				title: String(updatedVendor.title || ''),
				email: String(updatedVendor.email || ''),
				phone: String(updatedVendor.phone || ''),
				professionType: String(updatedVendor.professionType || ''),
				license: String(updatedVendor.license || ''),
				about: String(updatedVendor.about || ''),
				location: {
					pincode: String(updatedVendor.location?.pincode || ''),
					city: String(updatedVendor.location?.city || ''),
					state: String(updatedVendor.location?.state || ''),
					geo: updatedVendor.location?.geo || {
						type: 'Point',
						coordinates: [0, 0],
					},
				},
				categories: Array.isArray(updatedVendor.categories)
					? updatedVendor.categories
					: [],
				projectTypes: Array.isArray(updatedVendor.projectTypes)
					? updatedVendor.projectTypes
					: [],
				styles: Array.isArray(updatedVendor.styles) ? updatedVendor.styles : [],
				businessHighlights: Array.isArray(updatedVendor.businessHighlights)
					? updatedVendor.businessHighlights
					: [],
				languages: Array.isArray(updatedVendor.languages)
					? updatedVendor.languages
					: [],
				budgetLevel: String(updatedVendor.budgetLevel || 'Medium'),
				images: {
					profileImage: String(updatedVendor.images?.profileImage || ''),
					coverImage: String(updatedVendor.images?.coverImage || ''),
					portfolio: Array.isArray(updatedVendor.images?.portfolio)
						? updatedVendor.images.portfolio
						: [],
				},
				credentials: String(updatedVendor.credentials || ''),
				rating: Number(updatedVendor.rating) || 0,
				reviewCount: Number(updatedVendor.reviewCount) || 0,
				status: String(updatedVendor.status || 'pending'),
			});

			apiUtils.updateCachedProfile(updatedVendor);
			setEditMode(false);
			setUnsavedChanges(false);
			setSuccess('Profile updated successfully!');

			setTimeout(() => setSuccess(''), 5000);
		} catch (err) {
			console.error('Profile update error:', err);
			setError(
				err.response?.data?.message || err.message || 'Failed to update profile'
			);
		} finally {
			setLoading(false);
		}
	};

	if (dataLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading profile data...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
					<p className="text-gray-600">
						{editMode
							? 'Edit your professional profile'
							: 'View your professional profile'}
					</p>
				</div>
				<div className="flex items-center space-x-4">
					<div className="flex items-center space-x-2">
						<Badge variant="outline">⭐ {formData.rating.toFixed(1)}/5</Badge>
						<Badge variant="outline">{formData.reviewCount} reviews</Badge>
					</div>
					<Button
						onClick={() => setEditMode(!editMode)}
						variant={editMode ? 'outline' : 'default'}>
						<Edit3 className="h-4 w-4 mr-2" />
						{editMode ? 'Cancel Edit' : 'Edit Profile'}
					</Button>
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

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Personal Information */}
				<Card>
					<CardHeader>
						<CardTitle>Personal Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="name">Full Name *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => handleInputChange('name', e.target.value)}
									placeholder="Your full name"
									disabled={!editMode}
									required
								/>
							</div>
							<div>
								<Label htmlFor="email">Email *</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange('email', e.target.value)}
									placeholder="your@email.com"
									disabled={!editMode}
									required
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="phone">Phone Number</Label>
							<Input
								id="phone"
								value={formData.phone}
								onChange={(e) => handleInputChange('phone', e.target.value)}
								placeholder="+91 98765 43210"
								disabled={!editMode}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Business Information */}
				<Card>
					<CardHeader>
						<CardTitle>Business Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="title">Company/Business Name *</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) => handleInputChange('title', e.target.value)}
								placeholder="Your business name"
								disabled={!editMode}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="professionType">Profession Type *</Label>
								<Select
									value={formData.professionType}
									onValueChange={(value) =>
										handleInputChange('professionType', value)
									}
									disabled={!editMode}>
									<SelectTrigger>
										<SelectValue placeholder="Select profession" />
									</SelectTrigger>
									<SelectContent>
										{professionTypes.map((type) => (
											<SelectItem key={type} value={type}>
												{type}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="license">License Number</Label>
								<Input
									id="license"
									value={formData.license}
									onChange={(e) => handleInputChange('license', e.target.value)}
									placeholder="Your license number"
									disabled={!editMode}
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="about">About Your Business</Label>
							<Textarea
								id="about"
								value={formData.about}
								onChange={(e) => handleInputChange('about', e.target.value)}
								placeholder="Describe your business and expertise"
								rows={4}
								disabled={!editMode}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Location Information */}
				<Card>
					<CardHeader>
						<CardTitle>Location</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="city">City *</Label>
								<Input
									id="city"
									value={formData.location.city}
									onChange={(e) =>
										handleInputChange('location.city', e.target.value)
									}
									placeholder="Your city"
									disabled={!editMode}
									required
								/>
							</div>
							<div>
								<Label htmlFor="state">State *</Label>
								<Input
									id="state"
									value={formData.location.state}
									onChange={(e) =>
										handleInputChange('location.state', e.target.value)
									}
									placeholder="Your state"
									disabled={!editMode}
									required
								/>
							</div>
							<div>
								<Label htmlFor="pincode">Pincode *</Label>
								<Input
									id="pincode"
									value={formData.location.pincode}
									onChange={(e) =>
										handleInputChange('location.pincode', e.target.value)
									}
									placeholder="123456"
									disabled={!editMode}
									required
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* ✅ Service Categories */}
				<Card>
					<CardHeader>
						<CardTitle>Service Categories</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{categoryOptions.map((category) => (
								<div key={category} className="flex items-center space-x-2">
									<Checkbox
										id={category}
										checked={formData.categories.includes(category)}
										onCheckedChange={(checked) =>
											handleArrayChange('categories', category, checked)
										}
										disabled={!editMode}
									/>
									<Label htmlFor={category} className="text-sm">
										{category}
									</Label>
								</div>
							))}
						</div>

						{/* ✅ Add Custom Category */}
						{editMode && (
							<div className="mt-4 p-4 bg-gray-50 rounded-lg">
								<Label className="text-sm font-medium mb-2 block">
									Add Custom Category
								</Label>
								<div className="flex space-x-2">
									<Input
										placeholder="Enter custom category"
										value={newCategory}
										onChange={(e) => setNewCategory(e.target.value)}
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												addToArray('categories', newCategory, setNewCategory);
											}
										}}
									/>
									<Button
										type="button"
										onClick={() =>
											addToArray('categories', newCategory, setNewCategory)
										}>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)}

						{/* ✅ Show Selected Categories */}
						{formData.categories.length > 0 && (
							<div className="mt-4">
								<Label className="text-sm font-medium mb-2 block">
									Selected Categories:
								</Label>
								<div className="flex flex-wrap gap-2">
									{formData.categories.map((category, index) => (
										<Badge
											key={index}
											variant="secondary"
											className="flex items-center gap-1">
											{category}
											{editMode && (
												<button
													type="button"
													onClick={() => removeFromArray('categories', index)}
													className="ml-1 text-red-600 hover:text-red-800">
													<X className="h-3 w-3" />
												</button>
											)}
										</Badge>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* ✅ Project Types */}
				<Card>
					<CardHeader>
						<CardTitle>Project Types</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{projectTypeOptions.map((type) => (
								<div key={type} className="flex items-center space-x-2">
									<Checkbox
										id={type}
										checked={formData.projectTypes.includes(type)}
										onCheckedChange={(checked) =>
											handleArrayChange('projectTypes', type, checked)
										}
										disabled={!editMode}
									/>
									<Label htmlFor={type} className="text-sm">
										{type}
									</Label>
								</div>
							))}
						</div>

						{editMode && (
							<div className="mt-4 p-4 bg-gray-50 rounded-lg">
								<Label className="text-sm font-medium mb-2 block">
									Add Custom Project Type
								</Label>
								<div className="flex space-x-2">
									<Input
										placeholder="Enter custom project type"
										value={newProjectType}
										onChange={(e) => setNewProjectType(e.target.value)}
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												addToArray(
													'projectTypes',
													newProjectType,
													setNewProjectType
												);
											}
										}}
									/>
									<Button
										type="button"
										onClick={() =>
											addToArray(
												'projectTypes',
												newProjectType,
												setNewProjectType
											)
										}>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)}

						{formData.projectTypes.length > 0 && (
							<div className="mt-4">
								<Label className="text-sm font-medium mb-2 block">
									Selected Project Types:
								</Label>
								<div className="flex flex-wrap gap-2">
									{formData.projectTypes.map((type, index) => (
										<Badge
											key={index}
											variant="secondary"
											className="flex items-center gap-1">
											{type}
											{editMode && (
												<button
													type="button"
													onClick={() => removeFromArray('projectTypes', index)}
													className="ml-1 text-red-600 hover:text-red-800">
													<X className="h-3 w-3" />
												</button>
											)}
										</Badge>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* ✅ Design Styles */}
				<Card>
					<CardHeader>
						<CardTitle>Design Styles</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{styleOptions.map((style) => (
								<div key={style} className="flex items-center space-x-2">
									<Checkbox
										id={style}
										checked={formData.styles.includes(style)}
										onCheckedChange={(checked) =>
											handleArrayChange('styles', style, checked)
										}
										disabled={!editMode}
									/>
									<Label htmlFor={style} className="text-sm">
										{style}
									</Label>
								</div>
							))}
						</div>

						{editMode && (
							<div className="mt-4 p-4 bg-gray-50 rounded-lg">
								<Label className="text-sm font-medium mb-2 block">
									Add Custom Style
								</Label>
								<div className="flex space-x-2">
									<Input
										placeholder="Enter custom style"
										value={newStyle}
										onChange={(e) => setNewStyle(e.target.value)}
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												addToArray('styles', newStyle, setNewStyle);
											}
										}}
									/>
									<Button
										type="button"
										onClick={() => addToArray('styles', newStyle, setNewStyle)}>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)}

						{formData.styles.length > 0 && (
							<div className="mt-4">
								<Label className="text-sm font-medium mb-2 block">
									Selected Styles:
								</Label>
								<div className="flex flex-wrap gap-2">
									{formData.styles.map((style, index) => (
										<Badge
											key={index}
											variant="secondary"
											className="flex items-center gap-1">
											{style}
											{editMode && (
												<button
													type="button"
													onClick={() => removeFromArray('styles', index)}
													className="ml-1 text-red-600 hover:text-red-800">
													<X className="h-3 w-3" />
												</button>
											)}
										</Badge>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* ✅ Languages */}
				<Card>
					<CardHeader>
						<CardTitle>Languages</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{languageOptions.map((language) => (
								<div key={language} className="flex items-center space-x-2">
									<Checkbox
										id={language}
										checked={formData.languages.includes(language)}
										onCheckedChange={(checked) =>
											handleArrayChange('languages', language, checked)
										}
										disabled={!editMode}
									/>
									<Label htmlFor={language} className="text-sm">
										{language}
									</Label>
								</div>
							))}
						</div>

						{editMode && (
							<div className="mt-4 p-4 bg-gray-50 rounded-lg">
								<Label className="text-sm font-medium mb-2 block">
									Add Custom Language
								</Label>
								<div className="flex space-x-2">
									<Input
										placeholder="Enter custom language"
										value={newLanguage}
										onChange={(e) => setNewLanguage(e.target.value)}
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												addToArray('languages', newLanguage, setNewLanguage);
											}
										}}
									/>
									<Button
										type="button"
										onClick={() =>
											addToArray('languages', newLanguage, setNewLanguage)
										}>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)}

						{formData.languages.length > 0 && (
							<div className="mt-4">
								<Label className="text-sm font-medium mb-2 block">
									Selected Languages:
								</Label>
								<div className="flex flex-wrap gap-2">
									{formData.languages.map((language, index) => (
										<Badge
											key={index}
											variant="secondary"
											className="flex items-center gap-1">
											{language}
											{editMode && (
												<button
													type="button"
													onClick={() => removeFromArray('languages', index)}
													className="ml-1 text-red-600 hover:text-red-800">
													<X className="h-3 w-3" />
												</button>
											)}
										</Badge>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* ✅ Business Highlights */}
				<Card>
					<CardHeader>
						<CardTitle>Business Highlights</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{editMode && (
							<div className="p-4 bg-gray-50 rounded-lg">
								<Label className="text-sm font-medium mb-2 block">
									Add Business Highlight
								</Label>
								<div className="flex space-x-2">
									<Input
										placeholder="e.g., 500+ Happy Clients, Award Winning Design"
										value={newHighlight}
										onChange={(e) => setNewHighlight(e.target.value)}
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												addToArray(
													'businessHighlights',
													newHighlight,
													setNewHighlight
												);
											}
										}}
									/>
									<Button
										type="button"
										onClick={() =>
											addToArray(
												'businessHighlights',
												newHighlight,
												setNewHighlight
											)
										}>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)}

						{formData.businessHighlights.length > 0 && (
							<div>
								<Label className="text-sm font-medium mb-2 block">
									Current Highlights:
								</Label>
								<div className="flex flex-wrap gap-2">
									{formData.businessHighlights.map((highlight, index) => (
										<Badge
											key={index}
											variant="secondary"
											className="flex items-center gap-1">
											{highlight}
											{editMode && (
												<button
													type="button"
													onClick={() =>
														removeFromArray('businessHighlights', index)
													}
													className="ml-1 text-red-600 hover:text-red-800">
													<X className="h-3 w-3" />
												</button>
											)}
										</Badge>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Budget Level */}
				<Card>
					<CardHeader>
						<CardTitle>Budget Level</CardTitle>
					</CardHeader>
					<CardContent>
						<Select
							value={formData.budgetLevel}
							onValueChange={(value) => handleInputChange('budgetLevel', value)}
							disabled={!editMode}>
							<SelectTrigger>
								<SelectValue placeholder="Select budget range" />
							</SelectTrigger>
							<SelectContent>
								{budgetLevelOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				{/* ✅ Images */}
				<Card>
					<CardHeader>
						<CardTitle>Profile Images</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<ImageUpload
							label="Profile Image"
							currentImage={formData.images.profileImage}
							onImageChange={(url) =>
								handleInputChange('images.profileImage', url)
							}
							type="profile"
							className="w-full"
						/>

						<ImageUpload
							label="Cover Image"
							currentImage={formData.images.coverImage}
							onImageChange={(url) =>
								handleInputChange('images.coverImage', url)
							}
							type="cover"
							className="w-full"
						/>
					</CardContent>
				</Card>

				{/* Submit Button */}
				{editMode && (
					<div className="flex justify-end space-x-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setEditMode(false);
								setUnsavedChanges(false);
							}}
							disabled={loading}>
							<X className="h-4 w-4 mr-2" />
							Cancel
						</Button>
						<Button type="submit" disabled={loading} className="min-w-32">
							<Save className="h-4 w-4 mr-2" />
							{loading ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				)}
			</form>
		</div>
	);
};

export default VendorProfile;
