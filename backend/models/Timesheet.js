import mongoose from 'mongoose';

const timesheetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    date: {
        type: Date,
        required: true
    },
    hours: {
        type: Number,
        required: true,
        min: 0,
        max: 24
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String,
    isBillable: {
        type: Boolean,
        default: true
    },
    isOvertime: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Update project and task time spent when timesheet is approved
timesheetSchema.post('save', async function () {
    if (this.status === 'Approved') {
        // Update task time spent
        if (this.task) {
            const Task = mongoose.model('Task');
            const task = await Task.findById(this.task);
            if (task) {
                task.timeSpent = (task.timeSpent || 0) + this.hours;
                await task.save();
            }
        }

        // Update project time spent
        const Project = mongoose.model('Project');
        const project = await Project.findById(this.project);
        if (project) {
            project.timeSpent = (project.timeSpent || 0) + this.hours;
            await project.save();
        }
    }
});

const Timesheet = mongoose.model('Timesheet', timesheetSchema);

export default Timesheet;
