"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ParticlesBackground from '@/components/ParticlesBackground';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
          <h1 className="mb-3 font-display text-5xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400">Access your SmartDocs Intelligence Suite</p>
        </div>

        {/* Form card with LegalLens styling */}
        <div className="border border-white/5 bg-surface p-10 shadow-glow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white">Login</h2>
            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">Secure</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent px-4 py-4 font-bold uppercase tracking-widest text-primary shadow-glow transition hover:bg-accent-dark hover:shadow-glow-lg disabled:opacity-50"
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>
          
          <p className="mt-6 border-t border-white/5 pt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-accent transition hover:text-white">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}
