import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithPopup,
	updateProfile,
} from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from './config/firebase';
import { apiUtils, authAPI } from './services/api';

const SignUp = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [agreedToTerms, setAgreedToTerms] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		confirmPassword: '',
		userType: 'user',
		city: '',
		state: '',
		pincode: '',
		// Vendor specific fields
		title: '',
		professionType: '',
		license: '',
		about: '',
	});
	const navigate = useNavigate();
	const location = useLocation();

	// Check for Google user data from login redirect
	useEffect(() => {
		if (location.state?.googleUser) {
			const googleUser = location.state.googleUser;
			setFormData((prev) => ({
				...prev,
				name: googleUser.displayName || '',
				email: googleUser.email || '',
			}));
		}
	}, [location.state]);

	// Check if user is already logged in
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user && apiUtils.isAuthenticated()) {
				// User is already logged in, redirect to appropriate dashboard
				navigate('/');
			}
		});

		return () => unsubscribe();
	}, [navigate]);

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const validateForm = () => {
		// Basic validation
		if (!formData.name.trim()) {
			setError('Name is required');
			return false;
		}

		if (!formData.email.trim()) {
			setError('Email is required');
			return false;
		}

		if (!formData.phone.trim()) {
			setError('Phone number is required');
			return false;
		}

		if (
			!formData.city.trim() ||
			!formData.state.trim() ||
			!formData.pincode.trim()
		) {
			setError('Location details are required');
			return false;
		}

		// Vendor-specific validation
		if (formData.userType === 'vendor') {
			if (!formData.title.trim()) {
				setError('Business name is required for vendors');
				return false;
			}
			if (!formData.professionType) {
				setError('Profession type is required for vendors');
				return false;
			}
			if (!formData.license.trim()) {
				setError('License number is required for vendors');
				return false;
			}
			if (!formData.about.trim()) {
				setError('Business description is required for vendors');
				return false;
			}
		}

		// Password validation (only for email/password registration)
		if (!location.state?.token) {
			if (formData.password !== formData.confirmPassword) {
				setError("Passwords don't match");
				return false;
			}

			if (formData.password.length < 6) {
				setError('Password must be at least 6 characters long');
				return false;
			}
		}

		// Terms agreement
		if (!agreedToTerms) {
			setError('Please agree to the terms and conditions');
			return false;
		}

		return true;
	};

	const handleSignUp = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');

		if (!validateForm()) {
			setLoading(false);
			return;
		}

		try {
			let firebaseToken;

			// Check if we're completing Google registration
			if (location.state?.token) {
				firebaseToken = location.state.token;
			} else {
				// Create Firebase user with email/password
				const userCredential = await createUserWithEmailAndPassword(
					auth,
					formData.email,
					formData.password
				);

				// Update Firebase profile
				await updateProfile(userCredential.user, {
					displayName: formData.name,
				});

				// Get Firebase token
				firebaseToken = await userCredential.user.getIdToken();
			}

			// Prepare registration data
			const registrationData = {
				token: firebaseToken,
				userType: formData.userType,
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				city: formData.city,
				state: formData.state,
				pincode: formData.pincode,
			};

			// Add vendor-specific fields if userType is vendor
			if (formData.userType === 'vendor') {
				registrationData.title = formData.title;
				registrationData.professionType = formData.professionType;
				registrationData.license = formData.license;
				registrationData.about = formData.about;
				registrationData.location = {
					city: formData.city,
					state: formData.state,
					pincode: formData.pincode,
				};
			}

			// Register with backend
			const response = await authAPI.register(registrationData);

			// Check if registration was successful
			if (response.data && response.data.user) {
				// Set token for future API calls
				apiUtils.setAuthToken(firebaseToken);
				apiUtils.setCurrentUser(response.data.user);

				// Show success message
				setSuccess('Account created successfully! Redirecting...');

				// Navigate based on user type
				setTimeout(() => {
					if (formData.userType === 'vendor') {
						navigate('/vendor-dashboard', {
							state: {
								message:
									'Welcome! Your vendor account has been created. You can now start adding your services.',
							},
						});
					} else {
						navigate('/', {
							state: {
								message: 'Welcome! Your account has been created successfully.',
							},
						});
					}
				}, 1500);
			} else {
				setError(
					'Account created but there was an issue with the registration data'
				);
			}
		} catch (err) {
			console.error('Registration error:', err);

			if (err.code) {
				// Firebase error
				switch (err.code) {
					case 'auth/email-already-in-use':
						setError('An account with this email already exists');
						break;
					case 'auth/weak-password':
						setError('Password is too weak');
						break;
					case 'auth/invalid-email':
						setError('Invalid email address');
						break;
					case 'auth/network-request-failed':
						setError('Network error. Please check your connection.');
						break;
					default:
						setError('Registration failed. Please try again.');
				}
			} else {
				// Backend error
				if (err.response?.status === 409) {
					setError('Account already exists. Please login instead.');
				} else {
					setError(err.response?.data?.message || 'Registration failed');
				}
			}
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignUp = async () => {
		setGoogleLoading(true);
		setError('');
		setSuccess('');

		try {
			// Firebase Google authentication
			const result = await signInWithPopup(auth, googleProvider);
			const firebaseToken = await result.user.getIdToken();

			// Pre-fill form with Google data
			setFormData((prev) => ({
				...prev,
				name: result.user.displayName || '',
				email: result.user.email || '',
			}));

			// Try to login first (in case user already exists)
			try {
				const loginResponse = await authAPI.login({
					token: firebaseToken,
					googleAuth: true,
				});

				if (loginResponse.data.user) {
					// User exists, login successful
					apiUtils.setAuthToken(firebaseToken);
					apiUtils.setCurrentUser(loginResponse.data.user);

					setSuccess('Welcome back! Redirecting...');
					setTimeout(() => {
						navigate('/');
					}, 1000);
					return;
				}
			} catch (loginError) {
				// User doesn't exist, continue with registration
				if (!loginError.response?.data?.needsRegistration) {
					throw loginError;
				}
			}

			// Continue with the registration form pre-filled
			setSuccess(
				'Google authentication successful! Please complete your profile below.'
			);
		} catch (err) {
			console.error('Google signup error:', err);
			if (err.code === 'auth/popup-closed-by-user') {
				setError('Google sign-up was cancelled');
			} else if (err.code === 'auth/popup-blocked') {
				setError('Popup was blocked. Please enable popups and try again.');
			} else {
				setError('Google sign-up failed. Please try again.');
			}
		} finally {
			setGoogleLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<Card className="w-full shadow-lg">
					<CardHeader>
						<CardTitle className="text-2xl font-bold text-center">
							Create your account
						</CardTitle>
						<CardDescription className="text-center">
							Join our interior design platform
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* Google Sign Up Button */}
						<div className="mb-6">
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={handleGoogleSignUp}
								disabled={googleLoading || loading}>
								<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								{googleLoading
									? 'Signing up with Google...'
									: 'Continue with Google'}
							</Button>

							<div className="mt-4">
								<Separator />
								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<span className="w-full border-t" />
									</div>
									<div className="relative flex justify-center text-xs uppercase">
										<span className="bg-white px-2 text-gray-500">
											Or continue with email
										</span>
									</div>
								</div>
							</div>
						</div>

						<form onSubmit={handleSignUp} className="space-y-4">
							{error && (
								<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
									<div className="flex items-center">
										<i className="fas fa-exclamation-circle mr-2"></i>
										{error}
									</div>
								</div>
							)}

							{success && (
								<div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
									<div className="flex items-center">
										<i className="fas fa-check-circle mr-2"></i>
										{success}
									</div>
								</div>
							)}

							<div>
								<Label htmlFor="userType">Account Type</Label>
								<Select
									value={formData.userType}
									onValueChange={(value) =>
										handleInputChange('userType', value)
									}>
									<SelectTrigger>
										<SelectValue placeholder="Select account type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="user">Customer</SelectItem>
										<SelectItem value="vendor">Vendor/Designer</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="name">Full Name</Label>
								<Input
									id="name"
									type="text"
									value={formData.name}
									onChange={(e) => handleInputChange('name', e.target.value)}
									disabled={loading || googleLoading}
									required
								/>
							</div>

							{formData.userType === 'vendor' && (
								<>
									<div>
										<Label htmlFor="title">Company/Business Name</Label>
										<Input
											id="title"
											type="text"
											value={formData.title}
											onChange={(e) =>
												handleInputChange('title', e.target.value)
											}
											disabled={loading || googleLoading}
											required
										/>
									</div>

									<div>
										<Label htmlFor="professionType">Profession Type</Label>
										<Select
											value={formData.professionType}
											onValueChange={(value) =>
												handleInputChange('professionType', value)
											}>
											<SelectTrigger>
												<SelectValue placeholder="Select profession" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Interior Designer">
													Interior Designer
												</SelectItem>
												<SelectItem value="Architect">Architect</SelectItem>
												<SelectItem value="Contractor">Contractor</SelectItem>
												<SelectItem value="Furniture Dealer">
													Furniture Dealer
												</SelectItem>
												<SelectItem value="Decorator">Decorator</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor="license">License Number</Label>
										<Input
											id="license"
											type="text"
											value={formData.license}
											onChange={(e) =>
												handleInputChange('license', e.target.value)
											}
											disabled={loading || googleLoading}
											required
										/>
									</div>

									<div>
										<Label htmlFor="about">About Your Business</Label>
										<Input
											id="about"
											type="text"
											value={formData.about}
											onChange={(e) =>
												handleInputChange('about', e.target.value)
											}
											placeholder="Brief description of your services"
											disabled={loading || googleLoading}
											required
										/>
									</div>
								</>
							)}

							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange('email', e.target.value)}
									disabled={loading || googleLoading}
									required
								/>
							</div>

							<div>
								<Label htmlFor="phone">Phone Number</Label>
								<Input
									id="phone"
									type="tel"
									value={formData.phone}
									onChange={(e) => handleInputChange('phone', e.target.value)}
									disabled={loading || googleLoading}
									required
								/>
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div>
									<Label htmlFor="city">City</Label>
									<Input
										id="city"
										type="text"
										value={formData.city}
										onChange={(e) => handleInputChange('city', e.target.value)}
										disabled={loading || googleLoading}
										required
									/>
								</div>
								<div>
									<Label htmlFor="state">State</Label>
									<Input
										id="state"
										type="text"
										value={formData.state}
										onChange={(e) => handleInputChange('state', e.target.value)}
										disabled={loading || googleLoading}
										required
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="pincode">Pincode</Label>
								<Input
									id="pincode"
									type="text"
									value={formData.pincode}
									onChange={(e) => handleInputChange('pincode', e.target.value)}
									disabled={loading || googleLoading}
									required
								/>
							</div>

							{/* Only show password fields for email/password registration */}
							{!location.state?.token && (
								<>
									<div>
										<Label htmlFor="password">Password</Label>
										<div className="relative">
											<Input
												id="password"
												type={showPassword ? 'text' : 'password'}
												value={formData.password}
												onChange={(e) =>
													handleInputChange('password', e.target.value)
												}
												disabled={loading || googleLoading}
												required
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
												{showPassword ? 'Hide' : 'Show'}
											</button>
										</div>
									</div>

									<div>
										<Label htmlFor="confirmPassword">Confirm Password</Label>
										<div className="relative">
											<Input
												id="confirmPassword"
												type={showConfirmPassword ? 'text' : 'password'}
												value={formData.confirmPassword}
												onChange={(e) =>
													handleInputChange('confirmPassword', e.target.value)
												}
												disabled={loading || googleLoading}
												required
											/>
											<button
												type="button"
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
												{showConfirmPassword ? 'Hide' : 'Show'}
											</button>
										</div>
									</div>
								</>
							)}

							{/* Terms and Conditions */}
							<div className="flex items-center space-x-2">
								<Checkbox
									id="terms"
									checked={agreedToTerms}
									onCheckedChange={setAgreedToTerms}
									disabled={loading || googleLoading}
								/>
								<Label htmlFor="terms" className="text-sm">
									I agree to the{' '}
									<Link
										to="/terms"
										className="text-indigo-600 hover:text-indigo-500">
										Terms of Service
									</Link>{' '}
									and{' '}
									<Link
										to="/privacy"
										className="text-indigo-600 hover:text-indigo-500">
										Privacy Policy
									</Link>
								</Label>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={loading || googleLoading || !agreedToTerms}>
								{loading ? (
									<>
										<i className="fas fa-spinner fa-spin mr-2"></i>
										Creating Account...
									</>
								) : (
									'Create Account'
								)}
							</Button>
						</form>
					</CardContent>
					<Separator className="my-4" />
					<CardFooter>
						<p className="text-center text-sm text-gray-600 w-full">
							Already have an account?{' '}
							<Link
								to="/login"
								className="font-medium text-indigo-600 hover:text-indigo-500">
								Sign in
							</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};

export default SignUp;
