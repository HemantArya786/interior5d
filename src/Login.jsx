import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from './config/firebase';
import { apiUtils, authAPI } from './services/api';

const Login = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	// Prevent multiple simultaneous login attempts
	const loginInProgress = useRef(false);

	const from = location.state?.from?.pathname || '/';

	useEffect(() => {
		if (location.state?.message) {
			setSuccess(location.state.message);
		}
	}, [location.state]);

	const redirectUser = (userRole) => {
		switch (userRole) {
			case 'vendor':
				navigate('/vendor-dashboard', { replace: true });
				break;
			case 'admin':
				navigate('/admin-dashboard', { replace: true });
				break;
			default:
				navigate(from, { replace: true });
		}
	};

	const handleLogin = async (e) => {
		e.preventDefault();

		// Prevent multiple simultaneous requests
		if (loginInProgress.current || loading) return;

		loginInProgress.current = true;
		setLoading(true);
		setError('');
		setSuccess('');

		try {
			if (!email || !password) {
				setError('Please enter both email and password');
				return;
			}

			// Firebase authentication
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const firebaseToken = await userCredential.user.getIdToken();

			// Backend authentication
			const response = await authAPI.login({
				token: firebaseToken,
				email: email,
			});

			if (response.data.user) {
				// Store authentication data
				apiUtils.setAuthToken(firebaseToken);
				apiUtils.setCurrentUser(response.data.user);

				setSuccess('Login successful! Redirecting...');

				// Small delay for user feedback, then redirect
				setTimeout(() => {
					redirectUser(response.data.user.role);
				}, 1000);
			} else {
				setError('Invalid login response from server');
			}
		} catch (err) {
			console.error('Login error:', err);

			if (err.code) {
				// Firebase errors
				switch (err.code) {
					case 'auth/user-not-found':
						setError('No account found with this email address');
						break;
					case 'auth/wrong-password':
						setError('Incorrect password. Please try again.');
						break;
					case 'auth/invalid-email':
						setError('Please enter a valid email address');
						break;
					case 'auth/too-many-requests':
						setError('Too many failed attempts. Please try again later.');
						break;
					default:
						setError('Login failed. Please try again.');
				}
			} else if (err.response) {
				// Backend errors
				setError(err.response.data?.message || 'Login failed');
			} else {
				setError('Network error. Please try again.');
			}
		} finally {
			setLoading(false);
			loginInProgress.current = false;
		}
	};

	const handleGoogleLogin = async () => {
		if (loginInProgress.current || googleLoading) return;

		loginInProgress.current = true;
		setGoogleLoading(true);
		setError('');
		setSuccess('');

		try {
			const result = await signInWithPopup(auth, googleProvider);
			const firebaseToken = await result.user.getIdToken();

			const response = await authAPI.login({
				token: firebaseToken,
				email: result.user.email,
				googleAuth: true,
			});

			if (response.data.user) {
				apiUtils.setAuthToken(firebaseToken);
				apiUtils.setCurrentUser(response.data.user);

				setSuccess('Google login successful! Redirecting...');

				setTimeout(() => {
					redirectUser(response.data.user.role);
				}, 1000);
			} else if (response.data.needsRegistration) {
				navigate('/signup', {
					state: {
						googleUser: result.user,
						token: firebaseToken,
						email: result.user.email,
						name: result.user.displayName,
						profileImage: result.user.photoURL,
					},
				});
			}
		} catch (err) {
			console.error('Google login error:', err);

			if (err.code === 'auth/popup-closed-by-user') {
				setError('Google sign-in was cancelled');
			} else if (err.response?.status === 404) {
				navigate('/signup', {
					state: { message: 'Please complete your registration' },
				});
			} else {
				setError('Google sign-in failed. Please try again.');
			}
		} finally {
			setGoogleLoading(false);
			loginInProgress.current = false;
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<Card className="w-full shadow-lg">
					<CardHeader className="text-center space-y-4">
						<div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
							<i className="fas fa-sign-in-alt text-2xl text-indigo-600"></i>
						</div>
						<h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
						<p className="text-gray-600">Sign in to your account to continue</p>
					</CardHeader>

					<CardContent>
						<form onSubmit={handleLogin} className="space-y-6">
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
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email Address
								</label>
								<Input
									type="email"
									placeholder="Enter your email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={loading || googleLoading}
								/>
							</div>

							<div className="relative">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Password
								</label>
								<Input
									type={showPassword ? 'text' : 'password'}
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="pr-10"
									disabled={loading || googleLoading}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center">
									<i
										className={`fas ${
											showPassword ? 'fa-eye-slash' : 'fa-eye'
										} text-gray-500`}></i>
								</button>
							</div>

							<Button
								type="submit"
								className="w-full bg-indigo-600 hover:bg-indigo-700"
								disabled={loading || googleLoading}>
								{loading ? (
									<>
										<i className="fas fa-spinner fa-spin mr-2"></i>
										Signing in...
									</>
								) : (
									'Sign In'
								)}
							</Button>
						</form>

						<div className="mt-6">
							<Separator className="my-4" />
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={handleGoogleLogin}
								disabled={loading || googleLoading}>
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
									? 'Signing in with Google...'
									: 'Continue with Google'}
							</Button>
						</div>
					</CardContent>

					<Separator className="my-4" />
					<CardFooter className="text-center">
						<p className="text-sm text-gray-600 w-full">
							Don't have an account?{' '}
							<Link
								to="/signup"
								className="font-medium text-indigo-600 hover:text-indigo-500">
								Create account
							</Link>
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};

export default Login;
