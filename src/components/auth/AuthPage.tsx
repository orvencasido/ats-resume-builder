import React, { useState } from 'react';
import { authService, AuthUser } from '../../services/authService';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react';

interface Props {
  onSuccess: (user: AuthUser) => void;
}

export const AuthPage: React.FC<Props> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        const res = await authService.resetPassword(email.trim());
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMessage('Password reset email sent. Check your inbox.');
          setMode('login');
        }
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        const res = await authService.signUp(fullName.trim(), email.trim(), password);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccessMessage('Account created. Please verify via email before signing in.');
          setMode('login');
          setFullName('');
          setEmail('');
          setPassword('');
          setShowPassword(false);
        }
      } else {
        const res = await authService.signIn(email.trim(), password);
        if (res.error) {
          setError(res.error);
        } else if (res.user) {
          onSuccess(res.user);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    onSuccess(authService.signInAsGuest());
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          <div className="lg:col-span-6 space-y-5 lg:pr-6">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Build a clean ATS Resume FREE.
            </h2>

            <div className="text-sm text-slate-700">Created by Orven Casido</div>
          </div>

          {/* Right Auth Card Form */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md h-[500px] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">

              {/* Form Toggle Header */}
              <div className="grid grid-cols-2 h-11 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className={`h-full rounded-lg font-bold text-xs transition-all ${mode === 'login'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className={`h-full rounded-lg font-bold text-xs transition-all ${mode === 'signup'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  Create Account
                </button>
              </div>

              <div className="text-left space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Reset Password'}
                </h3>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="e.g. Orven Casido"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. engineer@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === 'login' && 'Sign In'}
                        {mode === 'signup' && 'Register'}
                        {mode === 'forgot' && 'Send Reset Email'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {mode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-all"
                  >
                    Back to Sign In
                  </button>
                )}
              </form>

              {mode === 'login' && (
                <div className="space-y-4">
                  <div className="relative flex items-center justify-center pt-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative px-3 bg-white text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      Or
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>I just want to create Resume ASAP!</span>
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

    </div>
  );
};
