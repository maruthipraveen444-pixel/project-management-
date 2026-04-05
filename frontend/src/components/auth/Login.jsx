import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, LayoutDashboard, ShieldAlert } from 'lucide-react';

// Access Warning Modal Component
const AccessWarningModal = ({ onClose }) => (
    <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
        <div className="bg-surface rounded-2xl w-full max-w-md border border-border shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 flex items-center gap-3 border-b border-border">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                    <ShieldAlert className="text-amber-400" size={24} />
                </div>
                <h2 className="text-lg font-bold text-text-main">Access Notice</h2>
            </div>

            {/* Body */}
            <div className="p-6">
                <p className="text-text-main leading-relaxed text-center">
                    Only <span className="text-purple-400 font-semibold">Super Admin</span>,
                    <span className="text-blue-400 font-semibold"> Project Manager</span>,
                    <span className="text-cyan-400 font-semibold"> Team Lead</span>, and
                    <span className="text-green-400 font-semibold"> Team Members</span> are
                    allowed to access this system.
                </p>
                <p className="text-text-muted text-sm text-center mt-3">
                    Unauthorized users cannot log in.
                </p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-background/50">
                <button
                    onClick={onClose}
                    type="button"
                    className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-all font-bold"
                >
                    I Understand
                </button>
            </div>
        </div>
    </div>
);

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAccessWarning, setShowAccessWarning] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // Show warning once per session
    useEffect(() => {
        const hasSeenWarning = sessionStorage.getItem('accessWarningShown');
        if (!hasSeenWarning) {
            setShowAccessWarning(true);
        }
    }, []);

    const handleCloseWarning = () => {
        sessionStorage.setItem('accessWarningShown', 'true');
        setShowAccessWarning(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    // Demo account selection helper
    const handleDemoLogin = (email, password) => {
        setFormData({ email, password });
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Access Warning Modal */}
            {showAccessWarning && <AccessWarningModal onClose={handleCloseWarning} />}

            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="card w-full max-w-md relative z-10 glass">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-tr from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-all duration-300">
                            <LayoutDashboard className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-text-main mb-2">Welcome Back!</h1>
                    <p className="text-text-muted">Sign in to access your dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field pr-10"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-text-muted cursor-pointer hover:text-text-main transition-colors">
                            <input type="checkbox" className="mr-2 rounded border-border bg-surface text-primary-500 focus:ring-primary-500/40" />
                            Remember me
                        </label>
                        <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">Forgot Password?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary flex items-center justify-center"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                        Create Account
                    </Link>
                </div>

                {/* Demo Credentials Section */}
                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-text-muted text-center mb-3 font-medium">Demo Accounts (click to auto-fill)</p>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar">
                        {[
                            { role: 'Super Admin', email: 'jonathan@acme.com', color: 'bg-purple-500' },
                            { role: 'Project Manager', email: 'anthony@acme.com', color: 'bg-blue-500' },
                            { role: 'Team Lead', email: 'brian@acme.com', color: 'bg-cyan-500' },
                            { role: 'Team Member', email: 'troy@acme.com', color: 'bg-green-500' },
                            { role: 'Team Member', email: 'andrew@acme.com', color: 'bg-green-500' },
                            { role: 'Team Member', email: 'harvey@acme.com', color: 'bg-green-500' },
                        ].map((user, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleDemoLogin(user.email, 'password123')}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-surface/50 hover:bg-surface-hover transition-colors text-left group"
                            >
                                <span className={`w-2 h-2 rounded-full ${user.color} shrink-0`}></span>
                                <span className="text-xs font-medium text-text-secondary min-w-[95px]">{user.role}</span>
                                <span className="text-xs text-text-muted group-hover:text-text-main transition-colors flex-1 text-right truncate">{user.email}</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-text-muted text-center mt-2">Password: password123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
