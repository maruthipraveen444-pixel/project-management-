import express from 'express';
import { protect } from '../middleware/auth.js';
import { canStartConversation, canSendMessage, canModifyGroup } from '../middleware/messagingMiddleware.js';
import {
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
} from '../controllers/messageController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get available users for chat
router.get('/users', getChatUsers);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Get messages in a conversation
router.get('/:conversationId', getMessages);

// Start a new conversation - ONLY Admin and Project Manager
router.post('/start', canStartConversation, startConversation);

// Send a message - Must be participant + admin-only check
router.post('/send', canSendMessage, sendMessage);

// Mark messages as read
router.put('/:conversationId/read', markMessagesAsRead);

// Update conversation settings (group name, admin only message)
router.put('/conversations/:conversationId/settings', updateConversationSettings);

// Get available users to add to a conversation - Admin/PM only
router.get('/conversations/:conversationId/available-users', canModifyGroup, getAvailableUsers);

// Add members to group - Admin/PM only
router.post('/conversations/:conversationId/add-members', canModifyGroup, addMembers);

// Remove member from group - Admin/PM only
router.put('/conversations/:conversationId/remove-member', canModifyGroup, removeMember);

// Delete conversation and all messages - Admin/PM or creator only
router.delete('/conversations/:conversationId', deleteConversation);

// ============================================
// Message Actions
// ============================================

// Edit a message (sender only)
router.put('/:messageId/edit', editMessage);

// Delete a message (sender or admin)
router.delete('/:messageId', deleteMessage);

// Pin/Unpin a message
router.post('/:messageId/pin', pinMessage);

// Star/Unstar a message
router.post('/:messageId/star', starMessage);

export default router;
