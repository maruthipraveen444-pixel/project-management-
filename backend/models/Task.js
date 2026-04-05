import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
    title: String,
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: Date
});

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide task title'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'To Do', 'In Progress', 'In Review', 'Completed', 'Blocked'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    dueDate: {
        type: Date
    },
    startDate: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    subtasks: [subtaskSchema],
    dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    timeSpent: {
        type: Number,
        default: 0
    },
    estimatedHours: {
        type: Number,
        default: 0
    },
    tags: [String],
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
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Update project task counts when task status changes
taskSchema.post('save', async function () {
    const Project = mongoose.model('Project');
    const project = await Project.findById(this.project);

    if (project) {
        const Task = mongoose.model('Task');
        const totalTasks = await Task.countDocuments({ project: this.project });
        const completedTasks = await Task.countDocuments({
            project: this.project,
            status: 'Completed'
        });

        project.totalTasks = totalTasks;
        project.completedTasks = completedTasks;
        project.updateProgress();
        await project.save();
    }
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
