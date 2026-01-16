"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ParticlesBackground from '@/components/ParticlesBackground';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google sign-in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('Google sign-in was cancelled or failed.');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        if (success === 'true') {
          setStatus('success');
          setMessage('Sign-in successful! Redirecting...');

          // Fetch user info to determine redirect
          setTimeout(async () => {
            try {
              const res = await fetch('/api/refresh', { method: 'POST' });
              if (res.ok) {
                const data = await res.json();
                if (data.user?.role === 'ADMIN') {
                  router.push('/admin');
                } else {
                  router.push('/dashboard');
                }
              } else {
                router.push('/dashboard');
              }
            } catch {
              router.push('/dashboard');
            }
          }, 1500);
        } else {
          setStatus('error');
          setMessage('Invalid callback response.');
          setTimeout(() => router.push('/login'), 3000);
        }

      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An error occurred during sign-in.');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <>
      <ParticlesBackground />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="border border-white/5 bg-surface p-10 shadow-glow-lg">
          <div className="text-center">
            {status === 'loading' && (
              <div className="mb-6">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="mb-6">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mb-6">
                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}

            <h2 className="mb-2 font-display text-2xl font-bold text-white">
              {status === 'loading' && 'Signing in...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Error'}
            </h2>
            
            <p className="text-slate-400">{message}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <>
        <ParticlesBackground />
        <div className="relative z-10 w-full max-w-md">
          <div className="border border-white/5 bg-surface p-10 shadow-glow-lg">
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
              </div>
              <h2 className="mb-2 font-display text-2xl font-bold text-white">Loading...</h2>
              <p className="text-slate-400">Please wait</p>
            </div>
          </div>
        </div>
      </>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
