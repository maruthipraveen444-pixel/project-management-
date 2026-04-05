import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide organization name'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        default: 'default-org-logo.png'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        workingHoursPerDay: {
            type: Number,
            default: 8
        },
        workingDaysPerWeek: {
            type: Number,
            default: 5
        },
        timezone: {
            type: String,
            default: 'Asia/Kolkata'
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
