import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, User, Loader2, Stethoscope, HeartPulse, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      if (result.role === 'ADMIN') navigate('/admin');
      else if (result.role === 'DOCTOR') navigate('/doctor');
      else if (result.role === 'PATIENT') navigate('/patient');
    } else {
      setError(result.message);
    }
  };

  const features = [
    { icon: <HeartPulse size={18} />, text: 'Real-time patient monitoring', color: 'text-rose-400 bg-rose-500/10' },
    { icon: <Stethoscope size={18} />, text: 'Smart appointment scheduling', color: 'text-emerald-400 bg-emerald-500/10' },
    { icon: <ShieldCheck size={18} />, text: 'Secure encrypted records', color: 'text-indigo-400 bg-indigo-500/10' },
  ];

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-[350px] h-[350px] bg-white/5 rounded-full" />
        <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] bg-white/5 rounded-full" />
        <div className="absolute top-[40%] right-[-60px] w-[250px] h-[250px] bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Activity size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Medicare</h2>
              <p className="text-indigo-200 text-xs">Hospital Management System</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Advanced Care,<br />
            <span className="text-indigo-200">Simplified.</span>
          </h1>
          <p className="text-indigo-200/80 text-base leading-relaxed">
            A complete digital ecosystem for healthcare professionals and patients. Manage appointments, prescriptions, and patient records effortlessly.
          </p>

          <div className="mt-10 space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                <div className={`w-8 h-8 rounded-lg ${f.color} flex items-center justify-center`}>{f.icon}</div>
                <p className="text-white/90 text-sm font-medium">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-indigo-300/60 text-xs relative z-10">© 2025 Medicare Hospital, Hyderabad. All rights reserved.</p>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center">
              <Activity size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-content">Medicare</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-content">Welcome back</h2>
            <p className="text-content-muted mt-1.5 text-sm">Sign in to your Medicare account to continue</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="form-label">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  className="form-control pl-10"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  className="form-control pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-3 text-base mt-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-content-muted">Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:text-indigo-400 font-semibold transition-colors">
              Create account
            </Link>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Login;
