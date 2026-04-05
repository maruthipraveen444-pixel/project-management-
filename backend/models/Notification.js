import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'Task Assigned',
            'Task Updated',
            'Task Completed',
            'Comment Added',
            'File Uploaded',
            'Leave Request',
            'Leave Approved',
            'Leave Rejected',
            'Timesheet Approved',
            'Timesheet Rejected',
            'Project Update',
            'Meeting Scheduled',
            'Deadline Approaching',
            'Milestone Completed',
            'Birthday',
            'System'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    relatedTo: {
        model: {
            type: String,
            enum: ['Task', 'Project', 'Issue', 'Timesheet', 'Document', 'User']
        },
        id: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    }
}, {
    timestamps: true
});

// Create notification helper function
notificationSchema.statics.createNotification = async function (data) {
    return await this.create(data);
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
