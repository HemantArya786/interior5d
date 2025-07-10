import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useApi';
import { productAPI } from './services/api';

const ProductFeature = () => {
	const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 });
	const [floorPlanData, setFloorPlanData] = useState(null);
	const [saving, setSaving] = useState(false);
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const interval = setInterval(() => {
			setCursorPosition({
				x: 50 + Math.sin(Date.now() / 1000) * 2,
				y: 50 + Math.cos(Date.now() / 1000) * 2,
			});
		}, 100);
		return () => clearInterval(interval);
	}, []);

	// Load user's existing floor plans
	useEffect(() => {
		const loadFloorPlans = async () => {
			if (isAuthenticated) {
				try {
					const response = await productAPI.getAll({
						vendorId: user?._id,
						type: 'floorplan',
						limit: 1,
					});
					if (response.data.products?.length > 0) {
						setFloorPlanData(response.data.products[0]);
					}
				} catch (error) {
					console.log('No existing floor plans found', error);
				}
			}
		};

		loadFloorPlans();
	}, [isAuthenticated, user]);

	const handleStartDesigning = async () => {
		if (!isAuthenticated) {
			navigate('/login');
			return;
		}

		try {
			setSaving(true);

			// Create new floor plan project
			const newFloorPlan = {
				name: 'New Floor Plan',
				type: 'floorplan',
				category: 'Architecture',
				rooms: [
					{ name: 'Living Room', dimensions: { width: 6.5, height: 4.2 } },
					{ name: 'Master Bedroom', dimensions: { width: 4, height: 3.5 } },
					{ name: 'Bedroom 2', dimensions: { width: 3.5, height: 3 } },
					{ name: 'Kitchen', dimensions: { width: 4, height: 3 } },
					{ name: 'Hall', dimensions: { width: 2, height: 8 } },
				],
				status: 'draft',
			};

			const response = await productAPI.create(newFloorPlan);

			if (response.data) {
				navigate(`/design-page?project=${response.data._id}`);
			}
		} catch (error) {
			console.error('Error creating floor plan:', error);
			alert('Failed to create floor plan. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	const handleUploadPlan = () => {
		if (!isAuthenticated) {
			navigate('/login');
			return;
		}

		// Create file input for upload
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.pdf,.dwg,.png,.jpg,.jpeg';
		input.onchange = async (e) => {
			const file = e.target.files[0];
			if (file) {
				try {
					setSaving(true);

					// In a real implementation, you would upload the file to your backend
					// For now, we'll simulate this
					const uploadData = {
						name: file.name.split('.')[0],
						type: 'floorplan',
						category: 'Architecture',
						originalFile: file.name,
						uploadedAt: new Date().toISOString(),
						status: 'processing',
					};

					const response = await productAPI.create(uploadData);

					if (response.data) {
						alert('Floor plan uploaded successfully!');
						navigate(`/design-page?project=${response.data._id}`);
					}
				} catch (error) {
					console.error('Error uploading floor plan:', error);
					alert('Failed to upload floor plan. Please try again.');
				} finally {
					setSaving(false);
				}
			}
		};
		input.click();
	};

	const saveCurrentLayout = async () => {
		if (!isAuthenticated) return;

		try {
			setSaving(true);

			const layoutData = {
				rooms: [
					{
						name: 'Living Room',
						position: { x: 30, y: 18 },
						dimensions: { width: 40, height: 30 },
						type: 'living',
					},
					{
						name: 'Master Bedroom',
						position: { x: 70, y: 18 },
						dimensions: { width: 20, height: 30 },
						type: 'bedroom',
					},
					{
						name: 'Bedroom 2',
						position: { x: 70, y: 57 },
						dimensions: { width: 20, height: 25 },
						type: 'bedroom',
					},
					{
						name: 'Kitchen',
						position: { x: 30, y: 57 },
						dimensions: { width: 25, height: 25 },
						type: 'kitchen',
					},
					{
						name: 'Hall',
						position: { x: 70, y: 25 },
						dimensions: { width: 10, height: 50 },
						type: 'hallway',
					},
				],
				measurements: [
					{ from: 'Living Room', to: 'Kitchen', distance: '6.5m' },
					{ from: 'Living Room', to: 'Master Bedroom', distance: '4.2m' },
				],
				lastModified: new Date().toISOString(),
			};

			if (floorPlanData) {
				await productAPI.update(floorPlanData._id, { layoutData });
			} else {
				const response = await productAPI.create({
					name: 'Current Layout',
					type: 'floorplan',
					category: 'Architecture',
					layoutData,
					status: 'draft',
				});
				setFloorPlanData(response.data);
			}

			console.log('Layout saved successfully');
		} catch (error) {
			console.error('Error saving layout:', error);
		} finally {
			setSaving(false);
		}
	};

	// Auto-save every 30 seconds if user is authenticated
	useEffect(() => {
		if (!isAuthenticated) return;

		const autoSaveInterval = setInterval(saveCurrentLayout, 30000);
		return () => clearInterval(autoSaveInterval);
	}, [isAuthenticated, floorPlanData]);

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center">
				<div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
					{/* Left Section - EXACTLY as original */}
					<div className="w-full lg:w-2/5 space-y-6 text-center lg:text-left">
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
							Create a floor plan from scratch or upload an existing one
						</h1>
						<p className="text-base sm:text-lg text-gray-700 leading-relaxed">
							Design your ideal layout from scratch, or use our advanced tools
							to get your floor plan recognized in minutes! Create a fully
							customizable floor plan—whether it's a simple room, an entire
							house or a commercial building.
						</p>
						<div className="pt-4 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
							<Button
								className="!rounded-button bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 whitespace-nowrap"
								onClick={handleStartDesigning}
								disabled={saving}>
								{saving ? 'Creating...' : 'Start designing'}
							</Button>
							<Button
								variant="outline"
								className="!rounded-button border-gray-300 text-gray-700 px-6 py-2.5 whitespace-nowrap"
								onClick={handleUploadPlan}
								disabled={saving}>
								{saving ? 'Uploading...' : 'Upload plan'}
							</Button>
						</div>

						{/* User Status Indicator */}
						{isAuthenticated && (
							<div className="text-sm text-gray-600 mt-4">
								<i className="fas fa-user-check text-green-500 mr-2"></i>
								Signed in as {user?.name} | Auto-save enabled
							</div>
						)}

						{!isAuthenticated && (
							<div className="text-sm text-amber-600 mt-4">
								<i className="fas fa-info-circle mr-2"></i>
								Sign in to save your floor plans automatically
							</div>
						)}
					</div>

					{/* Right Interactive Section - EXACTLY as original */}
					<div className="w-full lg:w-3/5 relative">
						<div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200">
							{/* Header - EXACTLY as original */}
							<div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex flex-wrap gap-2 items-center justify-between">
								{/* Left Nav */}
								<div className="flex items-center gap-2 flex-wrap">
									<button className="text-gray-500 hover:text-gray-700">
										<i className="fas fa-arrow-left"></i>
									</button>
									<div className="flex items-center gap-2 bg-white rounded-md px-3 py-1.5 border border-gray-200">
										<i className="fas fa-folder text-indigo-500"></i>
										<span className="text-sm text-gray-700">
											{isAuthenticated
												? user?.name
													? `${user.name}'s Projects`
													: 'All Projects'
												: 'All Projects'}
										</span>
									</div>
								</div>

								{/* Middle Controls */}
								<div className="flex items-center gap-3 flex-wrap">
									<div className="flex items-center gap-2 bg-white rounded-md px-3 py-1.5 border border-gray-200">
										<i className="fas fa-layer-group text-gray-600"></i>
										<span className="text-sm text-gray-700">Floor 1</span>
									</div>
									<button className="text-gray-500 hover:text-gray-700">
										<i className="fas fa-undo"></i>
									</button>
									<button className="text-gray-500 hover:text-gray-700">
										<i className="fas fa-redo"></i>
									</button>
								</div>

								{/* Right Actions */}
								<div className="flex items-center gap-3 flex-wrap">
									<Button className="!rounded-button bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-1.5">
										2D
									</Button>
									<Button
										variant="outline"
										className="!rounded-button border-gray-300 text-gray-700 text-sm px-4 py-1.5">
										3D
									</Button>
									<div className="flex items-center gap-2">
										<button
											className="text-gray-500 hover:text-gray-700"
											onClick={saveCurrentLayout}>
											<i className="fas fa-save"></i>
										</button>
										<button className="text-gray-500 hover:text-gray-700">
											<i className="fas fa-cog"></i>
										</button>
										<button className="text-gray-500 hover:text-gray-700">
											<i className="fas fa-share-alt"></i>
										</button>
										<button className="text-gray-500 hover:text-gray-700">
											<i className="fas fa-download"></i>
										</button>
										<button className="text-gray-500 hover:text-gray-700">
											<i className="fas fa-expand"></i>
										</button>
									</div>
								</div>
							</div>

							{/* Grid Area - EXACTLY as original with enhanced interactivity */}
							<div
								className="relative bg-gray-100 h-[300px] sm:h-[400px] md:h-[500px]"
								style={{
									backgroundImage:
										'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
									backgroundSize: '20px 20px',
								}}>
								{/* Rooms - EXACTLY as original */}
								<div className="absolute inset-0 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
									{/* Living Room */}
									<div className="absolute top-[18%] left-[5%] w-[80%] sm:left-[30%] sm:w-[40%] h-[30%] bg-white border-2 border-indigo-500 rounded-sm cursor-pointer hover:bg-indigo-50 transition-colors">
										<div className="absolute -top-6 left-2 text-sm font-medium text-gray-600">
											Living Room
										</div>
										<div className="absolute -left-3 top-1/2 w-5 h-7 border-2 border-indigo-500 bg-white transform -translate-y-1/2 rounded-r-full"></div>
									</div>

									{/* Master Bedroom */}
									<div className="absolute top-[18%] right-[5%] w-[40%] sm:right-[10%] sm:w-[20%] h-[30%] bg-white border-2 border-indigo-500 rounded-sm cursor-pointer hover:bg-indigo-50 transition-colors">
										<div className="absolute -top-6 left-2 text-sm font-medium text-gray-600">
											Master Bedroom
										</div>
										<div className="absolute -left-3 bottom-4 w-5 h-7 border-2 border-indigo-500 bg-white rounded-r-full"></div>
									</div>

									{/* Bedroom 2 */}
									<div className="absolute bottom-[18%] right-[5%] w-[40%] sm:right-[10%] sm:w-[20%] h-[25%] bg-white border-2 border-indigo-500 rounded-sm cursor-pointer hover:bg-indigo-50 transition-colors">
										<div className="absolute -top-6 left-2 text-sm font-medium text-gray-600">
											Bedroom 2
										</div>
										<div className="absolute -left-3 top-4 w-5 h-7 border-2 border-indigo-500 bg-white rounded-r-full"></div>
									</div>

									{/* Kitchen */}
									<div className="absolute bottom-[18%] left-[5%] w-[60%] sm:left-[30%] sm:w-[25%] h-[25%] bg-white border-2 border-indigo-500 rounded-sm cursor-pointer hover:bg-indigo-50 transition-colors">
										<div className="absolute -top-6 left-2 text-sm font-medium text-gray-600">
											Kitchen
										</div>
										<div className="absolute -right-3 top-1/2 w-5 h-7 border-2 border-indigo-500 bg-white transform -translate-y-1/2 rounded-l-full"></div>
									</div>

									{/* Hallway */}
									<div className="absolute top-[25%] left-[75%] w-[20%] sm:left-[70%] sm:w-[10%] h-[50%] bg-white border-2 border-indigo-500 rounded-sm cursor-pointer hover:bg-indigo-50 transition-colors">
										<div className="absolute -top-6 left-2 text-sm font-medium text-gray-600">
											Hall
										</div>
									</div>

									{/* Measurements - EXACTLY as original */}
									<div className="absolute top-[14%] left-[5%] sm:left-[30%] text-xs text-gray-500">
										6.5m
									</div>
									<div className="absolute top-[52%] left-[10%] sm:left-[25%] text-xs text-gray-500 transform -rotate-90">
										4.2m
									</div>
								</div>

								{/* Vertical Toolbar - EXACTLY as original */}
								<div className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-md p-1 sm:p-2 flex flex-col gap-2 sm:gap-4">
									{['home', 'couch', 'door-open', 'user', 'pencil-alt'].map(
										(icon, idx) => (
											<button
												key={idx}
												className="p-1 sm:p-2 text-gray-600 hover:text-indigo-500 hover:bg-gray-100 rounded-md transition-colors">
												<i className={`fas fa-${icon}`}></i>
											</button>
										)
									)}
								</div>

								{/* Animated Cursor - EXACTLY as original */}
								<div
									className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out"
									style={{
										left: `${cursorPosition.x}%`,
										top: `${cursorPosition.y}%`,
									}}>
									<div className="w-5 h-5 sm:w-6 sm:h-6 text-black">
										<i className="fas fa-mouse-pointer text-lg sm:text-xl"></i>
									</div>
								</div>

								{/* Save Status Indicator */}
								{saving && (
									<div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
										<i className="fas fa-spinner fa-spin mr-1"></i>
										Saving...
									</div>
								)}
							</div>
						</div>
						{/* Shadow under browser - EXACTLY as original */}
						<div className="absolute -bottom-3 left-4 right-4 h-6 bg-gray-200 rounded-b-xl blur-md -z-10"></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductFeature;
