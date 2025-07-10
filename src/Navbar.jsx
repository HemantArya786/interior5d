// Navbar.jsx - Fixed profile image display with proper backend integration
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useApi';

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [imageError, setImageError] = useState(false);
	const { user, isAuthenticated, logout, updateProfile } = useAuth();
	const navigate = useNavigate();
	const menuRef = useRef(null);

	// ✅ Reset image error when user data changes
	useEffect(() => {
		setImageError(false);
	}, [user?.images?.profileImage]);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleLogout = async () => {
		try {
			await logout();
			navigate('/');
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	const getUserInitials = (name) => {
		if (!name) return 'U';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	const getUserDisplayName = () => {
		if (!user) return 'User';
		return user.name || user.title || user.email?.split('@')[0] || 'User';
	};

	// ✅ Fixed: Get profile image with proper backend structure matching VendorProfile
	const getProfileImage = () => {
		if (!user) return null;

		// Check the same image path structure as VendorProfile.jsx
		const imageUrl = user.images?.profileImage || null;

		console.log('🔍 Navbar checking profile image:', imageUrl);
		console.log('🔍 User object:', user);

		return imageUrl && !imageError ? imageUrl : null;
	};

	// ✅ Handle image loading errors
	const handleImageError = () => {
		console.log(
			'❌ Profile image failed to load in navbar:',
			getProfileImage()
		);
		setImageError(true);
	};

	// ✅ Handle successful image load
	const handleImageLoad = () => {
		console.log('✅ Profile image loaded successfully in navbar');
		setImageError(false);
	};

	// ✅ Refresh profile data
	const refreshUserProfile = async () => {
		try {
			await updateProfile();
		} catch (error) {
			console.error('Failed to refresh profile:', error);
		}
	};

	// ✅ Auto-refresh profile every 30 seconds when on profile pages
	useEffect(() => {
		const isProfilePage =
			window.location.pathname.includes('profile') ||
			window.location.pathname.includes('vendor-dashboard');

		if (isProfilePage) {
			const interval = setInterval(refreshUserProfile, 30000);
			return () => clearInterval(interval);
		}
	}, []);

	return (
		<nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link to="/" className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
							<i className="fas fa-home text-white text-sm"></i>
						</div>
						<span className="text-xl font-bold text-gray-900">DesignVerse</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						<Link
							to="/ideas"
							className="text-gray-700 hover:text-blue-600 transition-colors">
							Design Ideas
						</Link>
						<Link
							to="/design-ideas"
							className="text-gray-700 hover:text-blue-600 transition-colors">
							Find Professionals
						</Link>
						<Link
							to="/features"
							className="text-gray-700 hover:text-blue-600 transition-colors">
							Features
						</Link>
						<Link
							to="/resources"
							className="text-gray-700 hover:text-blue-600 transition-colors">
							Resources
						</Link>
					</div>

					{/* Authentication Section */}
					<div className="flex items-center space-x-4">
						{isAuthenticated && user ? (
							<div className="flex items-center space-x-3">
								{/* User Role Badge */}
								{user.role && user.role !== 'user' && (
									<span
										className={`px-2 py-1 text-xs rounded-full ${
											user.role === 'vendor'
												? 'bg-green-100 text-green-800'
												: user.role === 'admin'
												? 'bg-purple-100 text-purple-800'
												: 'bg-gray-100 text-gray-800'
										}`}>
										{user.role}
									</span>
								)}

								{/* User Dropdown Menu */}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
											{/* ✅ Fixed: Profile Image Display matching VendorProfile structure */}
											<div className="relative w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center">
												{getProfileImage() ? (
													<img
														src={getProfileImage()}
														alt={getUserDisplayName()}
														className="w-full h-full object-cover"
														onError={handleImageError}
														onLoad={handleImageLoad}
													/>
												) : (
													<span className="text-white text-sm font-medium">
														{getUserInitials(getUserDisplayName())}
													</span>
												)}
											</div>

											<div className="hidden sm:block text-left">
												<p className="text-sm font-medium text-gray-900">
													{getUserDisplayName()}
												</p>
												<p className="text-xs text-gray-500">{user.email}</p>
											</div>
											<i className="fas fa-chevron-down text-gray-400 text-xs"></i>
										</button>
									</DropdownMenuTrigger>

									<DropdownMenuContent align="end" className="w-56">
										{/* User Info Header */}
										<div className="px-3 py-2 border-b">
											<p className="text-sm font-medium text-gray-900">
												{getUserDisplayName()}
											</p>
											<p className="text-xs text-gray-500">{user.email}</p>
											{user.role && (
												<p className="text-xs text-blue-600 capitalize mt-1">
													{user.role} Account
												</p>
											)}
										</div>

										{/* Vendor Dashboard Access */}
										{user.role === 'vendor' && (
											<>
												<DropdownMenuItem asChild>
													<Link
														to="/vendor-dashboard"
														className="flex items-center">
														<i className="fas fa-tachometer-alt mr-2 text-green-600"></i>
														Vendor Dashboard
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link
														to="/vendor-dashboard/services"
														className="flex items-center">
														<i className="fas fa-briefcase mr-2 text-blue-600"></i>
														My Services
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link
														to="/vendor-dashboard/messages"
														className="flex items-center">
														<i className="fas fa-envelope mr-2 text-purple-600"></i>
														Messages
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link
														to="/vendor-dashboard/profile"
														className="flex items-center">
														<i className="fas fa-user-edit mr-2 text-orange-600"></i>
														Edit Profile
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
											</>
										)}

										{/* Admin Dashboard Access */}
										{user.role === 'admin' && (
											<>
												<DropdownMenuItem asChild>
													<Link
														to="/admin-dashboard"
														className="flex items-center">
														<i className="fas fa-cog mr-2 text-purple-600"></i>
														Admin Dashboard
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
											</>
										)}

										{/* Regular User Options */}
										<DropdownMenuItem asChild>
											<Link to="/profile" className="flex items-center">
												<i className="fas fa-user mr-2 text-gray-600"></i>
												My Profile
											</Link>
										</DropdownMenuItem>

										<DropdownMenuItem asChild>
											<Link to="/favorites" className="flex items-center">
												<i className="fas fa-heart mr-2 text-red-600"></i>
												Saved Designs
											</Link>
										</DropdownMenuItem>

										<DropdownMenuItem asChild>
											<Link to="/settings" className="flex items-center">
												<i className="fas fa-cog mr-2 text-gray-600"></i>
												Settings
											</Link>
										</DropdownMenuItem>

										<DropdownMenuSeparator />

										<DropdownMenuItem
											onClick={handleLogout}
											className="text-red-600 cursor-pointer">
											<i className="fas fa-sign-out-alt mr-2"></i>
											Sign Out
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						) : (
							<div className="flex items-center space-x-3">
								<Link to="/login">
									<Button
										variant="ghost"
										className="text-gray-700 hover:text-blue-600">
										Sign In
									</Button>
								</Link>
								<Link to="/signup">
									<Button className="bg-blue-600 hover:bg-blue-700 text-white">
										Get Started
									</Button>
								</Link>
							</div>
						)}

						{/* Mobile Menu Toggle */}
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100">
							<i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div
						ref={menuRef}
						className="md:hidden border-t border-gray-200 py-4">
						<div className="flex flex-col space-y-4">
							<Link
								to="/ideas"
								className="text-gray-700 hover:text-blue-600 px-4 py-2"
								onClick={() => setIsMenuOpen(false)}>
								Design Ideas
							</Link>
							<Link
								to="/design-ideas"
								className="text-gray-700 hover:text-blue-600 px-4 py-2"
								onClick={() => setIsMenuOpen(false)}>
								Find Professionals
							</Link>
							<Link
								to="/features"
								className="text-gray-700 hover:text-blue-600 px-4 py-2"
								onClick={() => setIsMenuOpen(false)}>
								Features
							</Link>
							<Link
								to="/resources"
								className="text-gray-700 hover:text-blue-600 px-4 py-2"
								onClick={() => setIsMenuOpen(false)}>
								Resources
							</Link>

							{/* Mobile user menu */}
							{isAuthenticated && user?.role === 'vendor' && (
								<>
									<div className="border-t border-gray-200 pt-4 mt-4">
										<Link
											to="/vendor-dashboard"
											className="text-green-600 hover:text-green-700 px-4 py-2 flex items-center"
											onClick={() => setIsMenuOpen(false)}>
											<i className="fas fa-tachometer-alt mr-2"></i>
											Vendor Dashboard
										</Link>
									</div>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
