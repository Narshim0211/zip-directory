# Auth Service - SalonHub Authentication Microservice

## Overview

The Auth Service is a standalone microservice responsible for all authentication and authorization operations in the SalonHub platform.

## Features

- ✅ **JWT-based authentication** with access + refresh tokens
- ✅ **Role-Based Access Control (RBAC)** - Admin, Owner, Staff, Customer
- ✅ **Account security** - Failed login tracking, account locking
- ✅ **Password management** - Bcrypt hashing, password updates
- ✅ **Rate limiting** - 5 requests per 10 minutes on auth endpoints
- ✅ **Error isolation** - Service failures don't affect other microservices
- ✅ **Horizontal scalability** - Stateless design ready for clustering

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 5
- **Database**: MongoDB (dedicated auth DB)
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, bcryptjs
- **Rate Limiting**: express-rate-limit

## API Endpoints

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user (customer/owner/staff) |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/health` | Health check |

### Protected Routes (require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/me` | Get current user profile |
| POST | `/auth/logout` | Logout user |
| PUT | `/auth/password` | Update password |

## User Roles

- **admin**: Platform administrator (cannot self-register)
- **owner**: Salon/business owner
- **staff**: Employee/stylist (requires `ownerId`)
- **customer**: End user/visitor (default)

## Environment Variables

```bash
SERVICE_NAME=auth-service
PORT=5001
NODE_ENV=development

MONGO_URI=mongodb://...
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d

WEB_ORIGIN=http://localhost:3000
ADMIN_ORIGIN=http://localhost:3001

RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX_REQUESTS=5
```

## Installation

```bash
npm install
```

## Running the Service

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker
```bash
docker build -t salonhub-auth-service .
docker run -p 5001:5001 --env-file .env salonhub-auth-service
```

## Security Features

### Password Security
- Bcrypt hashing (cost factor 12)
- Password changed tracking
- Minimum 6 characters

### Account Protection
- Failed login tracking
- Account lock after 5 failed attempts (15 minutes)
- Active/inactive status

### Token Security
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Token invalidation on password change
- Refresh token rotation

### Rate Limiting
- Login: 5 attempts per 10 minutes
- Register: 5 attempts per 10 minutes

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_MISSING_TOKEN` | No authentication token provided |
| `AUTH_INVALID_TOKEN` | Token is invalid or expired |
| `AUTH_USER_NOT_FOUND` | User doesn't exist |
| `AUTH_ACCOUNT_INACTIVE` | Account is deactivated |
| `AUTH_ACCOUNT_LOCKED` | Account locked due to failed attempts |
| `AUTH_PASSWORD_CHANGED` | Password changed after token issued |
| `AUTH_INVALID_CREDENTIALS` | Wrong email/password |
| `AUTH_EMAIL_EXISTS` | Email already registered |
| `AUTH_INSUFFICIENT_PERMISSIONS` | User doesn't have required role |
| `AUTH_RATE_LIMIT_EXCEEDED` | Too many requests |

## Architecture Compliance

This service follows the PRD requirements:

- **Part 14.2**: Role-Based Access Control implementation
- **Part 14.6**: Secure JWT with httpOnly refresh tokens
- **Part 15.1**: Microservice scalability
- **Part 15.2.1**: Stateless backend for horizontal scaling
- **Part 16.2**: Enterprise folder structure
- **Part 16.3**: Service-based business logic separation
- **Part 13.3**: Error isolation with service-specific codes

## Testing

```bash
npm test
```

## Healthcheck

```bash
curl http://localhost:5001/health
```

## Integration with Other Services

Other microservices should use the authentication middleware from this service to validate JWT tokens and enforce role-based access control.

## License

MIT
