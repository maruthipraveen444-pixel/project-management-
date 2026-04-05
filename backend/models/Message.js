import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    // Reference to the conversation
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    // User who sent the message
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Message content
    text: {
        type: String,
        required: [true, 'Message text is required'],
        trim: true,
        maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    // Users who have read this message
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Message type (for future extensions like file attachments)
    messageType: {
        type: String,
        enum: ['text', 'file', 'image', 'system'],
        default: 'text'
    },
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    // Pin status
    isPinned: {
        type: Boolean,
        default: false
    },
    // Users who have starred this message
    isStarredBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Reply to another message
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    // Edit tracking
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for efficient querying
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

/**
 * Get messages for a conversation with pagination
 * @param {ObjectId} conversationId - Conversation ID
 * @param {number} limit - Number of messages to fetch
 * @param {number} skip - Number of messages to skip
 * @returns {Promise<Array>} - Array of messages
 */
messageSchema.statics.getForConversation = async function (conversationId, limit = 50, skip = 0) {
    return this.find({
        conversationId,
        isDeleted: false
    })
        .populate('senderId', 'name email photo role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

/**
 * Mark messages as read by user
 * @param {ObjectId} conversationId - Conversation ID
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} - Update result
 */
messageSchema.statics.markAsRead = async function (conversationId, userId) {
    return this.updateMany(
        {
            conversationId,
            senderId: { $ne: userId },
            'readBy.user': { $ne: userId }
        },
        {
            $push: {
                readBy: { user: userId, readAt: new Date() }
            }
        }
    );
};

/**
 * Get unread count for a user in a conversation
 * @param {ObjectId} conversationId - Conversation ID
 * @param {ObjectId} userId - User ID
 * @returns {Promise<number>} - Unread message count
 */
messageSchema.statics.getUnreadCount = async function (conversationId, userId) {
    return this.countDocuments({
        conversationId,
        senderId: { $ne: userId },
        'readBy.user': { $ne: userId },
        isDeleted: false
    });
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
