import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Navbar } from '../../components/layout/Navbar';
import { MobileNav } from '../../components/layout/MobileNav';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS } from '../../lib/auth';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const redirectPath = (router.query.redirect as string) || '/customer';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your email address or mobile number.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      setSuccessMessage('Welcome back! Logging in...');
      login(data.user);

      setTimeout(() => {
        router.push(redirectPath);
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setErrorMessage(null);
    const demoCust = DEMO_USERS.customer;
    login(demoCust);
    setSuccessMessage('Logged in as demo customer (Hariom Yadav)! Redirecting...');
    setTimeout(() => {
      router.push(redirectPath);
    }, 500);
  };

  return (
    <>
      <Head>
        <title>Customer Login | LocalKart Same-Day Delivery</title>
        <meta
          name="description"
          content="Log in to your LocalKart customer account to track orders, manage saved addresses, and enjoy instant checkout."
        />
      </Head>

      <Navbar />

      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 440,
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
              Customer Login
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Sign in to manage orders, addresses, and local delivery
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

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email or Phone */}
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="login-identifier"
                style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-main)' }}
              >
                Email Address or Mobile Number
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-muted)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  gap: 10,
                  transition: 'border-color 0.2s',
                }}
              >
                <Mail size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  id="login-identifier"
                  type="text"
                  placeholder="e.g. name@example.com or 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    fontSize: 14,
                    color: 'var(--text-main)',
                  }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label
                  htmlFor="login-password"
                  style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}
                >
                  Password
                </label>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-muted)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  gap: 10,
                }}
              >
                <Lock size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    fontSize: 14,
                    color: 'var(--text-main)',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
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
              {loading ? 'Verifying Account...' : 'Sign In to LocalKart'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div style={{ margin: '20px 0', textAlign: 'center', position: 'relative' }}>
            <div style={{ height: 1, background: 'var(--border)', width: '100%' }} />
            <span
              style={{
                position: 'relative',
                top: -10,
                background: '#ffffff',
                padding: '0 12px',
                fontSize: 12,
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              OR USE DEMO CREDENTIALS
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn btn-outline"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
            }}
          >
            <UserCheck size={16} />
            <span>Instant Demo Sign In (Hariom Yadav)</span>
          </button>

          {/* Link to Registration */}
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Don&apos;t have an account yet?{' '}
            <Link
              href={`/customer/signup${redirectPath !== '/customer' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}
              style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </>
  );
}
