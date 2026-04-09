# Certificate Verification System
**Live Demo:** [Click here to view the live application](https://credi-fy.vercel.app/)

A comprehensive system for managing user authentication, generating certificates, and verifying their authenticity. Built with modern technologies for security and scalability.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [Running the Project](#running-the-project)
- [Authentication Flow](#authentication-flow)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

This system provides:

- **User Authentication** — Email/password and Social login (Google, GitHub) via Clerk
- **Email Verification** — Token-based verification with secure links
- **Certificate Management** — Generate, store, download, and search certificates
- **Security** — JWT tokens, refresh tokens, and role-based access control
- **Data Integrity** — Secure certificate generation and validation

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.4 | UI Framework |
| Vite | latest | Build tool & dev server |
| React Router DOM | 7.13.1 | Client-side routing |
| Clerk React | 5.61.4 | OAuth & authentication |
| Axios | latest | HTTP client |
| Tailwind CSS | 3.4.19 | Styling |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js & Express | 5.2.1 | Server framework |
| MongoDB & Mongoose | 8.9.5 | Database & ODM |
| jsonwebtoken | 9.0.3 | Token authentication |
| Clerk SDK | 4.13.23 | OAuth token verification |
| Nodemailer | 8.0.3 | Email service |
| Handlebars | 4.7.8 | Certificate template rendering |
| Multer | 2.1.1 | File upload handling |
| Puppeteer | 24.40.0 | PDF generation |
| SheetJS | 0.18.5 | Excel file parsing |

---

## Features

### Authentication
- Custom email/password registration and login
- Email verification with token-based confirmation
- OAuth login via Google and GitHub (Clerk)
- JWT access tokens + HTTP-only refresh cookies
- Token refresh endpoint for session management

### User Management
- Role-based access control (Admin, User)
- User profile management
- Email verification status tracking
- Secure password handling with bcrypt

### Certificate Management
- Certificate generation with HTML templates
- Certificate download (PDF format via Puppeteer)
- Certificate search and filtering
- Bulk certificate upload via Excel (Admin only)
- Public verification without authentication

### Admin Dashboard
- Upload student data from Excel files
- Manage certificates
- User management capabilities
- System monitoring

### Security
- CORS protection with origin validation
- Request validation and sanitization
- Rate limiting ready (infrastructure)
- Secure token storage (HTTP-only cookies)
- Email verification for account security
- NoSQL injection prevention
- Helmet.js for HTTP headers security

---

## Prerequisites

- Node.js v14 or higher
- npm v7 or higher
- MongoDB Atlas account (free tier available)
- Clerk account (for OAuth)
- Gmail account (for email verification)
- Render account (for deployment)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/heychirru/Certificate-Verification-System.git
cd Certificate-Verification-System
```

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../Frontend
npm install
```

---

## Environment Configuration

### Backend — `Backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/cvs

# JWT
JWT_SECRET=your_long_random_jwt_secret_here
JWT_REFRESH_SECRET=your_long_random_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:5173

# Admin Seeding
SEED_ADMIN_EMAIL=admin@hero.com
SEED_ADMIN_PASSWORD=Adminpass137!
SEED_ADMIN_NAME=Admin
SEED_ADMIN_EMAIL_VERIFIED=true

# Certificate
ORGANIZATION_NAME=Amdox Technologies

# Email (Gmail with App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-16-chars

# Clerk (Optional - for OAuth)
CLERK_SECRET_KEY=sk_test_your_secret
CLERK_PUBLISHABLE_KEY=pk_test_your_key
```

### Frontend — `Frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key
```

---

## Project Structure

```
Certificate-Verification-System/
├── Backend/
│   ├── src/
│   │   ├── app.js                        # Express app setup
│   │   ├── config/
│   │   │   └── db.js                     # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js         # Auth logic
│   │   │   ├── certificateController.js  # Certificate logic
│   │   │   ├── dataController.js         # Excel upload logic
│   │   │   ├── searchController.js       # Search logic
│   │   │   └── verificationController.js # Verification logic
│   │   ├── middleware/
│   │   │   ├── authenticate.js           # JWT middleware
│   │   │   ├── authorize.js              # Role-based access
│   │   │   ├── clerkAuth.js              # Clerk middleware
│   │   │   ├── requireJsonBody.js        # JSON parsing
│   │   │   └── upload.js                 # Multer configuration
│   │   ├── models/
│   │   │   ├── User.js                   # User schema
│   │   │   ├── Student.js                # Certificate/Student data
│   │   │   └── SearchLog.js              # Search history
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── certificateRoutes.js
│   │   │   ├── dataRoutes.js
│   │   │   ├── searchRoutes.js
│   │   │   └── verificationRoutes.js
│   │   ├── templates/
│   │   │   └── certificate.hbs           # Certificate template
│   │   ├── utils/
│   │   │   ├── certificateGenerator.js   # PDF generation
│   │   │   ├── generateTokens.js         # JWT generation
│   │   │   ├── sendEmail.js              # Email service
│   │   │   └── cleanupUnverifiedUsers.js # Scheduled cleanup
│   │   └── validators/
│   │       ├── authValidator.js
│   │       └── dataValidator.js
│   ├── scripts/
│   │   ├── seedAdmin.js                  # Create admin user
│   │   ├── generateSampleCertificates.js # Create test data
│   │   └── verifyUpload.js               # Verify database
│   ├── server.js                         # Entry point
│   ├── package.json
│   └── .env.example
│
└── Frontend/
    ├── src/
    │   ├── App.jsx                        # Root component
    │   ├── main.jsx
    │   ├── index.css
    │   ├── api/
    │   │   ├── auth.js                    # Auth API calls
    │   │   └── client.js                  # Axios instance
    │   ├── auth/
    │   │   └── token.js                   # Token management
    │   ├── components/
    │   │   ├── ClerkAuthButtons.jsx       # OAuth buttons
    │   │   └── PasswordField.jsx
    │   └── pages/
    │       ├── Home.jsx                   # Public search page
    │       ├── SignIn.jsx
    │       ├── SignUp.jsx
    │       ├── VerifyEmail.jsx
    │       ├── AuthCallback.jsx           # OAuth callback
    │       ├── AuthLayout.jsx
    │       ├── AdminDashboard.jsx         # Admin panel
    │       └── CertificateView.jsx        # Certificate display
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── .env.example
```

---

## Running the Project

### Development Mode

Open two terminals and run each service separately.

**Terminal 1 — Backend**

```bash
cd Backend
npm run dev
```

Backend server runs at `http://localhost:5000`

**Terminal 2 — Frontend**

```bash
cd Frontend
npm run dev
```

Frontend app runs at `http://localhost:5173`

### Seed Admin User (Optional)

```bash
cd Backend
npm run seed:admin
```

This creates:
- Email: `admin@hero.com`
- Password: `Adminpass137!`

---

## Authentication Flow

### Custom Email/Password

```
Register with email & password
        ↓
Verification email sent automatically
        ↓
User clicks verification link
        ↓
Account verified → user can now log in
        ↓
JWT access token + refresh cookie issued
        ↓
Logged in
```

### Clerk OAuth (Google / GitHub)

```
User clicks "Sign in with Google" or "Sign in with GitHub"
        ↓
Clerk OAuth flow initiated
        ↓
Redirected to provider login page
        ↓
After authentication → redirected to /auth-callback
        ↓
Clerk token exchanged for JWT
        ↓
User created or found in database
        ↓
Logged in → redirected to home
```

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in a user |
| POST | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/refresh-token` | Refresh JWT access token |
| POST | `/api/auth/clerk-token` | Exchange Clerk token for JWT |
| GET | `/api/auth/logout` | Log out the current user |

### Certificate Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/certificate/:id` | Get certificate by ID | No |
| GET | `/api/certificate/:id/download` | Download certificate PDF | No |
| GET | `/api/certificates` | Get all certificates | Admin |
| POST | `/api/certificates/generate` | Generate a new certificate | Admin |
| DELETE | `/api/certificates/:id` | Delete a certificate | Admin |

### Data Management Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/data/upload` | Upload Excel file with certificates | Admin |
| GET | `/api/data` | Get all student data | Admin |
| POST | `/api/data` | Create a data entry | Admin |

### Search Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/search/certificates` | Search certificates |
| GET | `/api/search/history` | Get search history |

---

## Testing

### Sample Certificates

Sample certificates have been pre-loaded into the database for testing:

| Certificate ID | Student Name | Domain | Status |
|---|---|---|---|
| **CERT-V001** | Jane Smith | Web Development | ✅ Active |
| **CERT-V002** | John Doe | Data Science | ✅ Active |
| **CERT-V003** | Alice Kumar | Machine Learning | ✅ Active |

### Test Certificate Verification

**Via Browser:**
- Visit: `http://localhost:5173/certificate/CERT-V001`
- Or search via home page with ID: `CERT-V001`
- Click "Download Certificate" to get PDF

**Via API:**
```bash
curl http://localhost:5000/api/certificate/CERT-V001
```

### Manual Testing Guide

**Register a new account**
1. Navigate to `/sign-up`
2. Enter an email and password
3. Check your inbox for the verification email
4. Click the verification link to activate your account

**Log in**
1. Navigate to `/sign-in`
2. Enter your credentials
3. You should be redirected to the home page

**OAuth login**
1. Navigate to `/sign-in` or `/sign-up`
2. Click "Google" or "GitHub"
3. Complete the provider's authentication flow
4. A user account is created and you are logged in automatically

**Admin Dashboard - Upload Certificates**
1. Login as admin: `admin@hero.com` / `Adminpass137!`
2. Navigate to `/admin`
3. Upload Excel file with certificate data
4. Verify upload results and check database

**Excel Upload Format**

Your Excel file should have these columns:
| certificateId | studentName | email | internshipDomain | startDate | endDate |
|---|---|---|---|---|---|
| CERT-001 | John Doe | john@example.com | Web Development | 2024-01-15 | 2024-03-15 |
| CERT-002 | Jane Smith | jane@example.com | Data Science | 2024-02-01 | 2024-04-30 |

### Verification Script

Verify uploaded certificates in the database:

```bash
cd Backend
node scripts/verifyUpload.js
```

This will display all certificates in the database with their details.

---

## Deployment

### Render Deployment (Recommended)

This project is ready for production deployment on **Render.com** with auto-deploy from GitHub.

#### Prerequisites for Deployment
- GitHub account with repository access
- Render account (free tier available: https://render.com)
- MongoDB Atlas account (free tier available)
- Production environment variables

---

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Production ready - ready for Render deployment"
git push origin main
```

---

### Step 2: Deploy Backend to Render

1. **Visit Render Dashboard:** https://dashboard.render.com

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Select your GitHub repository
   - Click **"Connect"**

3. **Configure Backend Service**
   ```
   Name: cvs-backend
   Environment: Node
   Build Command: npm install
   Start Command: node Backend/server.js
   Instance Type: Free (or paid for production)
   ```

4. **Set Environment Variables in Render Dashboard**
   Go to **Environment** section and add:
   ```
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/cvs
   JWT_SECRET=your-long-random-secret-key-here
   JWT_REFRESH_SECRET=your-long-random-refresh-secret-here
   CLIENT_URL=https://cvs-frontend.onrender.com
   ORGANIZATION_NAME=Amdox Technologies
   NODE_ENV=production
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ```

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait for deployment (5-10 minutes)
   - Note your Backend URL (e.g., `https://cvs-backend.onrender.com`)

---

### Step 3: Deploy Frontend to Render

1. **Create Static Site on Render**
   - Click **"New +"** → **"Static Site"**
   - Select your GitHub repository
   - Click **"Connect"**

2. **Configure Frontend Service**
   ```
   Name: cvs-frontend
   Build Command: cd Frontend && npm install && npm run build
   Publish Directory: Frontend/dist
   ```

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://cvs-backend.onrender.com/api
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
   ```

4. **Deploy**
   - Click **"Create Static Site"**
   - Wait for build (3-5 minutes)
   - Note your Frontend URL (e.g., `https://cvs-frontend.onrender.com`)

---

### Step 4: Update Backend with Frontend URL

1. Go back to Backend service in Render Dashboard
2. Update environment variable:
   ```
   CLIENT_URL=https://cvs-frontend.onrender.com
   ```
3. Click **"Deploy"** to redeploy with updated URL

---

### Production URLs

Once deployed, your services will be available at:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://cvs-frontend.onrender.com` | Main application |
| **Backend API** | `https://cvs-backend.onrender.com/api` | REST API |
| **Home Page** | `https://cvs-frontend.onrender.com/` | Public search |
| **Admin Dashboard** | `https://cvs-frontend.onrender.com/admin` | Certificate upload |
| **Cert Verification** | `https://cvs-frontend.onrender.com/certificate/CERT-V001` | Public verification |

### Deployment Checklist

Before going live:

- [ ] Push all changes to main/production branch
- [ ] Verify MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Render or use dynamic IPs)
- [ ] Test API endpoints on production
- [ ] Test certificate verification on production
- [ ] Test certificate download/PDF generation
- [ ] Verify email notifications work in production
- [ ] Test admin dashboard upload functionality
- [ ] Check Render dashboard for build/runtime errors
- [ ] Monitor logs: `Render Dashboard → Logs`
- [ ] Test OAuth (Google/GitHub) in production

### Auto-Deploy Setup

Render automatically deploys when you push to your main branch:

1. Any push to `main` → triggers build
2. Successful build → deploys automatically
3. Failed build → notifies you, no deployment

To disable auto-deploy:
- Go to Service Settings → Auto-Deploy → Off

---

## Scripts

### Development Scripts

**Backend:**
```bash
npm run dev              # Start with nodemon (auto-reload)
npm start              # Start production server
npm run seed:admin     # Create admin user
node scripts/verifyUpload.js  # Verify certificates in DB
```

**Frontend:**
```bash
npm run dev            # Start Vite dev server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

---

## Troubleshooting

### Development Issues

**Google / GitHub OAuth button not working**
- Open browser console (F12) and check for errors
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is set in Frontend `.env`
- Ensure Clerk is properly initialized
- Try hard refresh: `Ctrl + Shift + R`

**MongoDB connection error**
- Verify `MONGO_URI` is correct in `Backend/.env`
- Check IP whitelist in MongoDB Atlas (add your IP)
- Test connection with MongoDB Compass

**Emails not sending**
- Verify Gmail App Password (not account password)
- Enable "Less secure app access" if needed
- Check spam folder

**Certificate not found during verification**
- Use correct certificate ID (e.g., `CERT-V001`, not `CERT-001`)
- Run `node scripts/verifyUpload.js` to check DB
- Verify certificate was uploaded successfully

### Production Issues (Render)

**Build fails on Render**
- Run `npm run build` locally to test
- Check Render build logs: Dashboard → Logs
- Ensure all dependencies in `package.json`
- Verify Node.js version compatibility

**API returns 404 in production**
- Verify `VITE_API_URL` matches your Render backend URL
- Check backend service is running: Dashboard → Health
- Clear browser cache: `Ctrl + Shift + Delete`
- Test endpoint directly: `https://cvs-backend.onrender.com/api/certificate/CERT-V001`

**CORS errors in production**
- Verify `CLIENT_URL` in backend matches frontend URL exactly
- Use `https://` for production URLs
- Services may need 5-10 minutes to fully propagate

**Database unreachable**
- Add MongoDB Atlas IP whitelist for Render
- Or use `0.0.0.0/0` (allows all IPs)
- Test with MongoDB Compass using same URI
- Check connection string in Render environment variables

**Free tier suspended**
- Render free tier may auto-suspend after 15 mins of inactivity
- Upgrade to paid tier for always-on service
- Use external monitoring to keep service warm

---

## Token Management

### Access Token
- **Duration:** 15 minutes
- **Storage:** Memory (frontend)
- **Use:** API requests (`Authorization: Bearer <token>`)

### Refresh Token
- **Duration:** 7 days
- **Storage:** HTTP-only cookie (secure, never exposed to JavaScript)
- **Use:** Automatically used to refresh access token when expired

### Token Refresh Flow
1. Access token expires
2. Refresh token automatically used to get new access token
3. If refresh token expired → user redirected to login

---

## Security Best Practices

✅ **Implemented in this project:**
- HTTPS-ready with helmet.js
- HTTP-only cookies for refresh tokens
- bcrypt password hashing (10 salt rounds)
- JWT token validation on every route
- Email verification required
- NoSQL injection prevention
- CORS origin validation
- Rate limiting ready

⚠️ **For Production:**
- Use HTTPS (Render provides free SSL)
- Keep secrets in environment variables
- Rotate JWT secrets periodically
- Monitor MongoDB Atlas for unauthorized access
- Enable 2FA for GitHub account
- Review security logs regularly
- Keep dependencies updated

---

> **Last Updated:** March 27, 2026 ·
---
