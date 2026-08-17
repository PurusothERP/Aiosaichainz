import React, { useState, useEffect } from 'react';
import { Brain, Eye, EyeOff, Shield, Zap, Lock, User, AlertCircle, CheckCircle, Cpu } from 'lucide-react';

// ─── CREDENTIALS ─────────────────────────────────────────────────────────────
const VALID_USERNAMES = ['aichainz', 'aichianz', 'aichianzinc_db_user', 'admin'];
const VALID_PASSWORDS = ['aichainz@101088', 'aichainz101088'];
const AUTH_KEY = 'aios_auth_session';

export interface AuthSession {
  isAuthenticated: boolean;
  username: string;
  loginTime: string;
}

export const getSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    return session.isAuthenticated ? session : null;
  } catch {
    return null;
  }
};

export const clearSession = () => localStorage.removeItem(AUTH_KEY);

interface LoginPageProps {
  onLogin: (session: AuthSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 4,
      duration: Math.random() * 6 + 4
    }))
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate auth delay (as if calling MongoDB Atlas backend)
    await new Promise(r => setTimeout(r, 600));

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const isUserValid = VALID_USERNAMES.includes(cleanUser);
    const isPassValid = VALID_PASSWORDS.includes(cleanPass);

    if (isUserValid && isPassValid) {
      const session: AuthSession = {
        isAuthenticated: true,
        username: username.trim() || 'Aichainz Admin',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      setLoginSuccess(true);
      setTimeout(() => onLogin(session), 800);
    } else {
      setError('Invalid credentials. Access denied.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060818] flex items-center justify-center relative overflow-hidden">

      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Deep gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-[#060818] to-violet-950/60" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />

        {/* Floating particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-indigo-400/20"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`
            }}
          />
        ))}
      </div>

      {/* Floating corner glows */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-br-full blur-2xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-500/10 rounded-tl-full blur-2xl" />

      {/* ── LOGIN CARD ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md mx-4">

        {/* Glow border card */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-3xl blur opacity-20" />
          <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">

            {/* Logo & Brand */}
            <div className="text-center mb-8">
              {/* AI Orb Logo */}
              <div className="relative mx-auto w-20 h-20 mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl blur-lg opacity-60 animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
                  <div className="relative">
                    <Brain className="w-9 h-9 text-white" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-indigo-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-indigo-400">
                  Aichainz
                </span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-indigo-400" />
              </div>

              <h1 className="text-3xl font-black text-white tracking-tight">
                A<span className="text-indigo-400">I</span>O<span className="text-violet-400">S</span>
              </h1>
              <p className="text-slate-300 font-bold text-sm mt-1">
                Aichainz Intelligence Operating System
              </p>
              <p className="text-slate-500 text-[11px] mt-1 font-medium">
                Where Future Thinking Meets AI
              </p>

              {/* Feature badges */}
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                {[
                  { icon: Zap, label: 'AI-Powered', color: 'text-yellow-400' },
                  { icon: Shield, label: 'Secured', color: 'text-emerald-400' },
                  { icon: Cpu, label: 'ERP v2.5', color: 'text-indigo-400' }
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/50 px-2.5 py-1 rounded-full">
                    <Icon className={`w-3 h-3 ${color}`} />
                    <span className={`text-[10px] font-extrabold ${color}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Login Form */}
            {loginSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-extrabold text-lg">Access Granted!</p>
                <p className="text-slate-400 text-sm">Loading AIOS Dashboard…</p>
                <div className="flex justify-center gap-1 mt-3">
                  {[0, 0.2, 0.4].map(d => (
                    <div key={d} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-sm font-semibold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="block text-slate-400 text-[11px] font-extrabold uppercase tracking-widest">
                    User ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError(''); }}
                      placeholder="Enter your user ID"
                      autoComplete="username"
                      className="w-full bg-slate-800/60 border border-slate-700/60 focus:border-indigo-500 text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-slate-400 text-[11px] font-extrabold uppercase tracking-widest">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full bg-slate-800/60 border border-slate-700/60 focus:border-indigo-500 text-white placeholder-slate-600 rounded-xl pl-10 pr-12 py-3 text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full overflow-hidden group mt-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-xl opacity-100 group-hover:opacity-90 transition" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition" />
                  <div className="relative flex items-center justify-center gap-2.5 px-6 py-3.5 text-white font-extrabold text-sm">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating…</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Sign In to AIOS</span>
                      </>
                    )}
                  </div>
                </button>

                {/* DB Connection indicator */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-slate-600 text-[10px] font-semibold">
                    Secured · MongoDB Atlas · cluster0.ly4tctw.mongodb.net
                  </span>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* Bottom brand line */}
        <p className="text-center text-slate-700 text-[10px] font-semibold mt-4">
          © 2026 Aichainz · AIOS ERP v2.5 · India · UAE · Rwanda
        </p>
      </div>

      {/* Floating animation styles */}
      <style>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); opacity: 0.2; }
          to   { transform: translateY(-20px) scale(1.2); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
