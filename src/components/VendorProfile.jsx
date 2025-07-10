// components/VendorProfile.jsx – fully-working version with YouTube-style header
import {
	AlertCircle,
	Camera,
	CheckCircle,
	Edit3,
	Plus,
	Save,
	Star,
	X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

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
import { apiUtils, uploadAPI, vendorAPI } from '../services/api';

const VendorProfile = () => {
	/* -------------------------------------------------------------------- */
	/*                         GLOBAL STATE & HANDLERS                      */
	/* -------------------------------------------------------------------- */
	const { vendorData, setVendorData } = useOutletContext();

	const [loading, setLoading] = useState(false);
	const [dataLoading, setDataLoading] = useState(true);
	const [imageUploading, setImageUploading] = useState({
		profile: false,
		cover: false,
	});

	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [editMode, setEditMode] = useState(false);
	const [unsavedChanges, setUnsavedChanges] = useState(false);

	/* -------------------------------------------------------------------- */
	/*                               FORM DATA                              */
	/* -------------------------------------------------------------------- */
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
			geo: { type: 'Point', coordinates: [0, 0] },
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

	/* ---------- local "add item" helpers ---------- */
	const [newCategory, setNewCategory] = useState('');
	const [newProjectType, setNewProjectType] = useState('');
	const [newStyle, setNewStyle] = useState('');
	const [newLanguage, setNewLanguage] = useState('');
	const [newHighlight, setNewHighlight] = useState('');

	/* -------------------------------------------------------------------- */
	/*                              STATIC LISTS                            */
	/* -------------------------------------------------------------------- */
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
		{ value: 'Medium', label: 'Medium (₹50,000 – ₹2,00,000)' },
		{ value: 'High', label: 'High (Above ₹2,00,000)' },
	];

	/* -------------------------------------------------------------------- */
	/*                          LOAD VENDOR PROFILE                         */
	/* -------------------------------------------------------------------- */
	useEffect(() => {
		const loadVendorData = async () => {
			try {
				setDataLoading(true);
				setError('');

				const { data } = await vendorAPI.getDashboardStats();
				const user = data?.vendor || data?.data?.vendor;
				if (!user) throw new Error('Vendor profile not found.');

				setVendorData(user);

				setFormData({
					name: user.name || '',
					title: user.title || '',
					email: user.email || '',
					phone: user.phone || '',
					professionType: user.professionType || '',
					license: user.license || '',
					about: user.about || '',
					location: {
						pincode: user.location?.pincode || '',
						city: user.location?.city || '',
						state: user.location?.state || '',
						geo: user.location?.geo || { type: 'Point', coordinates: [0, 0] },
					},
					categories: user.categories || [],
					projectTypes: user.projectTypes || [],
					styles: user.styles || [],
					businessHighlights: user.businessHighlights || [],
					languages: user.languages || [],
					budgetLevel: user.budgetLevel || 'Medium',
					images: {
						profileImage: user.images?.profileImage || '',
						coverImage: user.images?.coverImage || '',
						portfolio: user.images?.portfolio || [],
					},
					credentials: user.credentials || '',
					rating: +user.rating || 0,
					reviewCount: +user.reviewCount || 0,
					status: user.status || 'pending',
				});
			} catch (err) {
				setError(
					err.response?.data?.message || err.message || 'Failed to load profile'
				);
			} finally {
				setDataLoading(false);
			}
		};

		loadVendorData();
	}, [setVendorData]);

	/* -------------------------------------------------------------------- */
	/*                        GENERAL STATE HANDLERS                        */
	/* -------------------------------------------------------------------- */
	const handleInputChange = (field, value) => {
		if (!editMode) return;
		setUnsavedChanges(true);

		if (field.includes('.')) {
			const parts = field.split('.');
			setFormData((prev) => {
				const updated = { ...prev };
				let current = updated;
				for (let i = 0; i < parts.length - 1; i++) {
					current[parts[i]] = { ...current[parts[i]] };
					current = current[parts[i]];
				}
				current[parts.at(-1)] = value;
				return updated;
			});
		} else {
			setFormData((prev) => ({ ...prev, [field]: value }));
		}
	};

	const handleArrayChange = (field, value, checked) => {
		if (!editMode) return;
		setUnsavedChanges(true);

		setFormData((prev) => ({
			...prev,
			[field]: checked
				? [...prev[field], value]
				: prev[field].filter((v) => v !== value),
		}));
	};

	const addToArray = (field, value, setter) => {
		if (!editMode || !value.trim()) return;
		setUnsavedChanges(true);

		setFormData((prev) => ({
			...prev,
			[field]: [...prev[field], value.trim()],
		}));
		setter('');
	};

	const removeFromArray = (field, index) => {
		if (!editMode) return;
		setUnsavedChanges(true);

		setFormData((prev) => ({
			...prev,
			[field]: prev[field].filter((_, i) => i !== index),
		}));
	};

	/* -------------------------------------------------------------------- */
	/*                        IMAGE UPLOAD HANDLERS                         */
	/* -------------------------------------------------------------------- */
	const handleImageUpload = async (file, imageType) => {
		try {
			setImageUploading((prev) => ({ ...prev, [imageType]: true }));
			setError('');

			console.log(`🔄 Uploading ${imageType} image:`, file.name);

			// Use the same uploadAPI that ImageUpload component uses
			const response = await uploadAPI.uploadImage(file);
			console.log('✅ Upload response:', response.data);

			// Handle response structure like ImageUpload component
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
				throw new Error('Invalid response from upload server');
			}

			console.log(`✅ ${imageType} image uploaded successfully:`, uploadedUrl);

			// Update form data with the uploaded URL
			if (imageType === 'profile') {
				handleInputChange('images.profileImage', uploadedUrl);
			} else if (imageType === 'cover') {
				handleInputChange('images.coverImage', uploadedUrl);
			}

			return uploadedUrl;
		} catch (error) {
			console.error(`❌ ${imageType} image upload failed:`, error);
			setError(`Failed to upload ${imageType} image: ${error.message}`);
			throw error;
		} finally {
			setImageUploading((prev) => ({ ...prev, [imageType]: false }));
		}
	};

	const saveProfile = async (e) => {
		e.preventDefault();
		if (!editMode) return;

		setLoading(true);
		setError('');
		setSuccess('');

		try {
			const payload = {
				...formData,
				email: formData.email.trim().toLowerCase(),
				location: {
					...formData.location,
					city: formData.location.city.trim(),
					state: formData.location.state.trim(),
					pincode: formData.location.pincode.trim(),
				},
			};

			const { data } = await vendorAPI.updateProfile(payload);
			const updated = data?.vendor || data?.data?.vendor;
			if (!updated) throw new Error('Invalid server response.');

			setVendorData(updated);
			apiUtils.updateCachedProfile(updated);

			// Update formData with the response to ensure sync
			setFormData({
				name: updated.name || '',
				title: updated.title || '',
				email: updated.email || '',
				phone: updated.phone || '',
				professionType: updated.professionType || '',
				license: updated.license || '',
				about: updated.about || '',
				location: {
					pincode: updated.location?.pincode || '',
					city: updated.location?.city || '',
					state: updated.location?.state || '',
					geo: updated.location?.geo || { type: 'Point', coordinates: [0, 0] },
				},
				categories: updated.categories || [],
				projectTypes: updated.projectTypes || [],
				styles: updated.styles || [],
				businessHighlights: updated.businessHighlights || [],
				languages: updated.languages || [],
				budgetLevel: updated.budgetLevel || 'Medium',
				images: {
					profileImage: updated.images?.profileImage || '',
					coverImage: updated.images?.coverImage || '',
					portfolio: updated.images?.portfolio || [],
				},
				credentials: updated.credentials || '',
				rating: +updated.rating || 0,
				reviewCount: +updated.reviewCount || 0,
				status: updated.status || 'pending',
			});

			setEditMode(false);
			setUnsavedChanges(false);
			setSuccess('Profile updated successfully!');
			setTimeout(() => setSuccess(''), 4000);
		} catch (err) {
			setError(
				err.response?.data?.message || err.message || 'Failed to update profile'
			);
		} finally {
			setLoading(false);
		}
	};

	/* -------------------------------------------------------------------- */
	/*                               RENDER                                 */
	/* -------------------------------------------------------------------- */

	if (dataLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading profile data…</p>
				</div>
			</div>
		);
	}

	/* ---------- helper: user initials ---------- */
	const initials = (name) =>
		name
			?.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2) || 'U';

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* ------------------------------------------------------------------ */}
			{/*                     YOUTUBE-STYLE HEADER SECTION                    */}
			{/* ------------------------------------------------------------------ */}
			<div className="relative mb-6 rounded-lg overflow-hidden shadow-lg">
				{/* Cover */}
				<div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600">
					{formData.images.coverImage && (
						<img
							src={formData.images.coverImage}
							alt="Cover"
							className="w-full h-full object-cover"
							onError={(e) => (e.currentTarget.style.display = 'none')}
						/>
					)}
					{editMode && (
						<Button
							size="sm"
							variant="secondary"
							className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-none"
							disabled={imageUploading.cover}
							onClick={() =>
								document.getElementById('cover-image-input')?.click()
							}>
							<Camera className="h-4 w-4 mr-2" />
							{imageUploading.cover ? 'Uploading...' : 'Edit Cover'}
						</Button>
					)}
					{/* Profile pic */}
					<div className="absolute -bottom-16 left-6 md:left-8">
						<div className="relative">
							<div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
								{formData.images.profileImage ? (
									<img
										src={formData.images.profileImage}
										alt={formData.name}
										className="w-full h-full object-cover"
										onError={(e) => (e.currentTarget.style.display = 'none')}
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center bg-blue-600">
										<span className="text-white text-3xl font-bold">
											{initials(formData.name)}
										</span>
									</div>
								)}
							</div>

							{editMode && (
								<Button
									size="sm"
									variant="secondary"
									className="absolute bottom-2 right-2 w-8 h-8 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-white"
									disabled={imageUploading.profile}
									onClick={() =>
										document.getElementById('profile-image-input')?.click()
									}>
									<Camera className="h-4 w-4" />
								</Button>
							)}

							{/* Upload loading indicator */}
							{imageUploading.profile && (
								<div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
									<div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Cover upload loading indicator */}
				{imageUploading.cover && (
					<div className="absolute inset-0 bg-black/30 flex items-center justify-center">
						<div className="bg-white/90 rounded-lg p-4 flex items-center gap-3">
							<div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
							<span className="text-gray-900">Uploading cover image...</span>
						</div>
					</div>
				)}

				{/* Info Row */}
				<div className="pt-20 pb-6 px-6 md:px-8 bg-white">
					<div className="flex flex-col md:flex-row md:items-end md:justify-between">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
								{formData.name}
							</h1>
							<p className="text-lg text-gray-600 mb-2">{formData.title}</p>
							<p className="text-gray-500 mb-4">
								{formData.professionType} • {formData.location.city},{' '}
								{formData.location.state}
							</p>
							<div className="flex items-center space-x-4 text-sm text-gray-600">
								<span className="flex items-center gap-1">
									<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
									{formData.rating.toFixed(1)} / 5
								</span>
								<span>{formData.reviewCount} reviews</span>
							</div>
						</div>

						{editMode ? (
							<Button
								onClick={() => {
									setEditMode(false);
									setUnsavedChanges(false);
								}}
								variant="outline">
								<X className="h-4 w-4 mr-2" /> Cancel
							</Button>
						) : (
							<Button onClick={() => setEditMode(true)}>
								<Edit3 className="h-4 w-4 mr-2" /> Edit Profile
							</Button>
						)}
					</div>
				</div>

				{/* Hidden file inputs for backend upload */}
				<input
					id="cover-image-input"
					type="file"
					accept="image/*"
					hidden
					onChange={async (e) => {
						const file = e.target.files?.[0];
						if (file) {
							try {
								await handleImageUpload(file, 'cover');
							} catch (error) {
								console.error('Cover image upload error:', error);
							}
						}
						e.target.value = ''; // Reset input
					}}
				/>
				<input
					id="profile-image-input"
					type="file"
					accept="image/*"
					hidden
					onChange={async (e) => {
						const file = e.target.files?.[0];
						if (file) {
							try {
								await handleImageUpload(file, 'profile');
							} catch (error) {
								console.error('Profile image upload error:', error);
							}
						}
						e.target.value = ''; // Reset input
					}}
				/>
			</div>

			{/* ------------------------------------------------------------------ */}
			{/*                       STATUS / SUCCESS / ERROR                     */}
			{/* ------------------------------------------------------------------ */}
			{error && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="pt-6">
						<div className="flex items-center text-red-600 gap-2">
							<AlertCircle className="h-5 w-5" />
							<span>{error}</span>
						</div>
					</CardContent>
				</Card>
			)}

			{success && (
				<Card className="border-green-200 bg-green-50">
					<CardContent className="pt-6">
						<div className="flex items-center text-green-600 gap-2">
							<CheckCircle className="h-5 w-5" />
							<span>{success}</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* ------------------------------------------------------------------ */}
			{/*                          MAIN EDIT FORM                            */}
			{/* ------------------------------------------------------------------ */}
			<form onSubmit={saveProfile} className="space-y-6">
				{/* Personal Information */}
				<Card>
					<CardHeader>
						<CardTitle>Personal Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label>Full Name *</Label>
								<Input
									value={formData.name}
									onChange={(e) => handleInputChange('name', e.target.value)}
									disabled={!editMode}
									required
								/>
							</div>
							<div>
								<Label>Email *</Label>
								<Input
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange('email', e.target.value)}
									disabled={!editMode}
									required
								/>
							</div>
						</div>
						<div>
							<Label>Phone</Label>
							<Input
								value={formData.phone}
								onChange={(e) => handleInputChange('phone', e.target.value)}
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
							<Label>Company Name *</Label>
							<Input
								value={formData.title}
								onChange={(e) => handleInputChange('title', e.target.value)}
								disabled={!editMode}
								required
							/>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label>Profession Type *</Label>
								<Select
									value={formData.professionType}
									onValueChange={(v) => handleInputChange('professionType', v)}
									disabled={!editMode}>
									<SelectTrigger>
										<SelectValue placeholder="Select profession" />
									</SelectTrigger>
									<SelectContent>
										{professionTypes.map((t) => (
											<SelectItem key={t} value={t}>
												{t}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>License Number</Label>
								<Input
									value={formData.license}
									onChange={(e) => handleInputChange('license', e.target.value)}
									disabled={!editMode}
								/>
							</div>
						</div>
						<div>
							<Label>About</Label>
							<Textarea
								rows={4}
								value={formData.about}
								onChange={(e) => handleInputChange('about', e.target.value)}
								disabled={!editMode}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Location */}
				<Card>
					<CardHeader>
						<CardTitle>Location</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Input
								placeholder="City"
								value={formData.location.city}
								onChange={(e) =>
									handleInputChange('location.city', e.target.value)
								}
								disabled={!editMode}
								required
							/>
							<Input
								placeholder="State"
								value={formData.location.state}
								onChange={(e) =>
									handleInputChange('location.state', e.target.value)
								}
								disabled={!editMode}
								required
							/>
							<Input
								placeholder="Pincode"
								value={formData.location.pincode}
								onChange={(e) =>
									handleInputChange('location.pincode', e.target.value)
								}
								disabled={!editMode}
								required
							/>
						</div>
					</CardContent>
				</Card>

				{/* Categories */}
				<Card>
					<CardHeader>
						<CardTitle>Service Categories</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{categoryOptions.map((cat) => (
								<div key={cat} className="flex items-center gap-2">
									<Checkbox
										checked={formData.categories.includes(cat)}
										onCheckedChange={(c) =>
											handleArrayChange('categories', cat, c)
										}
										disabled={!editMode}
									/>
									<Label className="text-sm">{cat}</Label>
								</div>
							))}
						</div>

						{editMode && (
							<div className="flex gap-2 mt-4">
								<Input
									placeholder="Custom category"
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
						)}

						{formData.categories.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{formData.categories.map((c, i) => (
									<Badge
										key={i}
										variant="secondary"
										className="flex items-center gap-1">
										{c}
										{editMode && (
											<button
												type="button"
												onClick={() => removeFromArray('categories', i)}>
												<X className="h-3 w-3 text-red-600" />
											</button>
										)}
									</Badge>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Project Types */}
				<Card>
					<CardHeader>
						<CardTitle>Project Types</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{projectTypeOptions.map((p) => (
								<div key={p} className="flex items-center gap-2">
									<Checkbox
										checked={formData.projectTypes.includes(p)}
										onCheckedChange={(c) =>
											handleArrayChange('projectTypes', p, c)
										}
										disabled={!editMode}
									/>
									<Label className="text-sm">{p}</Label>
								</div>
							))}
						</div>

						{editMode && (
							<div className="flex gap-2 mt-4">
								<Input
									placeholder="Custom project type"
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
						)}

						{formData.projectTypes.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{formData.projectTypes.map((p, i) => (
									<Badge
										key={i}
										variant="secondary"
										className="flex items-center gap-1">
										{p}
										{editMode && (
											<button
												type="button"
												onClick={() => removeFromArray('projectTypes', i)}>
												<X className="h-3 w-3 text-red-600" />
											</button>
										)}
									</Badge>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Styles */}
				<Card>
					<CardHeader>
						<CardTitle>Design Styles</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{styleOptions.map((s) => (
								<div key={s} className="flex items-center gap-2">
									<Checkbox
										checked={formData.styles.includes(s)}
										onCheckedChange={(c) => handleArrayChange('styles', s, c)}
										disabled={!editMode}
									/>
									<Label className="text-sm">{s}</Label>
								</div>
							))}
						</div>

						{editMode && (
							<div className="flex gap-2 mt-4">
								<Input
									placeholder="Custom style"
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
						)}

						{formData.styles.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{formData.styles.map((s, i) => (
									<Badge
										key={i}
										variant="secondary"
										className="flex items-center gap-1">
										{s}
										{editMode && (
											<button
												type="button"
												onClick={() => removeFromArray('styles', i)}>
												<X className="h-3 w-3 text-red-600" />
											</button>
										)}
									</Badge>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Languages */}
				<Card>
					<CardHeader>
						<CardTitle>Languages</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{languageOptions.map((l) => (
								<div key={l} className="flex items-center gap-2">
									<Checkbox
										checked={formData.languages.includes(l)}
										onCheckedChange={(c) =>
											handleArrayChange('languages', l, c)
										}
										disabled={!editMode}
									/>
									<Label className="text-sm">{l}</Label>
								</div>
							))}
						</div>

						{editMode && (
							<div className="flex gap-2 mt-4">
								<Input
									placeholder="Custom language"
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
						)}

						{formData.languages.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-2">
								{formData.languages.map((l, i) => (
									<Badge
										key={i}
										variant="secondary"
										className="flex items-center gap-1">
										{l}
										{editMode && (
											<button
												type="button"
												onClick={() => removeFromArray('languages', i)}>
												<X className="h-3 w-3 text-red-600" />
											</button>
										)}
									</Badge>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Business Highlights */}
				<Card>
					<CardHeader>
						<CardTitle>Business Highlights</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{editMode && (
							<div className="flex gap-2">
								<Input
									placeholder="Highlight"
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
						)}

						{formData.businessHighlights.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{formData.businessHighlights.map((h, i) => (
									<Badge
										key={i}
										variant="secondary"
										className="flex items-center gap-1">
										{h}
										{editMode && (
											<button
												type="button"
												onClick={() =>
													removeFromArray('businessHighlights', i)
												}>
												<X className="h-3 w-3 text-red-600" />
											</button>
										)}
									</Badge>
								))}
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
							onValueChange={(v) => handleInputChange('budgetLevel', v)}
							disabled={!editMode}>
							<SelectTrigger>
								<SelectValue placeholder="Select budget" />
							</SelectTrigger>
							<SelectContent>
								{budgetLevelOptions.map((b) => (
									<SelectItem key={b.value} value={b.value}>
										{b.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				{/* Save / Cancel */}
				{editMode && (
					<div className="flex justify-end gap-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setEditMode(false);
								setUnsavedChanges(false);
							}}
							disabled={loading}>
							<X className="h-4 w-4 mr-2" /> Cancel
						</Button>
						<Button type="submit" disabled={loading || !unsavedChanges}>
							<Save className="h-4 w-4 mr-2" />
							{loading ? 'Saving…' : 'Save Changes'}
						</Button>
					</div>
				)}
			</form>
		</div>
	);
};

export default VendorProfile;
