import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from './config/firebase';

const ResetPassword = () => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState({
		type: null,
		message: '',
	});

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email.trim()) {
			setStatus({
				type: 'error',
				message: 'Please enter your email address.',
			});
			return;
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setStatus({
				type: 'error',
				message: 'Please enter a valid email address.',
			});
			return;
		}

		setLoading(true);
		setStatus({ type: null, message: '' });

		try {
			// Send password reset email using Firebase
			await sendPasswordResetEmail(auth, email);

			setStatus({
				type: 'success',
				message:
					'Reset link sent! Please check your email inbox and spam folder.',
			});

			// Clear the email field after successful submission
			setEmail('');
		} catch (error) {
			console.error('Password reset error:', error);

			// Handle specific Firebase errors
			let errorMessage = 'An error occurred. Please try again.';

			switch (error.code) {
				case 'auth/user-not-found':
					errorMessage = 'No account found with this email address.';
					break;
				case 'auth/invalid-email':
					errorMessage = 'Please enter a valid email address.';
					break;
				case 'auth/too-many-requests':
					errorMessage = 'Too many requests. Please try again later.';
					break;
				case 'auth/network-request-failed':
					errorMessage = 'Network error. Please check your connection.';
					break;
				default:
					errorMessage = 'Failed to send reset email. Please try again.';
			}

			setStatus({
				type: 'error',
				message: errorMessage,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<Card className="shadow-lg border-0">
					<CardHeader className="flex flex-col items-center space-y-2 pb-2">
						<div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-2">
							<i className="fas fa-home text-indigo-600 text-2xl"></i>
						</div>
						<h2 className="text-2xl font-bold text-center text-gray-800">
							Interior Vendor
						</h2>
					</CardHeader>

					<CardContent className="px-8 pt-4">
						<div className="text-center mb-6">
							<h3 className="text-xl font-semibold text-gray-800 mb-2">
								Reset Your Password
							</h3>
							<p className="text-gray-600">
								Enter your email to receive password reset instructions.
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5">
							<div className="space-y-2">
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700">
									Email Address
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
										<i className="fas fa-envelope text-gray-400"></i>
									</div>
									<Input
										id="email"
										type="email"
										placeholder="name@example.com"
										className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										disabled={loading}
										required
									/>
								</div>
							</div>

							{status.type && (
								<Alert
									className={`${
										status.type === 'success'
											? 'bg-green-50 text-green-800 border-green-200'
											: 'bg-red-50 text-red-800 border-red-200'
									}`}>
									<AlertDescription>
										{status.type === 'success' ? (
											<div className="flex items-center">
												<i className="fas fa-check-circle mr-2 text-green-500"></i>
												{status.message}
											</div>
										) : (
											<div className="flex items-center">
												<i className="fas fa-exclamation-circle mr-2 text-red-500"></i>
												{status.message}
											</div>
										)}
									</AlertDescription>
								</Alert>
							)}

							<Button
								type="submit"
								className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 !rounded-button whitespace-nowrap cursor-pointer"
								disabled={loading}>
								{loading ? (
									<>
										<i className="fas fa-spinner fa-spin mr-2"></i>
										Sending Reset Link...
									</>
								) : (
									'Send Reset Link'
								)}
							</Button>
						</form>
					</CardContent>

					<CardFooter className="flex justify-center pb-8 px-8">
						<p className="text-sm text-gray-600">
							Remembered your password?{' '}
							<Link
								to="/login"
								className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">
								Back to Login
							</Link>
						</p>
					</CardFooter>
				</Card>

				<div className="mt-8 text-center">
					<p className="text-sm text-gray-500">
						© 2025 Interior Vendor. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	);
};

export default ResetPassword;
