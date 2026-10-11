import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '../../components/layout/Navbar';
import { MobileNav } from '../../components/layout/MobileNav';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import {
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function CustomerSignUpPage() {
  const router = useRouter();
  const { login } = useAuth();
  const redirectPath = (router.query.redirect as string) || '/customer';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form validation
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanDigits,
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      setSuccessMessage('Account created successfully! Welcome to LocalKart.');
      login(data.user);

      setTimeout(() => {
        router.push(redirectPath);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Customer Account | LocalKart</title>
        <meta
          name="description"
          content="Sign up for LocalKart to order groceries, bakery, pharmacy, and essentials from verified local stores delivered same-day."
        />
      </Head>

      <Navbar />

      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xl)',
            padding: 'clamp(24px, 5vw, 36px)',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
              }}
            >
              <Sparkles size={24} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
              Create Customer Account
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Join LocalKart to shop from verified neighborhood stores
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              style={{
                background: 'var(--success-bg)',
                border: '1px solid #6ee7b7',
                color: '#065f46',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="reg-name" style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 5 }}>
                Full Name
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-muted)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 14px',
                  gap: 10,
                }}
              >
                <UserIcon size={17} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="e.g. Hariom Yadav"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 14 }}
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="reg-phone" style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 5 }}>
                Mobile Number
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-muted)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 14px',
                  gap: 10,
                }}
              >
                <Phone size={17} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 14 }}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="reg-email" style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 5 }}>
                Email Address
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-muted)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 14px',
                  gap: 10,
                }}
              >
                <Mail size={17} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 14 }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="reg-password" style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 5 }}>
                Password (min 6 characters)
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-muted)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 14px',
                  gap: 10,
                }}
              >
                <Lock size={17} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 14 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 22 }}>
              <label htmlFor="reg-confirm-password" style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 5 }}>
                Confirm Password
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-muted)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 14px',
                  gap: 10,
                }}
              >
                <ShieldCheck size={17} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  id="reg-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  style={{ border: 'none', background: 'transparent', width: '100%', fontSize: 14 }}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating Your Account...' : 'Complete Sign Up'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Link to Login */}
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Already have a LocalKart account?{' '}
            <Link
              href={`/customer/login${redirectPath !== '/customer' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}
              style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </>
  );
}
