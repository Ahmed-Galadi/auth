## SmartDocs Auth

Full‑stack authentication demo with a NestJS backend and Next.js (App Router) frontend. It provides local email/password signup/signin, refresh tokens, role‑based access (USER/ADMIN), optional Google OAuth, and httpOnly cookies for session/access/refresh. Docker Compose runs frontend, backend, and Postgres together.

## Stack & Purpose
- **NestJS**: Backend framework with modules/controllers/guards for auth and users.
- **Passport (local/jwt/refresh/google)**: Validates credentials, protects routes, and supports optional Google OAuth.
- **JWT + refresh tokens**: Access/refresh issuance and rotation; refresh stored hashed in DB.
- **Prisma + PostgreSQL**: ORM and relational database for users and refresh token hashes.
- **Next.js (App Router)**: Frontend pages and API routes for login/register/logout/refresh; middleware for route protection.
- **jose**: Signs/verifies the session cookie on the frontend.
- **Zod**: Validates request bodies in frontend API routes.
- **Docker Compose**: Spins up backend, frontend, and Postgres; Makefile wraps common flows.
- **Tailwind CSS**: Styling for the UI pages.

## Architecture
```
root
├─ backend/ (NestJS)
│  ├─ src/auth/        # Auth module: controller, service, strategies, guards, decorators, configs
│  ├─ src/users/       # Users module: controller & service
│  ├─ src/prisma/      # PrismaService (global)
│  ├─ prisma/schema.prisma # User model & Role enum
├─ frontend/ (Next.js App Router)
│  ├─ app/             # Pages and API routes (login, register, dashboard, admin, auth APIs)
│  ├─ lib/             # Auth/session helpers, constants, validation
│  ├─ middleware.ts    # Route protection/redirects based on cookies and role
├─ docker-compose.yml  # Services: postgres, backend, frontend
├─ Makefile            # up/down/clean/logs; up runs prisma db push first
└─ .env                # Shared environment variables
```

### Backend (NestJS)
- **AuthModule**: Wires strategies (local, jwt, refresh, optional google), guards, and controllers.
- **AuthController**: Routes `/auth/signup`, `/signin`, `/refresh`, `/signout`, plus legacy `/register`/`/login` and Google OAuth endpoints.
- **AuthService**: Registers users, validates credentials, issues access/refresh tokens, hashes & stores refresh tokens, Google user validation, and signout (revokes refresh hash).
- **Strategies/guards**: Local for credentials; JWT for bearer auth; refresh strategy extracts token from header or cookie; guards wrap routes; `Public` decorator bypasses global JWT guard.
- **UsersModule/UsersService**: CRUD helpers to find/create users, store hashed refresh tokens, and admin listing.
- **RolesGuard**: Enforces role metadata (ADMIN) on protected routes.
- **PrismaModule/PrismaService**: Global DB client; connects on module init.

### Frontend (Next.js App Router)
- **Pages**: `/login`, `/register`, `/dashboard`, `/admin` with simple UI.
- **API routes**: `/api/login`, `/api/register`, `/api/refresh`, `/api/logout` talk to backend, manage cookies, and create a signed session cookie via `lib/session`.
- **Middleware**: Redirects unauthenticated users away from `/dashboard`/`/admin`, redirects logged-in users away from `/login`/`/register`, and enforces ADMIN for `/admin`.
- **Lib**:
  - `lib/auth.ts`: Calls backend auth endpoints; sets/clears access (`token`) and refresh (`refreshToken`) cookies.
  - `lib/session.ts`: Signs a short-lived `session` cookie with `jose`.
  - `lib/constants.ts`: Centralized env-driven URLs/names.
  - `lib/validation.ts`: Zod schemas for login/register payloads.

## Authentication Flow
1. **Signup** (`/api/register` → backend `/auth/signup`): Backend creates user, returns access/refresh; frontend sets `session`, `token`, and `refreshToken` httpOnly cookies.
2. **Signin** (`/api/login` → backend `/auth/signin` via Local strategy): Same token/cookie issuance as signup.
3. **Protected routes**: Frontend middleware checks `session` or `token`; backend uses `JwtAuthGuard` globally to enforce bearer tokens on protected controllers.
4. **Refresh** (`/api/refresh` → backend `/auth/refresh` with refresh token in Authorization or cookie): Backend validates hashed refresh, rotates both tokens; frontend rewrites cookies.
5. **Signout** (`/api/logout` → backend `/auth/signout` with access token): Backend clears stored refresh hash; frontend clears cookies and redirects to `/login`.
6. **Roles**: ADMIN-only backend route `GET /users`; frontend middleware reroutes non-admins away from `/admin`.
7. **Google OAuth (optional)**: Guard/strategy are wired; requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` to enable. Endpoints: `/auth/google/login`, `/auth/google/callback`.

## Setup & Running

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local non-docker runs)

### Environment
Create `.env` at repo root (sample already present):
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: Postgres credentials
- `DATABASE_URL`: Postgres connection string for Prisma (backend uses this)
- `BACKEND_PORT`: Exposed backend port (default 3001)
- `BACKEND_JWT_SECRET`, `BACKEND_JWT_EXPIRES_IN`: JWT signing and TTL
- `FRONTEND_PORT`: Exposed frontend port (default 3000)
- `NEXT_PUBLIC_APP_URL`: Public app URL (drives cookie `secure` flag)
- `SESSION_SECRET`: Secret for frontend `session` cookie (must be set)
- `BACKEND_URL`: Frontend-to-backend base URL (inside Docker usually `http://backend:3001`)
- Optional Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`

### With Docker (recommended)
```bash
# start: ensures prisma schema is pushed, then runs all services
make up

# view logs
make logs

# stop
make down

# clean everything (containers, images, volumes)
make clean
```

### Without Docker (local dev)
Backend:
```bash
cd backend
npm install
npx prisma db push
npm run start:dev
```
Frontend:
```bash
cd frontend
npm install
npm run dev
```
Ensure `BACKEND_URL` points to the backend (e.g., `http://localhost:3001`) and `NEXT_PUBLIC_APP_URL` matches the frontend origin for proper cookie `secure` handling.

## Services (Docker Compose)
- `postgres` → container `smartdocs-postgres` (image `postgres:16-alpine`), ports `5432:5432`, data in volume `postgres_data` mounted at `/var/lib/postgresql/data`.
- `backend` → container `smartdocs-backend` (image `auth-backend`), ports `3001:3001`.
- `frontend` → container `smartdocs-frontend` (image `auth-frontend`), ports `3000:3000`.

## Key Services/Modules
- **AuthService**: Registers users, validates credentials, issues/rotates access+refresh tokens, stores hashed refresh tokens, Google user linking, signout.
- **UsersService**: User creation, lookup by email/id/googleId, refresh-token hash persistence.
- **PrismaService**: Shared DB client.
- **Guards/Strategies**: Local (email/password), JWT, refresh JWT, Google OAuth; role guard and `Public` decorator for route control.
- **Frontend auth helpers**: `lib/auth.ts` (backend calls + cookie helpers), `lib/session.ts` (session cookie signing), `middleware.ts` (client routing protection).

## Project Structure (abridged)
- `backend/src/auth/` — Controller, service, strategies (local/jwt/refresh/google), guards, decorators, config.
- `backend/src/users/` — Users controller/service.
- `backend/src/prisma/` — Prisma module/service.
- `backend/prisma/schema.prisma` — User model and Role enum.
- `frontend/app/` — Pages (`login`, `register`, `dashboard`, `admin`) and API routes (`api/login|register|refresh|logout`).
- `frontend/lib/` — Auth/session helpers, constants, validation.
- `frontend/middleware.ts` — Route protection and redirects.
- `docker-compose.yml` — Backend, frontend, postgres services.
- `Makefile` — `up` (runs prisma db push first), `down`, `clean`, `logs`.

## Future Improvements
- Add automated migrations (`prisma migrate deploy`) and CI smoke tests for auth flows.
- Enhance error messaging/UX on frontend forms and add loading/error states to dashboards.
- Add rate limiting and brute-force protection on signin/refresh endpoints.
- Expand test coverage (unit/e2e) for auth, guards, and middleware redirects.

