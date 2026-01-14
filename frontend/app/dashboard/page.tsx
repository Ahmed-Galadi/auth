import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import LogoutButton from '@/components/LogoutButton';

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
    <div className="w-full max-w-3xl rounded-2xl border border-slate-800/70 bg-slate-900/70 p-8 shadow-glow backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">Welcome back, {user.email}</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full border border-brand/50 bg-brand/15 px-3 py-1 text-brand-2">User ID: {user.userId}</span>
          <span className="rounded-full border border-emerald-600/40 bg-emerald-500/15 px-3 py-1 text-emerald-200">Role: {user.role}</span>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
        <pre className="text-sm text-slate-100">{JSON.stringify(profile, null, 2)}</pre>
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
