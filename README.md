# Certificate Verification System

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
- [Token Management](#token-management)
- [Security](#security)
- [Email Verification](#email-verification)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
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

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js & Express | 5.2.1 | Server framework |
| MongoDB & Mongoose | 8.9.5 | Database & ODM |
| jsonwebtoken | latest | Token authentication |
| Clerk SDK | 4.13.23 | OAuth token verification |
| Nodemailer | latest | Email service (Gmail) |
| Handlebars | latest | Certificate template rendering |
| Multer | latest | File upload handling |

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
- Secure password handling

### Certificate Management
- Certificate generation with templates
- Certificate download (PDF/image format)
- Certificate search and filtering
- Bulk certificate management

### Security
- CORS protection
- Request validation
- Rate limiting ready
- Secure token storage
- Email verification for account security

---

## Prerequisites

- Node.js v14 or higher
- MongoDB (local or Atlas)
- Clerk account (for OAuth)
- Gmail account (for email service)

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
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Clerk OAuth
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
```

### Frontend — `Frontend/.env` or `Frontend/.env.local`

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
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
│   │   │   └── dataController.js         # Data logic
│   │   ├── middleware/
│   │   │   ├── authenticate.js           # JWT middleware
│   │   │   ├── authorize.js              # Role-based access
│   │   │   ├── requireJsonBody.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── User.js                   # User schema
│   │   │   └── Student.js                # Student data schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── certificateRoutes.js
│   │   │   └── dataRoutes.js
│   │   ├── templates/
│   │   │   └── certificate.hbs           # Certificate template
│   │   └── utils/
│   │       ├── certificateGenerator.js
│   │       ├── generateTokens.js
│   │       └── sendEmail.js
│   │   └── validators/
│   │       ├── authValidator.js
│   │       └── dataValidator.js
│   ├── scripts/
│   │   └── seedAdmin.js                  # Create admin user
│   ├── server.js                         # Entry point
│   ├── package.json
│   └── .env
│
└── Frontend/
    ├── src/
    │   ├── App.jsx                        # Root component
    │   ├── main.jsx
    │   ├── index.css
    │   ├── api/
    │   │   ├── auth.js                    # Auth API functions
    │   │   └── client.js                  # Axios client
    │   ├── auth/
    │   │   └── token.js                   # Token management
    │   ├── components/
    │   │   ├── ClerkAuthButtons.jsx       # OAuth buttons
    │   │   ├── ClerkAuthButtons.css
    │   │   └── PasswordField.jsx
    │   └── pages/
    │       ├── Auth.jsx
    │       ├── Auth.css
    │       ├── SignIn.jsx
    │       ├── SignUp.jsx
    │       ├── AuthLayout.jsx
    │       ├── VerifyEmail.jsx            # Email verification page
    │       ├── AuthCallback.jsx           # OAuth callback handler
    │       ├── Home.jsx
    │       └── Home.css
    ├── index.html
    ├── vite.config.js
    ├── eslint.config.js
    ├── package.json
    └── .env
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

Server runs at `http://localhost:5000`

**Terminal 2 — Frontend**

```bash
cd Frontend
npm run dev
```

App runs at `http://localhost:5173`

### Seed Admin User (Optional)

```bash
cd Backend
node scripts/seedAdmin.js
```

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

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in a user |
| POST | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/refresh-token` | Refresh JWT access token |
| POST | `/api/auth/clerk-token` | Exchange Clerk token for JWT |
| GET | `/api/auth/logout` | Log out the current user |

### Certificates

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/certificates` | Get all certificates |
| GET | `/api/certificates/:id` | Get a certificate by ID |
| POST | `/api/certificates/generate` | Generate a new certificate |
| GET | `/api/certificates/download/:id` | Download a certificate |
| DELETE | `/api/certificates/:id` | Delete a certificate |

### User Data

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/data` | Get user data |
| POST | `/api/data` | Create a data entry |
| PUT | `/api/data/:id` | Update a data entry |
| DELETE | `/api/data/:id` | Delete a data entry |

---

## Token Management

### JWT Structure

```js
// Access Token — expires in 15 minutes
{
  userId: "user_id",
  email: "user@example.com",
  role: "user"
}

// Refresh Token — expires in 7 days
// Stored in an HTTP-only cookie
// Used to request new access tokens
```

### Refresh Flow

1. Access token expires
2. Refresh token is used automatically to request a new access token
3. If refresh token is also expired → user is redirected to login

---

## Security

| Feature | Details |
|---|---|
| Password Hashing | Bcrypt for secure password storage |
| HTTPS Ready | All tokens sent via secure channels |
| HTTP-Only Cookies | Refresh tokens protected from XSS |
| CORS | Configured for specific origins only |
| Input Validation | All incoming requests are validated |
| Email Verification | Prevents unauthorized account creation |
| Rate Limiting | Infrastructure is ready to implement |

---

## Email Verification

1. User registers with an email address
2. A verification email is sent automatically
3. The email contains a unique, time-limited verification link
4. User clicks the link to verify their account
5. Token is validated and `isVerified` flag is set to `true`
6. User can now log in

**Token Details:**
- Generated using `crypto.randomBytes`
- Expires after 24 hours
- Unique per user, stored in the database

---

## Testing

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

**Token refresh**
1. Wait for the access token to expire (15 minutes)
2. Make any authenticated request
3. The token should refresh automatically and the request should succeed

---

## Troubleshooting

**Google / GitHub button not working**
- Open the browser console (F12) and check for errors
- Confirm `VITE_CLERK_PUBLISHABLE_KEY` is set correctly in `.env`
- Ensure Clerk is properly initialized
- Try a hard refresh with `Ctrl + Shift + R`

**MongoDB connection error**
- Verify that `MONGODB_URI` is correct
- Check your IP whitelist settings in MongoDB Atlas
- Confirm your network can reach Atlas

**Emails not sending**
- Make sure you are using a Gmail **App Password**, not your account password
- Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Confirm that your Gmail account allows third-party app access

**Token expired errors**
- If your refresh token has expired, log in again
- Check that your browser has the refresh token cookie set
- Verify that `JWT_REFRESH_SECRET` is correctly set in `.env`

---

> **Last Updated:** March 2026 · **Status:** Active Development