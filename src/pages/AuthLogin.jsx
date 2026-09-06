import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Demo account 1: Anurag (Student)
  const demoStudentAccount = {
    email: 'anurag.student@unisport.edu',
    password: 'Anurag@2024',
    id: 'student-anurag-001',
    full_name: 'Anurag Kumar',
    userType: 'student',
    institution: 'Hyderabad University',
    sport: 'Basketball',
  };

  // Demo account 2: Personal User
  const demoPersonalAccount = {
    email: 'personal.user@unisport.local',
    password: 'Personal@2024',
    id: 'personal-user-001',
    full_name: 'Alex Johnson',
    userType: 'personal',
    institution: '',
    sport: 'Multiple Sports',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Demo authentication - check against demo accounts
      let demoAccount = null;

      if (email === demoStudentAccount.email && password === demoStudentAccount.password) {
        demoAccount = demoStudentAccount;
      } else if (email === demoPersonalAccount.email && password === demoPersonalAccount.password) {
        demoAccount = demoPersonalAccount;
      } else {
        setError('Invalid email or password. Use demo accounts below.');
        setLoading(false);
        return;
      }

      // Simulate API call
      setTimeout(() => {
        // Store in localStorage for persistence
        localStorage.setItem('demoUser', JSON.stringify(demoAccount));
        
        // Update auth context
        login(demoAccount);
        navigate('/');
      }, 800);
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  const quickLogin = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setLoading(true);

    setTimeout(() => {
      localStorage.setItem('demoUser', JSON.stringify(account));
      login(account);
      navigate('/');
    }, 500);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-black text-slate-900">Welcome Back</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Sign in to your CampusPulse account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                placeholder="your.email@unisport.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2.5"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs font-semibold text-slate-400">DEMO ACCOUNTS</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* Demo Account 1: Student */}
        <button
          onClick={() => quickLogin(demoStudentAccount)}
          className="mb-3 w-full rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-left hover:border-blue-400 hover:bg-blue-100 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">Anurag Kumar</p>
              <p className="text-xs text-slate-600">Student • Hyderabad University</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{demoStudentAccount.email}</p>
            </div>
            <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
              Login
            </span>
          </div>
        </button>

        {/* Demo Account 2: Personal */}
        <button
          onClick={() => quickLogin(demoPersonalAccount)}
          className="w-full rounded-xl border-2 border-green-200 bg-green-50 p-4 text-left hover:border-green-400 hover:bg-green-100 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">Alex Johnson</p>
              <p className="text-xs text-slate-600">Personal • Community Athlete</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{demoPersonalAccount.email}</p>
            </div>
            <span className="shrink-0 rounded-full bg-green-600 px-2.5 py-1 text-xs font-bold text-white">
              Login
            </span>
          </div>
        </button>

        {/* Footer Links */}
        <div className="mt-6 flex flex-col gap-2 text-center text-sm">
          <a href="/forgot-password" className="font-medium text-blue-600 hover:underline">
            Forgot password?
          </a>
          <p className="text-slate-600">
            Don't have an account?{' '}
            <a href="/register" className="font-semibold text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>

        {/* Demo Info */}
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-900">💡 Demo Mode</p>
          <p className="mt-1 text-xs text-amber-800">
            Click on a demo account card or enter credentials manually to test the application.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
