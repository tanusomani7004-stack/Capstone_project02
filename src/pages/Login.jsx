import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Zap, CheckCircle } from 'lucide-react';

const DEMO_FEATURES = [
  'AI-powered productivity insights',
  'Smart task management with CRUD',
  'Interactive calendar planner',
  'Analytics with real-time charts',
  'Notes with tag organization',
];

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login'); // login | register

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    if (form.password.length < 4) { setError('Password must be at least 4 characters'); return; }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate API call

    const success = login({ ...form, name: form.name || form.email.split('@')[0] });
    if (success) navigate('/dashboard');
    else { setError('Login failed. Try again.'); setIsLoading(false); }
  };

  const handleDemo = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    login({ name: 'Alex Chen', email: 'alex@studyos.app', password: 'demo' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen login-bg flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl" style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>

        {/* Left Panel */}
        <div className="hidden lg:flex flex-col justify-between p-10"
          style={{ background: 'linear-gradient(145deg, rgba(14,165,233,0.12) 0%, rgba(139,92,246,0.08) 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-white" style={{ fontFamily: 'Clash Display' }}>StudyOS</h1>
                <p className="text-xs" style={{ color: 'rgba(148,163,184,0.8)' }}>AI Productivity Dashboard</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: 'Clash Display' }}>
              Study smarter,<br />not harder.
            </h2>
            <p className="text-sm mb-8" style={{ color: 'rgba(148,163,184,0.8)', lineHeight: '1.7' }}>
              Your intelligent companion for academic success. Track tasks, organize notes, and get AI-powered insights.
            </p>

            <div className="space-y-3">
              {DEMO_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: 'rgba(226,232,240,0.8)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.8)' }}>
              💡 <strong style={{ color: 'rgba(226,232,240,0.9)' }}>Pro Tip:</strong> Use the demo account to explore all features instantly without signing up.
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="p-8 md:p-10" style={{ background: '#111827' }}>
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              <Zap size={18} className="text-white" />
            </div>
            <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'Clash Display' }}>StudyOS</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Clash Display' }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm" style={{ color: '#64748b' }}>
              {mode === 'login' ? 'Sign in to your dashboard' : 'Start your productivity journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94a3b8' }}>Full Name</label>
                <input className="input-field" placeholder="Alex Chen" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ background: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94a3b8' }}>Email</label>
              <input type="email" className="input-field" placeholder="you@university.edu" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{ background: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94a3b8' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-11" placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ background: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPass ? <EyeOff size={16} style={{ color: '#475569' }} /> : <Eye size={16} style={{ color: '#475569' }} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
              {isLoading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading...</>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: '#1e293b' }} />
            <span className="text-xs" style={{ color: '#475569' }}>or</span>
            <div className="flex-1 h-px" style={{ background: '#1e293b' }} />
          </div>

          <button onClick={handleDemo} disabled={isLoading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all border flex items-center justify-center gap-2"
            style={{ background: 'rgba(14,165,233,0.08)', borderColor: 'rgba(14,165,233,0.2)', color: '#38bef8' }}>
            {isLoading ? <span className="w-4 h-4 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" /> : '⚡'}
            Try Demo Account
          </button>

          <p className="text-center text-sm mt-5" style={{ color: '#475569' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
              className="font-semibold" style={{ color: '#0ea5e9' }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
