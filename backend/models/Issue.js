import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide issue title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide issue description'],
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    priority: {
        type: String,
        enum: ['Immediate', 'High', 'Normal', 'Low'],
        default: 'Normal'
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Testing', 'Resolved', 'Closed'],
        default: 'Open'
    },
    category: {
        type: String,
        enum: ['Bug', 'Enhancement', 'Task Issue'],
        default: 'Bug'
    },
    attachments: [{
        filename: String,
        path: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    resolvedAt: Date,
    closedAt: Date
}, {
    timestamps: true
});

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
