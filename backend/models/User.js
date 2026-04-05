import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        trim: true
    },
    dob: {
        type: Date
    },
    address: {
        type: String,
        trim: true
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    photo: {
        type: String,
        default: 'default-avatar.png'
    },
    role: {
        type: String,
        enum: ['Super Admin', 'Project Admin', 'Project Manager', 'Team Lead', 'Team Member', 'Client'],
        default: 'Team Member'
    },
    designation: {
        type: String,
        default: 'Employee'
    },
    department: {
        type: String
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    skills: [{
        name: String,
        proficiency: { type: Number, min: 0, max: 100, default: 0 }
    }],
    leaveBalance: {
        total: { type: Number, default: 20 },
        taken: { type: Number, default: 0 },
        lossOfPay: { type: Number, default: 0 }
    },
    attendance: {
        onTime: { type: Number, default: 0 },
        late: { type: Number, default: 0 },
        wfh: { type: Number, default: 0 },
        absent: { type: Number, default: 0 },
        sickLeave: { type: Number, default: 0 },
        workedDays: { type: Number, default: 0 }
    },
    currentStatus: {
        isPunchedIn: { type: Boolean, default: false },
        punchInTime: Date,
        punchOutTime: Date,
        workedHoursToday: { type: Number, default: 0 },
        productiveHoursToday: { type: Number, default: 0 }
    },
    isActive: {
        type: Boolean,
        default: true
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

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
