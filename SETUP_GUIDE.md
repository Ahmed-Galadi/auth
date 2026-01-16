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

### Google OAuth (Optional)
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```
- **Purpose**: Google OAuth 2.0 Client ID for "Sign in with Google"
- **Used by**: Backend (Google OAuth strategy)
- **Default**: Placeholder value (won't work until replaced with real credentials)
- **How to get**: See section "8. Google OAuth Setup (Optional)" below

```bash
GOOGLE_CLIENT_SECRET=your-google-client-secret
```
- **Purpose**: Google OAuth 2.0 Client Secret
- **Used by**: Backend (Google OAuth strategy)
- **Security**: Keep this secret! Never commit to git
- **How to get**: See section "8. Google OAuth Setup (Optional)" below

```bash
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```
- **Purpose**: Where Google redirects after user authenticates
- **Used by**: Backend (Google OAuth strategy)
- **Format**: `http://localhost:3001/auth/google/callback` (development)
- **Production**: Change to `https://yourdomain.com/auth/google/callback`

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
- [ ] If using Google OAuth: Create production credentials and update callback URLs
- [ ] If using Google OAuth: Publish OAuth consent screen (remove testing mode)

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

---

## 8. Google OAuth Setup (Optional)

The "Sign in with Google" button is already integrated in the login and register pages. To activate it:

### Why Use Google OAuth?
- ✅ Users can sign in with their Google account (no password needed)
- ✅ Faster registration and login
- ✅ Leverages Google's security
- ✅ Optional - your app works perfectly without it

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name: `SmartDocs Auth` (or any name you prefer)
   - Click "Create"

3. **Enable Google+ API**
   - In the left menu: **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click it and press "Enable"

4. **Configure OAuth Consent Screen**
   - Go to: **APIs & Services** → **OAuth consent screen**
   - User Type: Select **"External"**
   - Click "Create"
   - Fill in required fields:
     - **App name**: `SmartDocs` (or your app name)
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click "Save and Continue"
   - **Scopes**: Click "Add or Remove Scopes"
     - Select: `.../auth/userinfo.email` and `.../auth/userinfo.profile`
     - Click "Update" → "Save and Continue"
   - **Test users**: Add your Gmail address for testing
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials**
   - Go to: **APIs & Services** → **Credentials**
   - Click **"+ Create Credentials"** → **"OAuth 2.0 Client ID"**
   - Application type: **Web application**
   - Name: `SmartDocs Web Client`
   - **Authorized JavaScript origins**:
     - Add: `http://localhost:3000`
     - Add: `http://localhost:3001`
   - **Authorized redirect URIs**:
     - Add: `http://localhost:3001/auth/google/callback`
   - Click "Create"

6. **Copy Your Credentials**
   - You'll see a popup with:
     - **Client ID**: Something like `123456789-abcdefg...apps.googleusercontent.com`
     - **Client Secret**: Something like `GOCSPX-abc123def456...`
   - **Save these!** You'll need them in the next step

### Step 2: Update Your `.env` File

Open `.env` in the root directory and replace the placeholder values:

```bash
# Replace these lines:
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# With your actual values from Google Console:
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

### Step 3: Restart Docker Containers

```bash
docker-compose down
docker-compose up -d
```

### Step 4: Test Google OAuth

1. Visit: http://localhost:3000/login
2. Click the **"Sign in with Google"** button
3. You'll be redirected to Google's login page
4. Sign in with your Gmail account
5. Grant permission: "Allow SmartDocs to access email and profile"
6. You'll be redirected back and logged in automatically!

### How Google OAuth Works in Your App

```
User clicks "Sign in with Google"
   ↓
Redirects to backend: http://localhost:3001/auth/google/login
   ↓
Backend redirects to Google OAuth page
   ↓
User signs in with Gmail and grants permission
   ↓
Google redirects back with code: http://localhost:3001/auth/google/callback?code=...
   ↓
Backend:
  - Validates code with Google
  - Gets user info (email, name, Google ID)
  - Creates new user OR links Google to existing email
  - Generates JWT tokens
  - Sets cookies
  - Redirects to frontend: http://localhost:3000/auth/google/callback?success=true
   ↓
Frontend redirects to dashboard
   ↓
✅ User is logged in!
```

### Database Behavior with Google OAuth

**First-time Google user:**
```sql
INSERT INTO "User" (email, name, googleId, password, role)
VALUES ('user@gmail.com', 'User Name', 'google-id-123', NULL, 'USER');
```
- `password` is `NULL` (Google users don't have passwords)
- `googleId` stores Google's unique identifier

**Existing email + Google login:**
```sql
UPDATE "User" 
SET googleId = 'google-id-123'
WHERE email = 'user@gmail.com';
```
- Links Google account to existing user
- User can now login with both email/password AND Google

### Troubleshooting Google OAuth

#### Error: "redirect_uri_mismatch"
**Problem**: Callback URL doesn't match Google Console configuration

**Solution**: 
- Go to Google Console → Credentials → Your OAuth Client
- Verify "Authorized redirect URIs" contains exactly:
  ```
  http://localhost:3001/auth/google/callback
  ```

#### Error: "Access blocked: This app's request is invalid"
**Problem**: OAuth consent screen not properly configured

**Solution**: Complete Step 1.4 above (OAuth consent screen setup)

#### Backend logs show: "Google OAuth not configured"
**Problem**: Environment variables not loaded

**Solution**:
1. Verify `.env` has real values (not placeholders starting with "your-")
2. Restart containers: `docker-compose down && docker-compose up -d`
3. Check logs: `docker-compose logs backend | grep -i google`

#### Google button doesn't redirect
**Problem**: Frontend can't reach backend

**Solution**: Verify `BACKEND_URL=http://backend:3001` in `.env` (NOT localhost)

### Production Deployment for Google OAuth

Before deploying to production:

1. **Create production OAuth credentials** in Google Console
2. **Add production domains** to authorized origins:
   - `https://yourdomain.com`
   - `https://api.yourdomain.com` (if separate)
3. **Update authorized redirect URIs**:
   - `https://yourdomain.com/auth/google/callback`
4. **Update `.env` for production**:
   ```bash
   GOOGLE_CLIENT_ID=<production-client-id>
   GOOGLE_CLIENT_SECRET=<production-client-secret>
   GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```
5. **Publish OAuth consent screen** (remove testing mode)
6. **Test thoroughly** on production domain

### Security Notes for Google OAuth

- ✅ Google users have `password = NULL` in database (can't use email/password login)
- ✅ Tokens are still httpOnly cookies (JavaScript can't access)
- ✅ Refresh tokens are hashed in database
- ✅ Same token rotation and refresh flow as email/password
- ✅ Account linking prevents duplicate users with same email

---

## 9. Additional Resources
