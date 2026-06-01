'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Eye, EyeOff, ArrowRight, GraduationCap, Briefcase, CheckCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'organizer'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const quickLogin = (r: 'student' | 'organizer') => {
    setMode('signin');
    setRole(r);
    setEmail(r === 'student' ? 'student@echopod.com' : 'organizer@echopod.com');
    setPassword('password123');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      // Persist to client storage and navigate
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      toast.success(`Welcome to EchoPod, ${data.user.name}! 🎉`);
      setLoading(false);
      if (data.user.role === 'organizer') router.push('/organizer');
      else router.push('/student');
    } catch (err) {
      toast.error('Signup failed');
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Invalid credentials');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      toast.success(`Welcome back, ${data.user.name}! 👋`);

      if (data.user.role === 'organizer') {
        router.push('/organizer');
      } else {
        router.push('/student');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-charcoal-800 to-charcoal-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent-red/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-accent-gold/10 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 bg-accent-red rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-white">EchoPod</span>
          </Link>

          <h2 className="font-serif text-4xl text-white leading-tight mb-6">
            Your Gateway to<br />
            <span className="text-accent-gold">Intelligent Events</span>
          </h2>
          <p className="text-charcoal-300 text-base max-w-md mb-8">
            Discover events tailored to your skills, register in one click, track attendance with QR codes, and climb the leaderboard.
          </p>

          {/* Feature list */}
          {[
            'Smart event recommendations based on your skills',
            'QR code attendance — no paper, no hassle',
            'Real-time dashboards for organizers',
            'Gamified points & badges system',
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-4 h-4 text-success shrink-0" />
              <span className="text-charcoal-300 text-sm">{feat}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6 text-sm text-charcoal-400 relative z-10">
          <span>Microservices</span>
          <span className="w-1 h-1 rounded-full bg-charcoal-500" />
          <span>Real-Time</span>
          <span className="w-1 h-1 rounded-full bg-charcoal-500" />
          <span>AI-Powered</span>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-accent-red rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-charcoal-800">EchoPod</span>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-cream-200 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'signin' ? 'bg-white text-charcoal-800 shadow-sm' : 'text-charcoal-400'}`}
              id="tab-signin"
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${mode === 'signup' ? 'bg-white text-charcoal-800 shadow-sm' : 'text-charcoal-400'}`}
              id="tab-signup"
            >
              <UserPlus className="w-3.5 h-3.5" /> Sign Up
            </button>
          </div>

          <h1 className="font-serif text-3xl text-charcoal-800 mb-1">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-charcoal-400 text-sm mb-6">
            {mode === 'signin' ? 'Sign in to your account to continue' : 'Join the smartest event platform'}
          </p>

          {/* Quick Login (Sign In only) */}
          {mode === 'signin' && (
            <>
              <p className="text-xs font-medium text-charcoal-500 mb-2">Quick demo access:</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  onClick={() => quickLogin('student')}
                  className="p-3 rounded-lg border-2 border-cream-300 text-sm font-medium text-charcoal-600 hover:border-accent-red hover:text-accent-red transition-all text-center flex items-center justify-center gap-2"
                  id="quick-login-student"
                >
                  <GraduationCap className="w-4 h-4" /> Student
                </button>
                <button
                  onClick={() => quickLogin('organizer')}
                  className="p-3 rounded-lg border-2 border-cream-300 text-sm font-medium text-charcoal-600 hover:border-accent-red hover:text-accent-red transition-all text-center flex items-center justify-center gap-2"
                  id="quick-login-organizer"
                >
                  <Briefcase className="w-4 h-4" /> Organizer
                </button>
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-cream-300" />
                <span className="text-xs text-charcoal-400">or sign in manually</span>
                <div className="flex-1 h-px bg-cream-300" />
              </div>
            </>
          )}

          {/* Role Selector (Sign Up only) */}
          {mode === 'signup' && (
            <div className="mb-5">
              <p className="text-sm font-medium text-charcoal-600 mb-2">I am a...</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole('student')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${role === 'student' ? 'border-accent-red bg-accent-red/5' : 'border-cream-300'}`}
                >
                  <GraduationCap className={`w-5 h-5 mb-1 ${role === 'student' ? 'text-accent-red' : 'text-charcoal-400'}`} />
                  <p className={`text-sm font-semibold ${role === 'student' ? 'text-accent-red' : 'text-charcoal-700'}`}>Student</p>
                  <p className="text-[10px] text-charcoal-400">Browse & join events</p>
                </button>
                <button
                  onClick={() => setRole('organizer')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${role === 'organizer' ? 'border-accent-red bg-accent-red/5' : 'border-cream-300'}`}
                >
                  <Briefcase className={`w-5 h-5 mb-1 ${role === 'organizer' ? 'text-accent-red' : 'text-charcoal-400'}`} />
                  <p className={`text-sm font-semibold ${role === 'organizer' ? 'text-accent-red' : 'text-charcoal-700'}`}>Organizer</p>
                  <p className="text-[10px] text-charcoal-400">Create & manage events</p>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-charcoal-600 mb-1.5">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-elegant"
                  placeholder="Your full name"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-600 mb-1.5">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-elegant"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-elegant pr-10"
                  placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                  required
                  minLength={mode === 'signup' ? 6 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              id="auth-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {mode === 'signin' && (
            <div className="mt-5 p-3 bg-cream-100 rounded-xl">
              <p className="text-xs text-charcoal-500 font-medium mb-1">Demo Credentials</p>
              <p className="text-xs text-charcoal-400">Student: <code className="bg-cream-200 px-1 rounded">student@echopod.com</code> / <code className="bg-cream-200 px-1 rounded">password123</code></p>
              <p className="text-xs text-charcoal-400 mt-1">Organizer: <code className="bg-cream-200 px-1 rounded">organizer@echopod.com</code> / <code className="bg-cream-200 px-1 rounded">password123</code></p>
            </div>
          )}

          {mode === 'signup' && (
            <p className="text-center text-sm text-charcoal-400 mt-4">
              Already have an account?{' '}
              <button onClick={() => setMode('signin')} className="text-accent-red font-medium hover:underline">Sign in</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
