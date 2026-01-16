"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ParticlesBackground from '@/components/ParticlesBackground';
import FormError from '@/components/FormError';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ParticlesBackground />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Hero header above form */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 font-display text-5xl font-bold text-white">Join SmartDocs</h1>
          <p className="text-slate-400">Create your account and get started today</p>
        </div>

        {/* Form card with LegalLens styling */}
        <div className="border border-white/5 bg-surface p-10 shadow-glow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white">Register</h2>
            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">New</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-white/10 bg-primary/60 px-4 py-3 text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="Alex Taylor"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-white/10 bg-primary/60 px-4 py-3 text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-white/10 bg-primary/60 px-4 py-3 text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && <FormError message={error} />}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent px-4 py-4 font-bold uppercase tracking-widest text-primary shadow-glow transition hover:bg-accent-dark hover:shadow-glow-lg disabled:opacity-50"
            >
              {loading ? 'Registering…' : 'Get Started'}
            </button>
          </form>

          {/* Google Sign-In */}
          <div className="mt-6 border-t border-white/5 pt-6">
            <p className="mb-4 text-center text-sm text-slate-400">Or continue with</p>
            <a
              href="http://localhost:3001/auth/google/login"
              className="flex w-full items-center justify-center gap-3 border border-white/10 bg-white px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </a>
          </div>
          
          <p className="mt-6 border-t border-white/5 pt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-accent transition hover:text-white">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}
