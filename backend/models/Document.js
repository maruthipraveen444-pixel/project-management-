import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide document name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    filename: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number
    },
    fileType: {
        type: String
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    version: {
        type: Number,
        default: 1
    },
    previousVersions: [{
        version: Number,
        filePath: String,
        uploadedAt: Date,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    accessControl: {
        type: String,
        enum: ['Public', 'Private', 'Restricted'],
        default: 'Restricted'
    },
    allowedRoles: [{
        type: String,
        enum: ['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead', 'Team Member', 'Client']
    }],
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [String]
}, {
    timestamps: true
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
