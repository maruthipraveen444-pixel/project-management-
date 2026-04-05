import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    punchInTime: {
        type: Date,
        required: true
    },
    punchOutTime: {
        type: Date
    },
    breakTime: {
        type: Number,
        default: 0 // in minutes
    },
    totalHours: {
        type: Number,
        default: 0
    },
    overtime: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Completed'],
        default: 'Active'
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Compound unique index: one record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Calculate total hours and overtime before saving
attendanceSchema.pre('save', function (next) {
    if (this.punchInTime && this.punchOutTime) {
        // Calculate total worked time in hours
        const workedMs = this.punchOutTime - this.punchInTime;
        const workedHours = workedMs / (1000 * 60 * 60);

        // Subtract break time (convert from minutes to hours)
        const breakHours = this.breakTime / 60;
        this.totalHours = Math.max(0, workedHours - breakHours);

        // Calculate overtime (anything over 8 hours)
        const standardHours = 8;
        this.overtime = Math.max(0, this.totalHours - standardHours);

        // Mark as completed
        this.status = 'Completed';
    }
    next();
});

// Static method to get today's date at midnight (for comparison)
attendanceSchema.statics.getToday = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

// Static method to find today's record for a user
attendanceSchema.statics.findTodayRecord = async function (userId) {
    const today = this.getToday();
    return this.findOne({
        user: userId,
        date: today
    });
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
