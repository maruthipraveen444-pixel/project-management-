import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import SystemSettings from '../models/SystemSettings.js';
import User from '../models/User.js';

// Admin roles that can start chats regardless of toggle
const MESSAGING_ADMIN_ROLES = ['Super Admin', 'Project Admin'];

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.getForUser(req.user._id);

        // Add unread count for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.getUnreadCount(conv._id, req.user._id);
                return {
                    ...conv.toObject(),
                    unreadCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: conversationsWithUnread
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations'
        });
    }
};

/**
 * @desc    Get messages in a conversation
 * @route   GET /api/messages/:conversationId
 * @access  Private
 */
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        // Check if user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        if (!conversation.participants.includes(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this conversation'
            });
        }

        const messages = await Message.getForConversation(
            conversationId,
            parseInt(limit),
            parseInt(skip)
        );

        // Mark messages as read
        await Message.markAsRead(conversationId, req.user._id);

        res.status(200).json({
            success: true,
            data: messages.reverse() // Return in chronological order
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
};

/**
 * @desc    Start a new conversation
 * @route   POST /api/messages/start
 * @access  Private (role-based)
 */
export const startConversation = async (req, res) => {
    try {
        const { participantIds, title } = req.body;

        if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide participant IDs'
            });
        }

        // Check messaging permission
        const settings = await SystemSettings.getSettings(req.user.organization);

        if (settings.onlyAdminCanMessage && !MESSAGING_ADMIN_ROLES.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can start new conversations'
            });
        }

        // Include current user in participants
        const allParticipants = [...new Set([req.user._id.toString(), ...participantIds])];

        // Validate all participants exist
        const users = await User.find({ _id: { $in: allParticipants } });
        if (users.length !== allParticipants.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more participants not found'
            });
        }

        // For 1-on-1 chats, check if conversation already exists
        if (allParticipants.length === 2) {
            const existingConversation = await Conversation.findBetweenUsers(allParticipants);
            if (existingConversation) {
                // Return existing conversation
                const populated = await Conversation.findById(existingConversation._id)
                    .populate('participants', 'name email photo role')
                    .populate('lastMessage')
                    .populate('createdBy', 'name');

                return res.status(200).json({
                    success: true,
                    data: populated,
                    message: 'Using existing conversation'
                });
            }
        }

        // Create new conversation
        const conversation = await Conversation.create({
            participants: allParticipants,
            createdBy: req.user._id,
            organization: req.user.organization,
            title: title || null,
            isGroup: allParticipants.length > 2
        });

        const populated = await Conversation.findById(conversation._id)
            .populate('participants', 'name email photo role')
            .populate('createdBy', 'name');

        res.status(201).json({
            success: true,
            data: populated
        });
    } catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start conversation'
        });
    }
};

/**
 * @desc    Send a message to a conversation
 * @route   POST /api/messages/send
 * @access  Private
 */
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;

        if (!conversationId || !text) {
            return res.status(400).json({
                success: false,
                message: 'Please provide conversation ID and message text'
            });
        }

        // Check if conversation exists and user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this conversation'
            });
        }

        // Check if conversation has admin-only messaging enabled
        if (conversation.adminOnlyMessage && !MESSAGING_ADMIN_ROLES.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can send messages in this conversation'
            });
        }

        // Create message
        const message = await Message.create({
            conversationId,
            senderId: req.user._id,
            text,
            readBy: [{ user: req.user._id, readAt: new Date() }]
        });

        // Update conversation's last message and activity
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            lastActivityAt: new Date()
        });

        // Populate sender info
        const populated = await Message.findById(message._id)
            .populate('senderId', 'name email photo role');

        res.status(201).json({
            success: true,
            data: populated
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
};

/**
 * @desc    Mark messages as read
 * @route   PUT /api/messages/:conversationId/read
 * @access  Private
 */
export const markMessagesAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;

        // Check if user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        if (!conversation.participants.includes(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this conversation'
            });
        }

        await Message.markAsRead(conversationId, req.user._id);

        res.status(200).json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read'
        });
    }
};

/**
 * @desc    Get users available for chat
 * @route   GET /api/messages/users
 * @access  Private
 */
export const getChatUsers = async (req, res) => {
    try {
        // Get all users except current user
        const users = await User.find({
            _id: { $ne: req.user._id },
            isDeleted: { $ne: true },
            isActive: true
        })
            .select('name email photo role department')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get chat users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

/**
 * @desc    Update conversation settings (title, adminOnlyMessage)
 * @route   PUT /api/messages/conversations/:conversationId/settings
 * @access  Private (admin or creator only)
 */
export const updateConversationSettings = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { title, adminOnlyMessage } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Check if user is admin or creator
        const isAdmin = MESSAGING_ADMIN_ROLES.includes(req.user.role);
        const isCreator = conversation.createdBy.toString() === req.user._id.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators or the chat creator can modify settings'
            });
        }

        // Update fields
        if (title !== undefined) {
            conversation.title = title || null;
        }
        if (typeof adminOnlyMessage === 'boolean') {
            conversation.adminOnlyMessage = adminOnlyMessage;
        }

        await conversation.save();

        // Return populated conversation
        const updated = await Conversation.findById(conversationId)
            .populate('participants', 'name email photo role')
            .populate('lastMessage')
            .populate('createdBy', 'name');

        res.status(200).json({
            success: true,
            data: updated
        });
    } catch (error) {
        console.error('Update conversation settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings'
        });
    }
};

/**
 * @desc    Remove a member from a group conversation
 * @route   PUT /api/messages/conversations/:conversationId/remove-member
 * @access  Private (admin or creator only)
 */
export const removeMember = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide user ID to remove'
            });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Check if it's a group chat
        if (conversation.participants.length <= 2) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove members from a direct message'
            });
        }

        // Check if user is admin or creator
        const isAdmin = MESSAGING_ADMIN_ROLES.includes(req.user.role);
        const isCreator = conversation.createdBy.toString() === req.user._id.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators or the chat creator can remove members'
            });
        }

        // Cannot remove the creator
        if (userId === conversation.createdBy.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove the chat creator'
            });
        }

        // Check if user is a participant
        const userIndex = conversation.participants.findIndex(p => p.toString() === userId);
        if (userIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'User is not a participant in this conversation'
            });
        }

        // Remove user
        conversation.participants.splice(userIndex, 1);

        // If only 2 members left, it's no longer a group
        if (conversation.participants.length === 2) {
            conversation.isGroup = false;
        }

        await conversation.save();

        // Return populated conversation
        const updated = await Conversation.findById(conversationId)
            .populate('participants', 'name email photo role')
            .populate('lastMessage')
            .populate('createdBy', 'name');

        res.status(200).json({
            success: true,
            data: updated
        });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove member'
        });
    }
};

/**
 * @desc    Get users available to add to a conversation
 * @route   GET /api/messages/conversations/:conversationId/available-users
 * @access  Private (Admin/PM only)
 */
export const getAvailableUsers = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { search = '' } = req.query;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Get users not already in the conversation
        const existingParticipantIds = conversation.participants.map(p => p.toString());

        const query = {
            _id: { $nin: existingParticipantIds },
            isDeleted: { $ne: true },
            isActive: true
        };

        // Add search filter if provided
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('name email photo role department')
            .sort({ name: 1 })
            .limit(20);

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get available users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available users'
        });
    }
};

/**
 * @desc    Add members to a group conversation
 * @route   POST /api/messages/conversations/:conversationId/add-members
 * @access  Private (Admin/PM only)
 */
export const addMembers = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { members } = req.body;

        if (!members || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide member IDs to add'
            });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify all users exist
        const users = await User.find({ _id: { $in: members } });
        if (users.length !== members.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more users not found'
            });
        }

        // Filter out users already in conversation
        const existingIds = conversation.participants.map(p => p.toString());
        const newMembers = members.filter(m => !existingIds.includes(m.toString()));

        if (newMembers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'All selected users are already in the conversation'
            });
        }

        // Add new members
        conversation.participants.push(...newMembers);

        // Mark as group if it becomes more than 2 participants
        if (conversation.participants.length > 2) {
            conversation.isGroup = true;
        }

        await conversation.save();

        // Return populated conversation
        const updated = await Conversation.findById(conversationId)
            .populate('participants', 'name email photo role')
            .populate('lastMessage')
            .populate('createdBy', 'name');

        // Emit socket event for realtime update
        const io = req.app.get('io');
        if (io) {
            io.to(conversationId).emit('membersAdded', {
                conversationId,
                newMembers: users.filter(u => newMembers.includes(u._id.toString())),
                conversation: updated
            });
        }

        res.status(200).json({
            success: true,
            data: updated,
            message: `${newMembers.length} member(s) added successfully`
        });
    } catch (error) {
        console.error('Add members error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add members'
        });
    }
};

/**
 * @desc    Delete a conversation and all its messages
 * @route   DELETE /api/messages/conversations/:conversationId
 * @access  Private (Admin/PM only)
 */
export const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Check if user is authorized (admin or creator)
        const isAdmin = MESSAGING_ADMIN_ROLES.includes(req.user.role);
        const isCreator = conversation.createdBy?.toString() === req.user._id.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators or the conversation creator can delete this conversation'
            });
        }

        // Delete all messages in this conversation
        const deletedMessages = await Message.deleteMany({ conversationId });
        console.log(`Deleted ${deletedMessages.deletedCount} messages from conversation ${conversationId}`);

        // Delete the conversation
        await Conversation.findByIdAndDelete(conversationId);

        // Emit socket event for realtime update
        const io = req.app.get('io');
        if (io) {
            io.to(conversationId).emit('conversationDeleted', {
                conversationId
            });
        }

        res.status(200).json({
            success: true,
            message: `Conversation and ${deletedMessages.deletedCount} messages deleted successfully`
        });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete conversation'
        });
    }
};

/**
 * @desc    Edit a message
 * @route   PUT /api/messages/:messageId/edit
 * @access  Private (sender only)
 */
export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message text is required'
            });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only sender can edit
        if (message.senderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own messages'
            });
        }

        message.text = text.trim();
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        const updatedMessage = await Message.findById(messageId)
            .populate('senderId', 'name email photo role')
            .populate({
                path: 'replyTo',
                populate: { path: 'senderId', select: 'name' }
            });

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(message.conversationId.toString()).emit('messageEdited', {
                message: updatedMessage
            });
        }

        res.status(200).json({
            success: true,
            data: updatedMessage
        });
    } catch (error) {
        console.error('Edit message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to edit message'
        });
    }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:messageId
 * @access  Private (sender or admin)
 */
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        const isSender = message.senderId.toString() === req.user._id.toString();
        const isAdmin = MESSAGING_ADMIN_ROLES.includes(req.user.role);

        if (!isSender && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own messages'
            });
        }

        // Soft delete
        message.isDeleted = true;
        await message.save();

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(message.conversationId.toString()).emit('messageDeleted', {
                messageId: message._id,
                conversationId: message.conversationId
            });
        }

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message'
        });
    }
};

/**
 * @desc    Pin/Unpin a message
 * @route   POST /api/messages/:messageId/pin
 * @access  Private
 */
export const pinMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Toggle pin status
        message.isPinned = !message.isPinned;
        await message.save();

        const updatedMessage = await Message.findById(messageId)
            .populate('senderId', 'name email photo role')
            .populate({
                path: 'replyTo',
                populate: { path: 'senderId', select: 'name' }
            });

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(message.conversationId.toString()).emit('messagePinned', {
                message: updatedMessage
            });
        }

        res.status(200).json({
            success: true,
            data: updatedMessage,
            message: message.isPinned ? 'Message pinned' : 'Message unpinned'
        });
    } catch (error) {
        console.error('Pin message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to pin message'
        });
    }
};

/**
 * @desc    Star/Unstar a message
 * @route   POST /api/messages/:messageId/star
 * @access  Private
 */
export const starMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Toggle star for user
        const isStarred = message.isStarredBy.includes(userId);
        if (isStarred) {
            message.isStarredBy = message.isStarredBy.filter(
                id => id.toString() !== userId.toString()
            );
        } else {
            message.isStarredBy.push(userId);
        }
        await message.save();

        const updatedMessage = await Message.findById(messageId)
            .populate('senderId', 'name email photo role')
            .populate({
                path: 'replyTo',
                populate: { path: 'senderId', select: 'name' }
            });

        // Emit socket event (only to the user who starred)
        const io = req.app.get('io');
        if (io) {
            io.to(message.conversationId.toString()).emit('messageStarred', {
                message: updatedMessage,
                userId: userId
            });
        }

        res.status(200).json({
            success: true,
            data: updatedMessage,
            message: !isStarred ? 'Message starred' : 'Message unstarred'
        });
    } catch (error) {
        console.error('Star message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to star message'
        });
    }
};

export default {
    getConversations,
    getMessages,
    startConversation,
    sendMessage,
    markMessagesAsRead,
    getChatUsers,
    updateConversationSettings,
    removeMember,
    getAvailableUsers,
    addMembers,
    deleteConversation,
    editMessage,
    deleteMessage,
    pinMessage,
    starMessage
};
