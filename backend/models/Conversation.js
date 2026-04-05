import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    // Participants in the conversation
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    // User who created/started the conversation
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Reference to the last message (for sorting and preview)
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    // Last activity timestamp for sorting
    lastActivityAt: {
        type: Date,
        default: Date.now
    },
    // Organization reference
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    // Conversation title (optional, for group chats)
    title: {
        type: String,
        trim: true
    },
    // Is this a group conversation
    isGroup: {
        type: Boolean,
        default: false
    },
    // Admin only message - only admins can send messages if true
    adminOnlyMessage: {
        type: Boolean,
        default: false
    },
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient querying
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastActivityAt: -1 });
conversationSchema.index({ organization: 1, participants: 1 });

/**
 * Find conversation between specific participants
 * @param {Array<ObjectId>} participantIds - Array of user IDs
 * @returns {Promise<Document|null>} - Existing conversation or null
 */
conversationSchema.statics.findBetweenUsers = async function (participantIds) {
    // For 1-on-1 conversations, find exact match
    if (participantIds.length === 2) {
        return this.findOne({
            participants: { $all: participantIds, $size: 2 },
            isGroup: false,
            isDeleted: false
        });
    }
    return null;
};

/**
 * Get conversations for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Array>} - Array of conversations
 */
conversationSchema.statics.getForUser = async function (userId) {
    return this.find({
        participants: userId,
        isDeleted: false
    })
        .populate('participants', 'name email photo role')
        .populate('lastMessage')
        .populate('createdBy', 'name')
        .sort({ lastActivityAt: -1 });
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
