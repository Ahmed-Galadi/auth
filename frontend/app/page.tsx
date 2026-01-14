import Link from 'next/link';
import ParticlesBackground from '@/components/ParticlesBackground';

export default function HomePage() {
  return (
    <>
      <ParticlesBackground />
      
      <div className="relative z-10 w-full">
        {/* Hero Section */}
        <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-6 font-display text-7xl font-bold leading-tight tracking-tight text-white lg:text-8xl">
            Welcome to <span className="text-accent">SmartDocs</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-300">
            Enterprise-grade authentication and user management platform built with cutting-edge technology.
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link
              href="/login"
              className="border-2 border-accent bg-transparent px-8 py-4 font-bold uppercase tracking-widest text-accent transition hover:bg-accent hover:text-primary hover:shadow-glow"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-accent px-8 py-4 font-bold uppercase tracking-widest text-primary shadow-glow transition hover:bg-accent-dark hover:shadow-glow-lg"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="relative z-10 mx-auto -mt-32 mb-32 grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group border border-white/5 bg-surface p-8 transition-all duration-500 hover:-translate-y-3 hover:border-accent/30 hover:shadow-glow">
            <div className="mb-4 text-4xl text-accent">🔐</div>
            <h3 className="mb-3 font-display text-xl font-bold text-white">JWT Authentication</h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Secure token-based authentication with automatic refresh token rotation.
            </p>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Learn More →
            </div>
          </div>

          <div className="group border border-white/5 bg-surface p-8 transition-all duration-500 hover:-translate-y-3 hover:border-accent/30 hover:shadow-glow">
            <div className="mb-4 text-4xl text-accent">👥</div>
            <h3 className="mb-3 font-display text-xl font-bold text-white">Role-Based Access</h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Granular permission control with user and admin role management.
            </p>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Learn More →
            </div>
          </div>

          <div className="group border border-white/5 bg-surface p-8 transition-all duration-500 hover:-translate-y-3 hover:border-accent/30 hover:shadow-glow">
            <div className="mb-4 text-4xl text-accent">🍪</div>
            <h3 className="mb-3 font-display text-xl font-bold text-white">Secure Sessions</h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              HttpOnly cookies and encrypted session management for maximum security.
            </p>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Learn More →
            </div>
          </div>

          <div className="group border border-white/5 bg-surface p-8 transition-all duration-500 hover:-translate-y-3 hover:border-accent/30 hover:shadow-glow">
            <div className="mb-4 text-4xl text-accent">⚡</div>
            <h3 className="mb-3 font-display text-xl font-bold text-white">Admin Dashboard</h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              Comprehensive user management interface with full CRUD operations.
            </p>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent opacity-0 transition-opacity group-hover:opacity-100">
              Learn More →
            </div>
          </div>
        </section>

        <p className="relative z-10 mb-16 text-center text-sm italic text-slate-500">
          Admin users are automatically redirected to the management console upon login.
        </p>
      </div>
    </>
  );
}
