import React, { useEffect, useState } from 'react';
import { Lock, Mail, User, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  role: 'user' | 'recruiter' | 'admin';
  onLogin: (email: string, password: string, name?: string, role?: string) => void;
  onBack: () => void;
  error?: string;
}

export default function AuthPage({ role, onLogin, onBack, error }: AuthPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (role === 'admin') {
      setIsSignup(false);
    }
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      onLogin(email, password, name, role);
    } else {
      onLogin(email, password, undefined, role);
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'user': return 'Resume User';
      case 'recruiter': return 'Recruiter';
      case 'admin': return 'Admin';
    }
  };

  const roleStyles: Record<string, { accent: string; glow: string }> = {
    user: { accent: '#1f3a2f', glow: 'rgba(31, 58, 47, 0.2)' },
    recruiter: { accent: '#0f5132', glow: 'rgba(15, 81, 50, 0.22)' },
    admin: { accent: '#7a2c2c', glow: 'rgba(122, 44, 44, 0.22)' }
  };

  const { accent, glow } = roleStyles[role];

  return (
    <div className="min-h-screen bg-atlas flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to role selection
        </button>

        <div className="bg-white/90 backdrop-blur rounded-3xl border border-white/70 shadow-2xl p-8">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resume World</p>
            <h2 className="text-3xl font-display text-ink mb-2">
              {isSignup ? 'Sign Up' : 'Login'} as {getRoleTitle()}
            </h2>
            <p className="text-slate-600">
              {isSignup ? 'Create your account' : 'Welcome back!'}
            </p>
            {role === 'admin' && (
              <p className="mt-2 text-xs text-slate-500">
                Admin accounts are created by existing admins.
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 bg-white"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                {role === 'recruiter' && isSignup ? 'Company Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 bg-white"
                  placeholder={role === 'recruiter' && isSignup ? 'you@company.com' : 'you@example.com'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full text-white font-semibold py-3 rounded-full transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: accent, boxShadow: `0 20px 40px ${glow}` }}
            >
              {isSignup ? 'Sign Up' : 'Login'}
            </button>
          </form>

          {role !== 'admin' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-emerald-800 hover:text-emerald-900 font-semibold"
              >
                {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
