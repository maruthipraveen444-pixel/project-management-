import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Lock, Palette, Shield, ChevronLeft, Save, X, Eye, EyeOff, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMessaging } from '../context/MessagingContext';

const Settings = () => {
    const { user } = useAuth();
    const { messagingSettings, updateMessagingSettings, isAdmin } = useMessaging();
    const [activeSection, setActiveSection] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        username: user?.name || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        enable2FA: false
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Messaging Settings State
    const [messagingData, setMessagingData] = useState({
        onlyAdminCanMessage: messagingSettings?.onlyAdminCanMessage || false
    });

    // Sync messaging data with context
    useEffect(() => {
        setMessagingData({
            onlyAdminCanMessage: messagingSettings?.onlyAdminCanMessage || false
        });
    }, [messagingSettings]);

    const settingSections = [
        { id: 'profile', icon: User, title: 'Profile', description: 'Manage your personal information', showFor: 'all' },
        { id: 'messaging', icon: MessageSquare, title: 'Messaging', description: 'Configure messaging permissions', showFor: 'admin' },
        { id: 'notifications', icon: Bell, title: 'Notifications', description: 'Configure notification preferences', showFor: 'all' },
        { id: 'security', icon: Lock, title: 'Security', description: 'Password and security settings', showFor: 'all' },
        { id: 'appearance', icon: Palette, title: 'Appearance', description: 'Customize your experience', showFor: 'all' }
    ];

    // Filter sections based on user role
    const visibleSections = settingSections.filter(section => {
        if (section.showFor === 'all') return true;
        if (section.showFor === 'admin') return isAdmin();
        return false;
    });

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        setActiveSection(null);
        alert('Changes saved successfully!');
    };

    const handleMessagingSave = async () => {
        setIsSaving(true);
        try {
            await updateMessagingSettings(messagingData.onlyAdminCanMessage);
            setActiveSection(null);
        } catch (error) {
            console.error('Failed to save messaging settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const renderProfileSection = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => setActiveSection(null)}
                    className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-text-main">Edit Profile</h2>
                    <p className="text-text-muted text-sm">Update your identity and security settings</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Identity Section */}
                <div className="card p-6 border-border bg-surface/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <User className="text-blue-400" size={20} />
                        </div>
                        <h3 className="font-semibold text-text-main text-lg">Identity</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">Username</label>
                            <input
                                type="text"
                                value={profileData.username}
                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                className="input-field w-full"
                                placeholder="Enter your name"
                            />
                            <p className="text-xs text-text-muted mt-1.5 text-left pl-1">This name will be visible to your team members.</p>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="card p-6 border-border bg-surface/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Lock className="text-purple-400" size={20} />
                        </div>
                        <h3 className="font-semibold text-text-main text-lg">Change Password</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-muted mb-1.5 text-left">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    value={profileData.currentPassword}
                                    onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                                    className="input-field w-full pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                                >
                                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5 text-left">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    value={profileData.newPassword}
                                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                                    className="input-field w-full pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                                >
                                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5 text-left">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    value={profileData.confirmPassword}
                                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                                    className="input-field w-full pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                                >
                                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Authentication Section */}
                <div className="card p-6 border-border bg-surface/50 text-left">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Shield className="text-green-400" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-main text-lg">Two-Factor Authentication (2FA)</h3>
                                <p className="text-sm text-text-muted">Add an extra layer of security to your account.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setProfileData({ ...profileData, enable2FA: !profileData.enable2FA })}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${profileData.enable2FA ? 'bg-blue-600' : 'bg-surface-hover'}`}
                        >
                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${profileData.enable2FA ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 pl-11">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${profileData.enable2FA ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {profileData.enable2FA ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <button
                    onClick={() => setActiveSection(null)}
                    className="px-6 py-2 rounded-lg text-text-muted hover:text-white hover:bg-surface-hover transition-all text-sm font-medium"
                >
                    Discard Changes
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-all text-sm font-semibold shadow-lg shadow-blue-500/10"
                >
                    {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Save size={18} />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );

    const renderMessagingSection = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => setActiveSection(null)}
                    className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-text-main">Messaging Settings</h2>
                    <p className="text-text-muted text-sm">Control messaging permissions for your organization</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Admin Only Messaging */}
                <div className="card p-6 border-border bg-surface/50 text-left">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-500/10 rounded-lg">
                                <MessageSquare className="text-primary-400" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-main text-lg">Only Admin Can Message</h3>
                                <p className="text-sm text-text-muted">
                                    When enabled, only administrators can start new conversations.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setMessagingData({ ...messagingData, onlyAdminCanMessage: !messagingData.onlyAdminCanMessage })}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${messagingData.onlyAdminCanMessage ? 'bg-primary-500' : 'bg-surface-hover'}`}
                        >
                            <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${messagingData.onlyAdminCanMessage ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="ml-11 p-4 bg-background/50 rounded-lg border border-border">
                        <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1.5 ${messagingData.onlyAdminCanMessage ? 'bg-yellow-400' : 'bg-green-400'}`} />
                            <div>
                                <p className="text-sm text-text-muted">
                                    {messagingData.onlyAdminCanMessage ? (
                                        <>
                                            <span className="font-medium text-yellow-400">Restricted Mode:</span> Only Super Admin and Project Admin can start new conversations.
                                            Team Leads and Team Members can only reply to existing threads.
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-medium text-green-400">Open Mode:</span> All team members can start new conversations and reply to existing ones.
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Roles info */}
                    <div className="mt-4 ml-11">
                        <p className="text-xs text-text-muted mb-2">Admin roles with full messaging access:</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">Super Admin</span>
                            <span className="px-2 py-1 text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full">Project Admin</span>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="card p-4 border-border bg-blue-500/5 border-blue-500/20 text-left">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                            <Shield className="text-blue-400" size={18} />
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-400 mb-1">How it works</h4>
                            <ul className="text-sm text-text-muted space-y-1">
                                <li>• When toggle is <span className="text-yellow-400">ON</span>: Only admins see the "New Chat" button enabled</li>
                                <li>• Non-admin users will see the button disabled with a tooltip</li>
                                <li>• All users can always reply to existing conversations</li>
                                <li>• Changes apply immediately to all users</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <button
                    onClick={() => {
                        setMessagingData({ onlyAdminCanMessage: messagingSettings?.onlyAdminCanMessage || false });
                        setActiveSection(null);
                    }}
                    className="px-6 py-2 rounded-lg text-text-muted hover:text-white hover:bg-surface-hover transition-all text-sm font-medium"
                >
                    Cancel
                </button>
                <button
                    onClick={handleMessagingSave}
                    disabled={isSaving || messagingData.onlyAdminCanMessage === messagingSettings?.onlyAdminCanMessage}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-surface-hover disabled:cursor-not-allowed text-white rounded-lg transition-all text-sm font-semibold shadow-lg shadow-primary-500/20 disabled:shadow-none"
                >
                    {isSaving ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'profile':
                return renderProfileSection();
            case 'messaging':
                return renderMessagingSection();
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            {!activeSection ? (
                <div className="space-y-6">
                    <div className="mb-8 text-left">
                        <h1 className="text-3xl font-bold text-text-main mb-2">Settings</h1>
                        <p className="text-text-muted">Manage your account preferences and security settings</p>
                    </div>

                    <div className="grid gap-4">
                        {visibleSections.map((section) => (
                            <div
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className="card p-6 hover:border-border-hover hover:bg-surface-hover/40 transition-all cursor-pointer group animate-fadeIn"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <section.icon className="text-primary-400" size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-text-main text-lg group-hover:text-primary-400 transition-colors">{section.title}</h3>
                                                {section.showFor === 'admin' && (
                                                    <span className="px-2 py-0.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">Admin</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-text-muted">{section.description}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-muted group-hover:bg-primary-500 group-hover:text-white transition-all">
                                        <ChevronLeft className="rotate-180" size={18} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            ) : (
                renderSectionContent()
            )}
        </div>
    );
};

export default Settings;
