import SystemSettings from '../models/SystemSettings.js';

// Admin roles that can modify settings
const SETTINGS_ADMIN_ROLES = ['Super Admin', 'Project Admin'];

/**
 * @desc    Get messaging settings
 * @route   GET /api/settings/messaging
 * @access  Private
 */
export const getMessagingSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.getSettings(req.user.organization);

        res.status(200).json({
            success: true,
            data: {
                onlyAdminCanMessage: settings.onlyAdminCanMessage
            }
        });
    } catch (error) {
        console.error('Get messaging settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messaging settings'
        });
    }
};

/**
 * @desc    Update messaging settings
 * @route   PUT /api/settings/messaging
 * @access  Private (Admin only)
 */
export const updateMessagingSettings = async (req, res) => {
    try {
        // Check if user is admin
        if (!SETTINGS_ADMIN_ROLES.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can modify messaging settings'
            });
        }

        const { onlyAdminCanMessage } = req.body;

        if (typeof onlyAdminCanMessage !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid boolean value for onlyAdminCanMessage'
            });
        }

        const settings = await SystemSettings.getSettings(req.user.organization);
        settings.onlyAdminCanMessage = onlyAdminCanMessage;
        await settings.save();

        res.status(200).json({
            success: true,
            data: {
                onlyAdminCanMessage: settings.onlyAdminCanMessage
            },
            message: 'Messaging settings updated successfully'
        });
    } catch (error) {
        console.error('Update messaging settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update messaging settings'
        });
    }
};

export default {
    getMessagingSettings,
    updateMessagingSettings
};
