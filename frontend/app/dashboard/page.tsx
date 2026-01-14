import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import LogoutButton from '@/components/LogoutButton';
import ParticlesBackground from '@/components/ParticlesBackground';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

async function fetchProfile(token: string) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  const res = await fetch(`${backendUrl}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to load profile');
  }
  return res.json();
}

export default async function DashboardPage() {
  const token = cookies().get('token')?.value;
  if (!token) {
    // Middleware should handle redirect; fallback
    return <p>Redirecting...</p>;
  }

  const user = jwtDecode<JwtPayload>(token);
  const profile = await fetchProfile(token);

  return (
    <>
      <ParticlesBackground />
      
      <div className="relative z-10 w-full max-w-3xl border border-white/5 bg-surface p-8 shadow-glow-lg">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">Welcome back, {user.email}</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full border border-accent/50 bg-accent/15 px-3 py-1 text-accent">User ID: {user.userId}</span>
          <span className="rounded-full border border-emerald-600/40 bg-emerald-500/15 px-3 py-1 text-emerald-200">Role: {user.role}</span>
        </div>
      </div>

      <div className="mt-6 border border-white/10 bg-primary/60 p-4">
        <pre className="text-sm text-slate-100">{JSON.stringify(profile, null, 2)}</pre>
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
    </>
  );
}
