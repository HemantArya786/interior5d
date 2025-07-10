import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { productAPI } from './services/api';

function HowItWorks() {
	const [processStats, setProcessStats] = useState({
		averageDesignTime: '2-3 days',
		successRate: '95%',
		customerSatisfaction: '4.8/5',
		loading: true,
	});

	useEffect(() => {
		const fetchProcessData = async () => {
			try {
				// Fetch real statistics if available
				const response = await productAPI.getAll({ limit: 1 });

				// Use real data or fallback to defaults
				setProcessStats({
					averageDesignTime: response.data.averageCompletionTime || '2-3 days',
					successRate: response.data.successRate || '95%',
					customerSatisfaction: response.data.averageRating || '4.8/5',
					loading: false,
				});
			} catch (error) {
				// Use default values if API fails
				setProcessStats({
					averageDesignTime: '2-3 days',
					successRate: '95%',
					customerSatisfaction: '4.8/5',
					loading: false,
				});
			}
		};

		fetchProcessData();
	}, []);

	const steps = [
		{
			icon: 'fas fa-pencil-ruler',
			title: '1. Create Your Space',
			description:
				'Start with a blank canvas or choose from our templates. Define your space dimensions and layout preferences.',
			action: 'Browse Templates',
			link: '/ideas',
			color: 'indigo',
		},
		{
			icon: 'fas fa-magic',
			title: '2. Design with AI',
			description:
				'Add furniture and décor with AI assistance, or choose from our extensive catalog of items.',
			action: 'Try AI Design',
			link: '/search',
			color: 'purple',
		},
		{
			icon: 'fas fa-eye',
			title: '3. Visualize & Share',
			description:
				'Experience your design in 3D or AR, make adjustments, and share your creation with others.',
			action: 'View Features',
			link: '/features',
			color: 'blue',
		},
	];

	return (
		<section className="py-20 bg-gradient-to-b from-gray-50 to-white">
			<div className="container mx-auto px-4 md:px-6">
				<div className="text-center mb-16">
					<Badge className="mb-3 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 cursor-pointer">
						Process
					</Badge>
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						How DesignVerse Works
					</h2>
					<p className="text-gray-600 max-w-2xl mx-auto mb-8">
						From concept to completion, our streamlined process makes designing
						your space simple and enjoyable.
					</p>

					{/* Process Statistics */}
					{!processStats.loading && (
						<div className="flex flex-wrap justify-center gap-8 mb-8">
							<div className="text-center">
								<div className="text-2xl font-bold text-indigo-600">
									{processStats.averageDesignTime}
								</div>
								<div className="text-sm text-gray-600">Average Design Time</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-green-600">
									{processStats.successRate}
								</div>
								<div className="text-sm text-gray-600">Success Rate</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-yellow-600">
									{processStats.customerSatisfaction}
								</div>
								<div className="text-sm text-gray-600">Customer Rating</div>
							</div>
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
					{steps.map((step, index) => (
						<div
							key={index}
							className="text-center p-6 group hover:transform hover:scale-105 transition-all duration-300">
							<div
								className={`w-16 h-16 rounded-full bg-${step.color}-100 text-${step.color}-600 flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow`}>
								<i className={`${step.icon} text-2xl`}></i>
							</div>
							<h3 className="text-xl font-bold mb-3">{step.title}</h3>
							<p className="text-gray-600 mb-4">{step.description}</p>
							<Link to={step.link}>
								<Button
									variant="outline"
									size="sm"
									className="group-hover:bg-indigo-50 group-hover:border-indigo-300 transition-colors">
									{step.action}
								</Button>
							</Link>
						</div>
					))}
				</div>

				{/* Additional Process Features */}
				<div className="bg-white rounded-xl shadow-sm border p-8">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<div className="text-center">
							<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<i className="fas fa-check text-green-600"></i>
							</div>
							<h4 className="font-semibold mb-1">Quality Assurance</h4>
							<p className="text-sm text-gray-600">
								Every design reviewed by experts
							</p>
						</div>
						<div className="text-center">
							<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<i className="fas fa-clock text-blue-600"></i>
							</div>
							<h4 className="font-semibold mb-1">Quick Turnaround</h4>
							<p className="text-sm text-gray-600">
								Fast delivery without compromise
							</p>
						</div>
						<div className="text-center">
							<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<i className="fas fa-headset text-purple-600"></i>
							</div>
							<h4 className="font-semibold mb-1">24/7 Support</h4>
							<p className="text-sm text-gray-600">Always here to help you</p>
						</div>
						<div className="text-center">
							<div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<i className="fas fa-mobile-alt text-orange-600"></i>
							</div>
							<h4 className="font-semibold mb-1">Mobile Ready</h4>
							<p className="text-sm text-gray-600">Design on any device</p>
						</div>
					</div>
				</div>

				{/* Call to Action */}
				<div className="text-center mt-12">
					<h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
					<p className="text-gray-600 mb-6 max-w-2xl mx-auto">
						Join thousands of users who have transformed their spaces with our
						platform.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link to="/signup">
							<Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
								Start Your Project
							</Button>
						</Link>
						<Link to="/design-ideas">
							<Button variant="outline" size="lg">
								Find Professionals
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}

export default HowItWorks;
