# OmniBlox Authentication Setup

## Overview

This document explains the authentication system implementation for OmniBlox.

## Backend Setup

### 1. Database Configuration

Make sure you have a `.env` file in `apps/server/` with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/omniblox?schema=public"
SHADOW_DATABASE_URL="postgresql://user:password@localhost:5432/omniblox_shadow?schema=public"
JWT_SECRET="your-secret-jwt-key-change-this"
PORT=5000
```

### 2. Run Database Migrations

```powershell
cd apps\server
npx prisma migrate dev --name add_auth_fields
```

This will create the database tables with the updated User model including:

- `password` (hashed)
- `name` (full name)
- `companyName`
- `workspaceUrl` (unique)
- `industry`
- `otherIndustry`
- `country`

### 3. Start the Backend Server

```powershell
cd apps\server
npm run start:dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### POST `/auth/signup`

Create a new user account and workspace.

**Request Body:**

```json
{
  "email": "user@company.com",
  "password": "securepassword",
  "name": "John Doe",
  "companyName": "My Company",
  "workspaceUrl": "my-company",
  "industry": "retail",
  "otherIndustry": "Custom Industry (if industry is 'other')",
  "country": "us"
}
```

**Response:**

```json
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@company.com",
    "name": "John Doe",
    "role": "ADMIN",
    "companyName": "My Company",
    "workspaceUrl": "my-company"
  }
}
```

### POST `/auth/login`

Authenticate an existing user.

**Request Body:**

```json
{
  "email": "user@company.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@company.com",
    "name": "John Doe",
    "role": "ADMIN",
    "companyName": "My Company",
    "workspaceUrl": "my-company"
  }
}
```

### GET `/auth/me`

Get current user profile (requires authentication).

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@company.com",
  "name": "John Doe",
  "role": "ADMIN",
  "companyName": "My Company",
  "workspaceUrl": "my-company"
}
```

## Frontend Setup

### 1. Start the Frontend Server

```powershell
cd apps\client
npm run dev
```

The client will run on `http://localhost:3000`

### 2. Authentication Flow

#### Signup

1. Navigate to `/signup`
2. Fill in all required fields
3. On successful signup:
   - JWT token stored in `localStorage` as `omniblox_token`
   - User data stored in `localStorage` as `omniblox_user`
   - Redirected to `/dashboard`

#### Login

1. Navigate to `/login`
2. Enter email and password
3. On successful login:
   - JWT token stored in `localStorage` as `omniblox_token`
   - User data stored in `localStorage` as `omniblox_user`
   - Redirected to `/dashboard`

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Tokens**: Tokens expire after 7 days
3. **Validation**: Input validation using class-validator
4. **CORS**: Configured to allow requests from `http://localhost:3000`
5. **Unique Constraints**: Email and workspaceUrl must be unique

## Database Schema Changes

The User model now includes:

```prisma
model User {
  id               String    @id @default(uuid())
  email            String    @unique
  password         String    // Hashed password
  name             String    // Full name from signup
  firstName        String?
  lastName         String?
  role             UserRole  @default(STAFF)

  // Business Details
  companyName      String?
  workspaceUrl     String?   @unique
  industry         String?
  otherIndustry    String?
  country          String?

  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relations...
}
```

## Testing

### Test Signup

```powershell
# Using curl or a tool like Postman/Insomnia
curl -X POST http://localhost:5000/auth/signup `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "companyName": "Test Company",
    "workspaceUrl": "test-company",
    "industry": "technology",
    "country": "us"
  }'
```

### Test Login

```powershell
curl -X POST http://localhost:5000/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Check that the database exists

### CORS Errors

- Make sure the backend is running on port 5000
- Check that CORS is configured for `http://localhost:3000`

### JWT Token Issues

- Verify JWT_SECRET is set in `.env`
- Check token expiration (default 7 days)
- Ensure Authorization header format: `Bearer <token>`
