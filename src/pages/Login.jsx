import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock } from 'lucide-react';

const ADMIN_EMAILS = [
  'sidharthareddy@gmail.com',
  'siddharthareddypoddutoori@gmail.com',
  'sidharthareddy.poddutoori@gmail.com',
  'siddharthareddyp@gmail.com',
];

const getRegisteredAccounts = () => {
  try {
    const saved = localStorage.getItem('campusPulseAccounts');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
};

const isAdminEmail = (value) => {
  const normalized = value.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized);
};

const isValidAnuragUniversityEmail = (value) => {
  const email = value.trim().toLowerCase();
  const match = email.match(/^(\d{2})([a-z]{2})(\d{3})([a-z])(\d{2})@anurag\.edu\.in$/i);

  if (!match) {
    return null;
  }

  const [, batch, dept, rollNumber, section, serial] = match;
  const allowedYears = ['23', '24', '25', '26'];

  if (!allowedYears.includes(batch)) {
    return null;
  }

  return {
    batch,
    dept: dept.toLowerCase(),
    rollNumber,
    section: section.toUpperCase(),
    serial,
    email,
  };
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const passwordValue = password.trim();

      if (!passwordValue) {
        setError('Please enter your password.');
        setLoading(false);
        return;
      }

      if (!isAdminEmail(normalizedEmail) && !isValidAnuragUniversityEmail(normalizedEmail)) {
        setError('Use your Anurag University college email, for example 23eg106c31@anurag.edu.in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, password: passwordValue }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.user) {
          const account = { ...data.user, password: passwordValue };
          localStorage.setItem('campusPulseAccounts', JSON.stringify([
            ...(getRegisteredAccounts().filter((item) => item.email?.toLowerCase() !== normalizedEmail)),
            account,
          ]));
          localStorage.setItem('demoUser', JSON.stringify(account));
          login(account);
          navigate('/');
          return;
        }
      } catch (backendError) {
        // Fall back to local storage account validation below if the server is unavailable.
      }

      if (isAdminEmail(normalizedEmail) && passwordValue === 'Admin@123') {
        const adminAccount = {
          email: normalizedEmail,
          password: passwordValue,
          id: 'admin-sidhartha',
          full_name: 'Sidhartha Reddy',
          userType: 'admin',
          institution: 'CampusPulse',
          sport: 'Admin Console',
        };

        localStorage.setItem('demoUser', JSON.stringify(adminAccount));
        login(adminAccount);
        navigate('/');
        return;
      }

      const matchingRegisteredAccount = getRegisteredAccounts().find((account) => {
        return account.email?.toLowerCase() === normalizedEmail && account.password === passwordValue;
      });

      if (matchingRegisteredAccount) {
        localStorage.setItem('demoUser', JSON.stringify(matchingRegisteredAccount));
        login(matchingRegisteredAccount);
        navigate('/');
        return;
      }

      const parsedStudent = isValidAnuragUniversityEmail(normalizedEmail);

      if (!parsedStudent) {
        setError('Use your Anurag University email, for example 23eg106c31@anurag.edu.in, or log in with a created account.');
        setLoading(false);
        return;
      }

      const account = {
        email: normalizedEmail,
        password: passwordValue,
        id: `student-${parsedStudent.batch}-${parsedStudent.dept}-${parsedStudent.rollNumber}-${parsedStudent.section}`,
        full_name: `${parsedStudent.batch}${parsedStudent.dept}${parsedStudent.rollNumber}${parsedStudent.section}${parsedStudent.serial}`.toUpperCase(),
        userType: 'student',
        institution: 'Anurag University',
        batch: parsedStudent.batch,
        section: parsedStudent.section,
        sport: 'Student Sports',
      };

      localStorage.setItem('demoUser', JSON.stringify(account));
      login(account);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
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

        {/* College Login Info */}
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-900">💡 College Login</p>
          <p className="mt-1 text-xs text-amber-800">
            Use your Anurag University email, such as 23eg106c31@anurag.edu.in.
          </p>
        </div>
      </div>
    </div>
  );
}
