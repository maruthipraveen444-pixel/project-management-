import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
    // Messaging settings
    onlyAdminCanMessage: {
        type: Boolean,
        default: false,
        description: 'If true, only admins can start new conversations'
    },
    // Organization reference (for multi-tenant support)
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    }
}, {
    timestamps: true
});

// Ensure only one settings document per organization
systemSettingsSchema.index({ organization: 1 }, { unique: true, sparse: true });

/**
 * Get or create system settings
 * @param {ObjectId} organizationId - Optional organization ID
 * @returns {Promise<Document>} - System settings document
 */
systemSettingsSchema.statics.getSettings = async function (organizationId = null) {
    let settings = await this.findOne({ organization: organizationId });

    if (!settings) {
        settings = await this.create({
            organization: organizationId,
            onlyAdminCanMessage: false
        });
    }

    return settings;
};

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

export default SystemSettings;
