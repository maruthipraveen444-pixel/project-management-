import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ShieldAlert, Zap, Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';

/* ── Access Warning Modal ─────────────────────────────── */
const AccessWarningModal = ({ onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
         style={{ background: 'rgba(3,6,15,0.85)', backdropFilter: 'blur(20px)', animation: 'fadeIn 0.3s ease-out' }}>
        <div className="w-full max-w-md relative overflow-hidden"
             style={{
                 background: 'rgba(7,12,28,0.95)',
                 backdropFilter: 'blur(40px)',
                 border: '1px solid rgba(255,255,255,0.12)',
                 borderRadius: '24px',
                 boxShadow: '0 32px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.18)',
             }}>
            <div className="absolute top-0 left-8 right-8 h-px"
                 style={{ background: 'linear-gradient(90deg,transparent,rgba(251,191,36,0.6),rgba(251,191,36,0.6),transparent)' }}/>

            {/* Header */}
            <div className="flex items-center gap-3 p-5"
                 style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(135deg,rgba(251,191,36,0.08),rgba(249,115,22,0.08))' }}>
                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center relative overflow-hidden"
                     style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 20px rgba(251,191,36,0.4)' }}>
                    <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[14px]" style={{ background: 'rgba(255,255,255,0.2)' }}/>
                    <ShieldAlert className="text-white relative z-10" size={20}/>
                </div>
                <div>
                    <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Access Notice</h2>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Role-based authentication</p>
                </div>
            </div>

            <div className="p-6 text-center">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    Only&nbsp;
                    <span style={{ color: '#c4b5fd', fontWeight: 700 }}>Super Admin</span>,&nbsp;
                    <span style={{ color: '#93c5fd', fontWeight: 700 }}>Project Manager</span>,&nbsp;
                    <span style={{ color: '#67e8f9', fontWeight: 700 }}>Team Lead</span>, and&nbsp;
                    <span style={{ color: '#6ee7b7', fontWeight: 700 }}>Team Members</span>&nbsp;
                    may access this system.
                </p>
                <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>Unauthorized users will be denied entry.</p>
            </div>

            <div className="px-5 pb-5">
                <button onClick={onClose} type="button" className="btn-primary w-full flex items-center justify-center gap-2">
                    <span>I Understand</span>
                    <ArrowRight size={15}/>
                </button>
            </div>
        </div>
    </div>
);

/* ── Login Page ───────────────────────────────────────── */
const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAccessWarning, setShowAccessWarning] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!sessionStorage.getItem('accessWarningShown')) setShowAccessWarning(true);
    }, []);

    const handleCloseWarning = () => {
        sessionStorage.setItem('accessWarningShown', 'true');
        setShowAccessWarning(false);
    };

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(formData.email, formData.password);
        if (result.success) navigate('/dashboard');
        else setError(result.message);
        setIsLoading(false);
    };

    const handleDemoLogin = (email) => setFormData({ email, password: 'password123' });

    /* ── Input style ── */
    const inputBase = {
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

    const onFocus = e => {
        e.target.style.borderColor = 'rgba(91,156,246,0.55)';
        e.target.style.background  = 'rgba(255,255,255,0.08)';
        e.target.style.boxShadow   = 'inset 0 2px 8px rgba(0,0,0,0.2),0 0 0 3px rgba(91,156,246,0.14)';
    };
    const onBlur  = e => {
        e.target.style.borderColor = 'rgba(255,255,255,0.10)';
        e.target.style.background  = 'rgba(255,255,255,0.05)';
        e.target.style.boxShadow   = 'inset 0 2px 8px rgba(0,0,0,0.25)';
    };

    const demoRoles = [
        { role:'Super Admin',     email:'jonathan@acme.com', color:'#c4b5fd', glow:'rgba(167,139,250,0.6)' },
        { role:'Project Manager', email:'anthony@acme.com',  color:'#93c5fd', glow:'rgba(91,156,246,0.6)'  },
        { role:'Team Lead',       email:'brian@acme.com',    color:'#67e8f9', glow:'rgba(34,211,238,0.6)'  },
        { role:'Team Member',     email:'troy@acme.com',     color:'#6ee7b7', glow:'rgba(52,211,153,0.6)'  },
        { role:'Team Member',     email:'andrew@acme.com',   color:'#6ee7b7', glow:'rgba(52,211,153,0.6)'  },
        { role:'Team Member',     email:'harvey@acme.com',   color:'#6ee7b7', glow:'rgba(52,211,153,0.6)'  },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
             style={{ background: 'var(--bg-primary)' }}>

            {/* Glow orbs */}
            <div className="glow-orb glow-orb-1"/>
            <div className="glow-orb glow-orb-2"/>
            <div className="glow-orb glow-orb-3"/>

            {/* Extra accent orbs */}
            <div className="fixed pointer-events-none" style={{
                width:320, height:320, borderRadius:'50%',
                background:'radial-gradient(circle,rgba(167,139,250,0.18) 0%,transparent 70%)',
                filter:'blur(60px)', top:'25%', left:'8%',
                animation:'floatSlow 9s ease-in-out infinite',
            }}/>
            <div className="fixed pointer-events-none" style={{
                width:280, height:280, borderRadius:'50%',
                background:'radial-gradient(circle,rgba(34,211,238,0.12) 0%,transparent 70%)',
                filter:'blur(60px)', bottom:'15%', right:'8%',
                animation:'floatSlow 11s ease-in-out infinite', animationDelay:'-4s',
            }}/>

            {/* Warning modal */}
            {showAccessWarning && <AccessWarningModal onClose={handleCloseWarning}/>}

            {/* ── Card ── */}
            <div className="w-full max-w-md relative z-10">
                <div className="relative overflow-hidden"
                     style={{
                         background: 'rgba(7,12,28,0.82)',
                         backdropFilter: 'blur(40px)',
                         WebkitBackdropFilter: 'blur(40px)',
                         border: '1px solid rgba(255,255,255,0.11)',
                         borderRadius: '28px',
                         boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 80px rgba(91,156,246,0.07), inset 0 1px 0 rgba(255,255,255,0.2)',
                         padding: '2.5rem',
                     }}>
                    {/* Bevel */}
                    <div className="absolute top-0 left-8 right-8 h-px pointer-events-none"
                         style={{ background: 'linear-gradient(90deg,transparent,rgba(91,156,246,0.55),rgba(167,139,250,0.45),transparent)' }}/>

                    {/* ── Logo + Title ── */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-5">
                            <div className="relative w-[72px] h-[72px]">
                                {/* Outer ring */}
                                <div className="absolute inset-0 rounded-[22px] animate-pulse-glow"
                                     style={{
                                         background: 'linear-gradient(135deg,rgba(91,156,246,0.3),rgba(167,139,250,0.3))',
                                         borderRadius: '22px',
                                     }}/>
                                <div className="absolute inset-[3px] rounded-[20px] flex items-center justify-center overflow-hidden"
                                     style={{
                                         background: 'linear-gradient(135deg,#5b9cf6 0%,#a78bfa 100%)',
                                         border: '1px solid rgba(255,255,255,0.28)',
                                         boxShadow: '0 8px 32px rgba(91,156,246,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
                                     }}>
                                    <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-[20px]"
                                         style={{ background: 'rgba(255,255,255,0.22)' }}/>
                                    <Zap size={30} className="text-white relative z-10" fill="white"/>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Sparkles size={14} style={{ color: '#a78bfa' }}/>
                            <h1 className="text-3xl font-extrabold tracking-tight"
                                style={{
                                    background: 'linear-gradient(135deg,#eef2ff 0%,#93c5fd 45%,#c4b5fd 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                Welcome back
                            </h1>
                            <Sparkles size={14} style={{ color: '#5b9cf6' }}/>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Sign in to your workspace
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 p-4 rounded-[14px] text-sm text-center"
                             style={{
                                 background: 'rgba(251,113,133,0.1)',
                                 border: '1px solid rgba(251,113,133,0.25)',
                                 color: '#fda4af',
                                 boxShadow: '0 0 20px rgba(251,113,133,0.07)',
                             }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] mb-2"
                                   style={{ color: 'rgba(255,255,255,0.38)' }}>Email Address</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                      style={{ color: 'rgba(255,255,255,0.3)' }}/>
                                <input
                                    type="email" name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    required
                                    style={inputBase}
                                    onFocus={onFocus} onBlur={onBlur}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] mb-2"
                                   style={{ color: 'rgba(255,255,255,0.38)' }}>Password</label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                      style={{ color: 'rgba(255,255,255,0.3)' }}/>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    style={{ ...inputBase, paddingRight: '2.75rem' }}
                                    onFocus={onFocus} onBlur={onBlur}
                                />
                                <button type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                        style={{ color: 'rgba(255,255,255,0.3)' }}
                                        onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
                                        onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
                                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                </button>
                            </div>
                        </div>

                        {/* Remember + Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'var(--text-secondary)' }}>
                                <input type="checkbox" style={{ accentColor: '#5b9cf6', width:14, height:14 }}/>
                                Remember me
                            </label>
                            <a href="#" className="text-xs font-semibold transition-colors"
                               style={{ color: '#5b9cf6' }}
                               onMouseEnter={e => e.currentTarget.style.color='#93c5fd'}
                               onMouseLeave={e => e.currentTarget.style.color='#5b9cf6'}>
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                            ) : (
                                <>Sign In <ArrowRight size={15}/></>
                            )}
                        </button>
                    </form>

                    {/* Register link */}
                    <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        New here?{' '}
                        <Link to="/register"
                              className="font-bold transition-colors"
                              style={{ color: '#5b9cf6' }}
                              onMouseEnter={e => e.currentTarget.style.color='#93c5fd'}
                              onMouseLeave={e => e.currentTarget.style.color='#5b9cf6'}>
                            Create a workspace →
                        </Link>
                    </p>

                    {/* ── Demo accounts ── */}
                    <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <p className="text-[10px] text-center font-bold uppercase tracking-[0.12em] mb-3"
                           style={{ color: 'rgba(255,255,255,0.28)' }}>
                            Quick Access — Demo Accounts
                        </p>
                        <div className="space-y-1.5 max-h-[170px] overflow-y-auto custom-scrollbar">
                            {demoRoles.map((u, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleDemoLogin(u.email)}
                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-left transition-all duration-150"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; }}
                                >
                                    <span className="w-2 h-2 rounded-full flex-shrink-0"
                                          style={{ background: u.color, boxShadow: `0 0 8px ${u.glow}` }}/>
                                    <span className="text-xs font-semibold min-w-[110px]" style={{ color: u.color }}>
                                        {u.role}
                                    </span>
                                    <span className="text-xs flex-1 text-right truncate" style={{ color: 'var(--text-secondary)' }}>
                                        {u.email}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                            All use password: <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight:600 }}>password123</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
