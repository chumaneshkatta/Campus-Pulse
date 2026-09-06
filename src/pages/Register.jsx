import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

const CampusPulseBrandIcon = () => (
  <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden="true">
    <defs>
      <linearGradient id="registerBrandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#dbeafe" />
        <stop offset="100%" stopColor="#e9d5ff" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="24" fill="none" stroke="url(#registerBrandGradient)" strokeWidth="4" />
    <path d="M18 34 L28 22 L36 32 L46 20" fill="none" stroke="url(#registerBrandGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="32" r="6" fill="url(#registerBrandGradient)" />
  </svg>
);

const getStoredAccounts = () => {
  try {
    const saved = localStorage.getItem('campusPulseAccounts');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
};

const isValidAnuragUniversityEmail = (value) => {
  const email = value.trim().toLowerCase();
  const match = email.match(/^(\d{2})([a-z]{2})(\d{3})([a-z])(\d{2})@anurag\.edu\.in$/i);
  return Boolean(match && ['23', '24', '25', '26'].includes(match[1]));
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!normalizedEmail || !trimmedPassword) {
      setError("Email and password are required.");
      return;
    }

    if (!name.trim() || !username.trim() || !gender || !dob || !phoneNumber.trim()) {
      setError("Name, username, gender, date of birth, and phone number are required.");
      return;
    }

    if (normalizedEmail !== 'sidharthareddy@gmail.com' && !isValidAnuragUniversityEmail(normalizedEmail)) {
      setError("Use your Anurag University college email, for example 23eg106c31@anurag.edu.in.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      setError("Passwords do not match");
      return;
    }

    const existingAccounts = getStoredAccounts();
    const emailAlreadyExists = existingAccounts.some(
      (account) => account.email?.toLowerCase() === normalizedEmail
    );

    if (emailAlreadyExists) {
      setError("This account already exists. Please log in with the same email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email: normalizedEmail, gender, dob, phoneNumber, password: trimmedPassword }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create account.');
      }

      const newAccount = {
        ...data.user,
        password: trimmedPassword,
      };

      const updatedAccounts = [...existingAccounts.filter((account) => account.email?.toLowerCase() !== normalizedEmail), newAccount];
      localStorage.setItem('campusPulseAccounts', JSON.stringify(updatedAccounts));
      localStorage.setItem('demoUser', JSON.stringify(newAccount));
      setShowOtp(true);
    } catch (err) {
      const fallbackAccount = {
        id: `user-${Date.now()}`,
        email: normalizedEmail,
        full_name: name.trim(),
        username: username.trim(),
        gender,
        dob,
        phone_number: phoneNumber.trim(),
        password: trimmedPassword,
        full_name: name.trim(),
        username: username.trim(),
        gender,
        dob,
        phone_number: phoneNumber.trim(),
        full_name: normalizedEmail.split('@')[0].replace(/[._-]/g, ' '),
        userType: 'registered',
        institution: 'CampusPulse',
        sport: 'General Sports',
      };

      const updatedAccounts = [...existingAccounts.filter((account) => account.email?.toLowerCase() !== normalizedEmail), fallbackAccount];
      localStorage.setItem('campusPulseAccounts', JSON.stringify(updatedAccounts));
      localStorage.setItem('demoUser', JSON.stringify(fallbackAccount));
      toast({
        title: "Account created locally",
        description: "You can now log in with this email and password.",
      });
      setError(err.message || 'Unable to create account.');
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={CampusPulseBrandIcon}
        title="Verify your email"
        subtitle={`We sent a code to ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={CampusPulseBrandIcon}
      title="Create your CampusPulse account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")}
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" type="text" autoComplete="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" autoComplete="username" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} className="h-12" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm" required>
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" autoComplete="bday" value={dob} onChange={(e) => setDob(e.target.value)} className="h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" type="tel" autoComplete="tel" placeholder="10-digit phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="h-12" pattern="[0-9+() -]{7,20}" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
