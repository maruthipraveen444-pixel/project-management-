/**
 * Messaging Middleware
 * Role-based access control for messaging features
 */

import Conversation from '../models/Conversation.js';

// Roles that can create new conversations
const CONVERSATION_CREATOR_ROLES = ['Super Admin', 'Project Admin'];

// Admin roles for messaging features (can modify groups)
const MESSAGING_ADMIN_ROLES = ['Super Admin', 'Project Admin'];

/**
 * Middleware to check if user can start a new conversation
 * Only ADMIN and PROJECT_MANAGER can create conversations
 */
export const canStartConversation = (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
        return res.status(401).json({
            success: false,
            message: 'User role not found. Please log in again.'
        });
    }

    if (CONVERSATION_CREATOR_ROLES.includes(role)) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'You are not allowed to create a new conversation. Only Admin and Project Manager can start new chats.'
    });
};

/**
 * Middleware to check if user can send a message
 * User must be a participant in the conversation
 */
export const canSendMessage = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { conversationId } = req.body;

        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: 'Conversation ID is required'
            });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Check if user is a participant
        const isParticipant = conversation.participants.some(
            p => p.toString() === userId.toString()
        );

        if (!isParticipant) {
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

        // Attach conversation to request for use in controller
        req.conversation = conversation;
        next();
    } catch (error) {
        console.error('canSendMessage middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify message permissions'
        });
    }
};

/**
 * Middleware to check if user can modify group (add/remove members)
 * Only ADMIN and PROJECT_MANAGER can modify groups
 */
export const canModifyGroup = (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
        return res.status(401).json({
            success: false,
            message: 'User role not found. Please log in again.'
        });
    }

    if (MESSAGING_ADMIN_ROLES.includes(role)) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Only Admin and Project Manager can modify group members.'
    });
};

/**
 * Check if a role can create conversations
 * @param {string} role - User role
 * @returns {boolean}
 */
export const canRoleCreateConversation = (role) => {
    return CONVERSATION_CREATOR_ROLES.includes(role);
};

/**
 * Check if a role is an admin role
 * @param {string} role - User role
 * @returns {boolean}
 */
export const isAdminRole = (role) => {
    return MESSAGING_ADMIN_ROLES.includes(role);
};

export default {
    canStartConversation,
    canSendMessage,
    canModifyGroup,
    canRoleCreateConversation,
    isAdminRole,
    CONVERSATION_CREATOR_ROLES,
    MESSAGING_ADMIN_ROLES
};
