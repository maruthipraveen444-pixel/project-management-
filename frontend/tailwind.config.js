/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: 'var(--bg-primary)',
                surface:    'var(--bg-secondary)',
                card:       'var(--bg-card)',
                'text-main':    'var(--text-primary)',
                'text-muted':   'var(--text-secondary)',
                border:     'var(--border-color)',

                primary: {
                    50:  '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#5b9cf6',
                    600: '#3b82f6',
                    700: '#2563eb',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                dark: {
                    50:  '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    750: 'rgba(255,255,255,0.04)',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#03060f',
                },
            },

            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
            },

            backdropBlur: {
                xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '40px', '2xl': '64px',
            },

            boxShadow: {
                'glass':       '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)',
                'glass-hover': '0 24px 64px rgba(0,0,0,0.65), 0 0 40px rgba(91,156,246,0.12), inset 0 1px 0 rgba(255,255,255,0.18)',
                'glass-xl':    '0 32px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.22)',
                'glow-blue':   '0 0 24px rgba(91,156,246,0.45), 0 0 60px rgba(91,156,246,0.18)',
                'glow-purple': '0 0 24px rgba(167,139,250,0.45), 0 0 60px rgba(167,139,250,0.18)',
                'glow-green':  '0 0 24px rgba(52,211,153,0.4), 0 0 60px rgba(52,211,153,0.15)',
                'btn-primary': '0 4px 24px rgba(91,156,246,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
                'inner-glass': 'inset 0 1px 0 rgba(255,255,255,0.12)',
            },

            backgroundImage: {
                'gradient-primary':   'linear-gradient(135deg, #5b9cf6 0%, #a78bfa 100%)',
                'gradient-blue-cyan': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                'gradient-green':     'linear-gradient(135deg, #34d399 0%, #06b6d4 100%)',
                'gradient-amber':     'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
                'gradient-rose':      'linear-gradient(135deg, #a78bfa 0%, #fb7185 100%)',
                'gradient-glass':     'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                'gradient-radial':    'radial-gradient(var(--tw-gradient-stops))',
                'glass-surface':      'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
            },

            animation: {
                'fade-in':        'fadeIn 0.38s ease-out',
                'fade-in-scale':  'fadeInScale 0.4s cubic-bezier(0.23,1,0.32,1)',
                'slide-up':       'slideUp 0.5s ease-out',
                'pulse-slow':     'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
                'float':          'float 4s ease-in-out infinite',
                'float-slow':     'floatSlow 8s ease-in-out infinite',
                'pulse-glow':     'pulseGlow 2.8s ease-in-out infinite',
                'gradient-shift': 'gradientShift 4s ease infinite',
            },

            keyframes: {
                fadeIn:      { '0%':{ opacity:'0',transform:'translateY(10px)' }, '100%':{ opacity:'1',transform:'translateY(0)' } },
                fadeInScale: { '0%':{ opacity:'0',transform:'scale(0.96) translateY(8px)' }, '100%':{ opacity:'1',transform:'scale(1) translateY(0)' } },
                slideUp:     { '0%':{ transform:'translateY(20px)',opacity:'0' }, '100%':{ transform:'translateY(0)',opacity:'1' } },
                float:       { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
                floatSlow:   { '0%,100%':{ transform:'translateY(0) rotate(0deg)' }, '33%':{ transform:'translateY(-12px) rotate(1deg)' }, '66%':{ transform:'translateY(-4px) rotate(-0.5deg)' } },
                pulseGlow:   { '0%,100%':{ boxShadow:'0 0 12px rgba(91,156,246,0.2)' }, '50%':{ boxShadow:'0 0 32px rgba(91,156,246,0.55),0 0 64px rgba(167,139,250,0.2)' } },
                gradientShift: { '0%,100%':{ backgroundPosition:'0% 50%' }, '50%':{ backgroundPosition:'100% 50%' } },
            },
        },
    },
    plugins: [],
}
