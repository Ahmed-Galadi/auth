# SmartDocs Auth - Setup Guide

## 1. Files Not Cloned (In .gitignore)

When you clone this project, the following files are NOT included because they're in `.gitignore`:

### Required File: `.env`
The `.env` file contains sensitive environment variables and must be created manually.

**Location**: `/home/agaladi/Desktop/auth/.env` (root directory)

**How to create it**:
The `.env` file already exists in this project, but if you need to recreate it, copy the template below.

---

## 2. Environment Variables Explained

Here's every variable in the `.env` file with its purpose:

### PostgreSQL Configuration
```bash
POSTGRES_USER=smartdocs_user
```
- **Purpose**: Username for PostgreSQL database
- **Used by**: `postgres` Docker container
- **Default**: `smartdocs_user`
- **Note**: Can be any username you choose

```bash
POSTGRES_PASSWORD=smartdocs_password_2024
```
- **Purpose**: Password for PostgreSQL database
- **Used by**: `postgres` Docker container
- **Default**: `smartdocs_password_2024`
- **Security**: Change this in production! Generate secure password with `openssl rand -base64 32`

```bash
POSTGRES_DB=smartdocs_db
```
- **Purpose**: Name of the PostgreSQL database
- **Used by**: `postgres` Docker container
- **Default**: `smartdocs_db`
- **Note**: Can be any database name you choose

### Database URL
```bash
DATABASE_URL=postgresql://smartdocs_user:smartdocs_password_2024@postgres:5432/smartdocs_db
```
- **Purpose**: Full connection string for Prisma ORM to connect to PostgreSQL
- **Used by**: Backend (Prisma)
- **Format**: `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE`
- **Important**: 
  - Use `postgres` as HOST (Docker service name, NOT `localhost`)
  - Must match `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` values

### Backend Configuration
```bash
BACKEND_PORT=3001
```
- **Purpose**: Port where backend API runs
- **Used by**: Backend container port mapping
- **Default**: `3001`
- **Access**: http://localhost:3001 (from host machine)

```bash
BACKEND_URL=http://backend:3001
```
- **Purpose**: URL for frontend to communicate with backend
- **Used by**: Frontend container
- **Critical**: 
  - MUST use `http://backend:3001` (Docker service name)
  - NOT `http://localhost:3001` (won't work inside Docker)
  - For non-Docker setup: use `http://localhost:3001`

```bash
BACKEND_JWT_SECRET=secret123
```
- **Purpose**: Secret key for signing JWT access tokens
- **Used by**: Backend (NestJS JWT module)
- **Security**: MUST change in production! Generate with `openssl rand -base64 32`
- **Impact**: If changed, all existing tokens become invalid

```bash
BACKEND_JWT_EXPIRES_IN=7d
```
- **Purpose**: How long JWT access tokens are valid
- **Used by**: Backend JWT configuration
- **Format**: `15m` (15 minutes), `1h` (1 hour), `7d` (7 days), etc.
- **Default**: `7d`
- **Recommendation**: Use shorter duration (15m-1h) in production

### Frontend Configuration
```bash
FRONTEND_PORT=3000
```
- **Purpose**: Port where frontend Next.js app runs
- **Used by**: Frontend container port mapping
- **Default**: `3000`
- **Access**: http://localhost:3000 (from host machine)

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
- **Purpose**: Public URL of the application
- **Used by**: Frontend (determines cookie `secure` flag behavior)
- **Important**: 
  - Use `http://localhost:3000` for local development
  - Use `https://yourdomain.com` in production
  - Affects whether cookies require HTTPS

```bash
SESSION_SECRET=change-this-to-another-secure-random-string-min-32-characters-production
```
- **Purpose**: Secret key for signing frontend session cookies (using jose)
- **Used by**: Frontend session management
- **Security**: MUST be at least 32 characters! Generate with `openssl rand -base64 32`
- **Impact**: If changed, all existing sessions become invalid

### Environment
```bash
NODE_ENV=development
```
- **Purpose**: Specifies the environment mode
- **Used by**: Backend and Frontend
- **Values**: `development`, `production`, `test`
- **Default**: `development`

---

## 3. Creating Users and Admins

### A. Create First Admin User (Bootstrap Process)

Since admin endpoints require authentication, you need to create the first admin manually:

#### Step 1: Create a regular user
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed",
    "email": "ahmed123@gmail.com",
    "password": "ahmed123"
  }'
```

#### Step 2: Manually promote to ADMIN in database
```bash
docker exec -it smartdocs-postgres psql -U smartdocs_user -d smartdocs_db -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'ahmed123@gmail.com';"
```

#### Step 3: Login to get access token
```bash
curl -X POST http://localhost:3001/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed123@gmail.com",
    "password": "ahmed123"
  }'
```

**Save the `accessToken` from the response!**

### B. Create Additional Admin Users (Using API)

Once you have an admin account with a valid access token:

```bash
curl -X POST http://localhost:3001/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "name": "Another Admin",
    "email": "admin2@gmail.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

**Replace `YOUR_ACCESS_TOKEN_HERE` with the actual token from login!**

### C. Create Regular Users (Using API)

With admin authentication:

```bash
curl -X POST http://localhost:3001/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "USER"
  }'
```

Or users can self-register (creates USER role by default):

```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123"
  }'
```

---

## 4. Quick Start Commands

### Start the Project
```bash
make up
```

### Stop the Project
```bash
make down
```

### View Logs
```bash
make logs
```

### Clean Everything (Remove containers, images, volumes)
```bash
make clean
```

### Access Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

---

## 5. Common Issues & Solutions

### Issue: "Registration returns 500 error"
**Solution**: Ensure `BACKEND_URL=http://backend:3001` (NOT localhost) in `.env`

### Issue: "Cannot connect to database"
**Solution**: 
1. Check containers are running: `docker-compose ps`
2. Verify `DATABASE_URL` uses `@postgres:5432` (NOT localhost)
3. Restart: `make down && make up`

### Issue: "Access token expired"
**Solution**: Login again to get a new token, or adjust `BACKEND_JWT_EXPIRES_IN`

### Issue: "Unauthorized when calling admin endpoints"
**Solution**: 
1. Verify you're logged in as ADMIN
2. Check Authorization header: `Authorization: Bearer YOUR_TOKEN`
3. Confirm user role in database:
```bash
docker exec -it smartdocs-postgres psql -U smartdocs_user -d smartdocs_db -c "SELECT id, email, role FROM \"User\";"
```

---

## 6. Security Checklist for Production

- [ ] Change `POSTGRES_PASSWORD` to a strong password
- [ ] Change `BACKEND_JWT_SECRET` to a secure random string (32+ chars)
- [ ] Change `SESSION_SECRET` to a secure random string (32+ chars)
- [ ] Set `BACKEND_JWT_EXPIRES_IN` to a shorter duration (15m-1h)
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production domain with HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Never commit `.env` file to git
- [ ] Use environment-specific `.env` files for different environments

---

## 7. Useful Database Commands

### View all users
```bash
docker exec -it smartdocs-postgres psql -U smartdocs_user -d smartdocs_db -c "SELECT id, name, email, role FROM \"User\";"
```

### Make user an admin
```bash
docker exec -it smartdocs-postgres psql -U smartdocs_user -d smartdocs_db -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'user@example.com';"
```

### Delete a user
```bash
docker exec -it smartdocs-postgres psql -U smartdocs_user -d smartdocs_db -c "DELETE FROM \"User\" WHERE email = 'user@example.com';"
```

### Access PostgreSQL shell
```bash
docker exec -it smartdocs-postgres psql -U smartdocs_user -d smartdocs_db
```
