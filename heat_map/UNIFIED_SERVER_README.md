# Exhibition Management System - Unified API Server

## Overview
This unified server acts as an API middleware/gateway that consolidates all your backend services into a single accessible endpoint. This solves the localhost URL problem in email verification by providing a production-ready API structure.

## Architecture
```
Frontend (React) -> Unified Server (Port 8080) -> Backend Services
                                 |
                                 ├── Auth Service (Port 5004)
                                 ├── API Gateway (Port 5000)  
                                 ├── Events API (Port 3036)
                                 ├── Heatmap API (Port 3897)
                                 └── Maps API (Port 3001)
```

## Email Verification Fix
The main issue was that approval emails contained localhost URLs like `http://localhost:5004/auths/approve/123` which don't work outside the local machine.

**Solution:**
- Updated `authController.js` to use `BASE_URL` environment variable
- Email links now use: `http://localhost:8080/auth/approve/123` (or your production domain)
- Unified server proxies `/auth/*` requests to the auth service at `/auths/*`

## Setup Instructions

### 1. Install Dependencies
```bash
# For unified server
npm install express http-proxy-middleware

# Or using the provided package file
cp unified-package.json package.json
npm install
```

### 2. Configure Environment Variables
```bash
# Copy the example environment file
cp backend/Organizer_Dashboard-main/backend-new/services/auth-service/.env.example backend/Organizer_Dashboard-main/backend-new/services/auth-service/.env

# Edit the .env file and set:
BASE_URL=http://localhost:8080  # For development
# BASE_URL=https://your-domain.com  # For production
```

### 3. Start All Services
```bash
# Terminal 1 - Database (if needed)
# Start your PostgreSQL database

# Terminal 2 - Auth Service
cd backend/Organizer_Dashboard-main/backend-new/services/auth-service
npm start

# Terminal 3 - API Gateway
cd backend/Organizer_Dashboard-main/backend
npm start

# Terminal 4 - Events API
cd backend/events
npm start

# Terminal 5 - Heatmap API  
cd backend/heatmap/backend/exhibition-map-backend
npm start

# Terminal 6 - Maps API
cd backend/Maps/backend map
npm start

# Terminal 7 - Unified Server (Main)
node unified-server.js
```

### 4. Alternative - Use PM2 (Recommended)
```bash
npm install -g pm2

# Create ecosystem file (if not exists)
pm2 start ecosystem.config.js

# Or start individually
pm2 start unified-server.js --name "unified-server"
pm2 start "backend/Organizer_Dashboard-main/backend-new/services/auth-service/src/index.js" --name "auth-service"
# ... other services
```

## API Endpoints (Through Unified Server)

| Route | Target Service | Example |
|-------|----------------|---------|
| `/auth/*` | Auth Service | `POST /auth/register`, `GET /auth/approve/123` |
| `/api/*` | API Gateway | `GET /api/users`, `POST /api/events` |
| `/events-api/*` | Events API | `GET /events-api/list` |
| `/heatmap-api/*` | Heatmap API | `GET /heatmap-api/data` |
| `/maps-api/*` | Maps API | `GET /maps-api/locations` |
| `/admin-api/*` | Admin API | `GET /admin-api/dashboard` |

## Email Verification Flow
1. User registers -> `POST http://localhost:8080/auth/register`
2. Auth service sends approval email with link: `http://localhost:8080/auth/approve/{id}`
3. Admin clicks link -> Unified server proxies to auth service -> Account approved
4. Notification email sent to user

## Frontend Integration
Update your frontend API calls to use the unified server:

```javascript
// Before
const API_BASE = 'http://localhost:5004';

// After  
const API_BASE = 'http://localhost:8080/auth';

// Registration
fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
});
```

## Production Deployment
1. Set `BASE_URL` environment variable to your production domain
2. Update `CORS_ORIGIN` in auth service
3. Deploy unified server on your production server
4. Configure reverse proxy (nginx) if needed
5. Use HTTPS in production

## Health Check
Visit `http://localhost:8080/health` to verify all services are running.

## Troubleshooting
- **502 Errors**: Check if target services are running on correct ports
- **CORS Issues**: Verify `CORS_ORIGIN` settings in services
- **Email Links Not Working**: Check `BASE_URL` environment variable
- **Port Conflicts**: Update ports in unified-server.js if needed