import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
    name: String,
    description: String,
    dueDate: Date,
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'Delayed'],
        default: 'Not Started'
    },
    completedAt: Date
});

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide project name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'On Hold', 'Completed', 'Archived'],
        default: 'Active'
    },
    currentMilestone: {
        type: String,
        enum: ['Planning', 'Design', 'Development', 'Testing', 'Deployment', 'Maintenance'],
        required: [true, 'Please select a milestone']
    },

    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    projectLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamMembers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: String,
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    milestones: [milestoneSchema],
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    totalTasks: {
        type: Number,
        default: 0
    },
    completedTasks: {
        type: Number,
        default: 0
    },
    timeSpent: {
        type: Number,
        default: 0
    },
    estimatedHours: {
        type: Number,
        default: 0
    },
    tags: [String],
    color: {
        type: String,
        default: '#3B82F6'
    },
    // Soft delete fields
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Calculate progress based on completed tasks
projectSchema.methods.updateProgress = function () {
    if (this.totalTasks > 0) {
        this.progress = Math.round((this.completedTasks / this.totalTasks) * 100);
    } else {
        this.progress = 0;
    }
};

const Project = mongoose.model('Project', projectSchema);

export default Project;
