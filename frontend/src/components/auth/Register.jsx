import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Building2, Zap, Lock, Mail, User } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        organizationName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            organizationName: formData.organizationName
        });
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    const inputStyle = {
        width: '100%',
        padding: '0.8rem 1rem 0.8rem 2.75rem',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        fontFamily: 'inherit',
        transition: 'all 0.25s ease',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)',
        outline: 'none',
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = 'rgba(91,156,246,0.55)';
        e.target.style.background = 'rgba(255,255,255,0.075)';
        e.target.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.2),0 0 0 3px rgba(91,156,246,0.14)';
    };
    const handleBlur = (e) => {
        e.target.style.borderColor = 'rgba(255,255,255,0.10)';
        e.target.style.background = 'rgba(255,255,255,0.05)';
        e.target.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.25)';
    };

    const fields = [
        { name:'name',             label:'Full Name',          type:'text',     icon: User,      placeholder:'John Doe',          gridHalf: true },
        { name:'organizationName', label:'Organization',       type:'text',     icon: Building2, placeholder:'Acme Corp.',        gridHalf: true },
        { name:'email',            label:'Email Address',      type:'email',    icon: Mail,      placeholder:'name@company.com',  gridHalf: false },
        { name:'password',         label:'Password',           type:'password', icon: Lock,      placeholder:'Create password',   gridHalf: true },
        { name:'confirmPassword',  label:'Confirm Password',   type:'password', icon: Lock,      placeholder:'Confirm password',  gridHalf: true },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
             style={{ background: 'var(--bg-primary)' }}>
            <div className="glow-orb glow-orb-1"/>
            <div className="glow-orb glow-orb-2"/>

            <div className="w-full max-w-xl relative z-10 py-6">
                {/* Glass card */}
                <div className="relative overflow-hidden"
                     style={{
                         background: 'rgba(7,12,28,0.82)',
                         backdropFilter: 'blur(40px)',
                         WebkitBackdropFilter: 'blur(40px)',
                         border: '1px solid rgba(255,255,255,0.11)',
                         borderRadius: '28px',
                         boxShadow: '0 32px 80px rgba(0,0,0,0.75), 0 0 60px rgba(91,156,246,0.06), inset 0 1px 0 rgba(255,255,255,0.18)',
                         padding: '2.5rem',
                     }}>
                    {/* Bevel */}
                    <div className="absolute top-0 left-8 right-8 h-px pointer-events-none"
                         style={{ background: 'linear-gradient(90deg,transparent,rgba(91,156,246,0.5),rgba(167,139,250,0.4),transparent)' }}/>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-5">
                            <div className="w-[68px] h-[68px] rounded-[20px] flex items-center justify-center relative overflow-hidden animate-float"
                                 style={{
                                     background: 'linear-gradient(135deg,#5b9cf6 0%,#a78bfa 100%)',
                                     border: '1px solid rgba(255,255,255,0.28)',
                                     boxShadow: '0 12px 40px rgba(91,156,246,0.55), 0 0 80px rgba(167,139,250,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
                                 }}>
                                <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[20px]"
                                     style={{ background: 'rgba(255,255,255,0.22)' }}/>
                                <Zap size={30} className="text-white relative z-10" fill="white"/>
                            </div>
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight mb-1.5"
                            style={{
                                background: 'linear-gradient(135deg,#eef2ff 0%,#93c5fd 50%,#c4b5fd 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                            Create Your Workspace
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Set up your organization and start managing projects
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 p-4 rounded-[14px] text-sm text-center"
                             style={{
                                 background: 'rgba(251,113,133,0.1)',
                                 border: '1px solid rgba(251,113,133,0.25)',
                                 color: '#fda4af',
                                 boxShadow: '0 0 20px rgba(251,113,133,0.08)',
                             }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {fields.filter(f => f.gridHalf).slice(0,2).map(field => (
                                <div key={field.name}>
                                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
                                           style={{ color: 'rgba(255,255,255,0.4)' }}>
                                        {field.label}
                                    </label>
                                    <div className="relative">
                                        <field.icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                                    style={{ color: 'rgba(255,255,255,0.3)' }}/>
                                        <input
                                            type={field.type === 'password' ? (showPassword ? 'text' : 'password') : field.type}
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            required
                                            style={inputStyle}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
                                   style={{ color: 'rgba(255,255,255,0.4)' }}>Email Address</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                      style={{ color: 'rgba(255,255,255,0.3)' }}/>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@company.com"
                                    required
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {['password','confirmPassword'].map(fName => (
                                <div key={fName}>
                                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-widest"
                                           style={{ color: 'rgba(255,255,255,0.4)' }}>
                                        {fName === 'password' ? 'Password' : 'Confirm Password'}
                                    </label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                              style={{ color: 'rgba(255,255,255,0.3)' }}/>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name={fName}
                                            value={formData[fName]}
                                            onChange={handleChange}
                                            placeholder={fName === 'password' ? 'Create password' : 'Confirm password'}
                                            required
                                            minLength={6}
                                            style={{ ...inputStyle, paddingRight: fName === 'password' ? '2.75rem' : '1rem' }}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                        />
                                        {fName === 'password' && (
                                            <button type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                                    style={{ color: 'rgba(255,255,255,0.35)' }}
                                                    onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
                                                    onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.35)'}>
                                                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                            ) : (
                                <>
                                    <Zap size={15} fill="white"/>
                                    Get Started — It's Free
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login"
                              className="font-bold transition-colors"
                              style={{ color: '#5b9cf6' }}
                              onMouseEnter={e => e.currentTarget.style.color='#93c5fd'}
                              onMouseLeave={e => e.currentTarget.style.color='#5b9cf6'}>
                            Sign In →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
