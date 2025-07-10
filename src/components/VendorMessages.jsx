import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	AlertCircle,
	CheckCircle,
	Clock,
	MessageSquare,
	Reply,
	Search,
	User,
} from 'lucide-react';
import React, { useState } from 'react';
import { useVendorMessages } from '../hooks/useApi';
import { messageAPI } from '../services/api';

const VendorMessages = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedMessage, setSelectedMessage] = useState(null);
	const [replyText, setReplyText] = useState('');
	const [replying, setReplying] = useState(false);

	const { data: messagesData, loading, refetch } = useVendorMessages();
	const messages = messagesData?.messages || [];

	const handleMarkAsRead = async (messageId) => {
		try {
			await messageAPI.markAsRead(messageId);
			refetch();
		} catch (error) {
			console.error('Error marking message as read:', error);
		}
	};

	const handleReply = async (messageId) => {
		if (!replyText.trim()) return;

		try {
			setReplying(true);
			await messageAPI.reply(messageId, { message: replyText });
			setReplyText('');
			setSelectedMessage(null);
			refetch();
			alert('Reply sent successfully!');
		} catch (error) {
			console.error('Error sending reply:', error);
			alert('Failed to send reply');
		} finally {
			setReplying(false);
		}
	};

	const filteredMessages = messages.filter(
		(message) =>
			message.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			message.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			message.message?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const getStatusColor = (status) => {
		switch (status) {
			case 'unread':
				return 'bg-red-500';
			case 'read':
				return 'bg-yellow-500';
			case 'replied':
				return 'bg-green-500';
			default:
				return 'bg-gray-500';
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case 'unread':
				return <AlertCircle className="h-4 w-4" />;
			case 'read':
				return <Clock className="h-4 w-4" />;
			case 'replied':
				return <CheckCircle className="h-4 w-4" />;
			default:
				return <MessageSquare className="h-4 w-4" />;
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Messages</h1>
					<p className="text-gray-600">Customer inquiries and communications</p>
				</div>
				<div className="flex items-center space-x-2">
					<Badge variant="outline">
						{messages.filter((m) => m.status === 'unread').length} Unread
					</Badge>
					<Badge variant="outline">{messages.length} Total</Badge>
				</div>
			</div>

			{/* Search */}
			<Card>
				<CardContent className="pt-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search messages..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Messages List */}
			{filteredMessages.length > 0 ? (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{filteredMessages.map((message) => (
						<Card
							key={message._id}
							className="hover:shadow-lg transition-shadow">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
											<User className="h-5 w-5 text-blue-600" />
										</div>
										<div>
											<p className="font-semibold text-gray-900">
												{message.name}
											</p>
											<p className="text-sm text-gray-600">{message.email}</p>
										</div>
									</div>
									<Badge className={getStatusColor(message.status)}>
										<div className="flex items-center space-x-1">
											{getStatusIcon(message.status)}
											<span className="capitalize">{message.status}</span>
										</div>
									</Badge>
								</div>
							</CardHeader>

							<CardContent className="space-y-4">
								<div>
									<p className="text-sm text-gray-600 mb-2">Message:</p>
									<p className="text-gray-900">{message.message}</p>
								</div>

								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<p className="text-gray-600">Phone:</p>
										<p className="font-medium">{message.phone}</p>
									</div>
									<div>
										<p className="text-gray-600">Location:</p>
										<p className="font-medium">{message.pincode}</p>
									</div>
								</div>

								<div className="text-xs text-gray-500">
									Received: {new Date(message.createdAt).toLocaleString()}
								</div>

								{message.reply && (
									<div className="bg-blue-50 p-3 rounded-lg">
										<p className="text-sm font-medium text-blue-900 mb-1">
											Your Reply:
										</p>
										<p className="text-sm text-blue-800">
											{message.reply.message}
										</p>
										<p className="text-xs text-blue-600 mt-1">
											Replied:{' '}
											{new Date(message.reply.repliedAt).toLocaleString()}
										</p>
									</div>
								)}

								<div className="flex justify-between items-center pt-2 border-t">
									{message.status === 'unread' && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleMarkAsRead(message._id)}>
											Mark as Read
										</Button>
									)}

									{message.status !== 'replied' && (
										<Button
											size="sm"
											onClick={() => setSelectedMessage(message._id)}
											className="ml-auto">
											<Reply className="h-4 w-4 mr-1" />
											Reply
										</Button>
									)}
								</div>

								{/* Reply Form */}
								{selectedMessage === message._id && (
									<div className="space-y-3 p-3 bg-gray-50 rounded-lg">
										<Textarea
											placeholder="Type your reply..."
											value={replyText}
											onChange={(e) => setReplyText(e.target.value)}
											rows={3}
										/>
										<div className="flex justify-end space-x-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setSelectedMessage(null);
													setReplyText('');
												}}>
												Cancel
											</Button>
											<Button
												size="sm"
												onClick={() => handleReply(message._id)}
												disabled={replying || !replyText.trim()}>
												{replying ? 'Sending...' : 'Send Reply'}
											</Button>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="py-12">
						<div className="text-center">
							<MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								{searchQuery ? 'No messages found' : 'No messages yet'}
							</h3>
							<p className="text-gray-600">
								{searchQuery
									? 'Try adjusting your search criteria'
									: 'Customer messages will appear here when they contact you'}
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default VendorMessages;
