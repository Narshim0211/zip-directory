# Time Manager - Setup Guide for Scalable Development

**Goal:** Set up local development environment that mirrors production architecture

---

## 🚀 Quick Start (5 minutes)

### Prerequisites Check

```bash
# Check if you have these installed
node --version    # Should be v18+ or v20+
npm --version     # Should be v9+
docker --version  # We'll install if you don't have it
```

---

## 📦 Installing Docker Desktop (Windows)

### Option 1: Using Chocolatey (Recommended - easiest)

```powershell
# Open PowerShell as Administrator
# Install Chocolatey if you don't have it
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Docker Desktop
choco install docker-desktop -y

# Restart your computer
```

### Option 2: Manual Download

1. Go to: https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Windows
3. Run installer
4. Restart computer
5. Open Docker Desktop (it will start automatically)

### Verify Docker Installation

```bash
docker --version
docker-compose --version
```

---

## 🔧 Project Setup

### 1. Install Redis Locally (Without Docker - For Learning)

```bash
# Option A: Using Chocolatey (easiest)
choco install redis-64 -y

# Option B: Using WSL2 (Windows Subsystem for Linux)
wsl --install
# After restart:
wsl
sudo apt update
sudo apt install redis-server -y
redis-server --daemonize yes
```

### 2. Or Use Docker for Redis (Recommended)

Create this file: `docker-compose.dev.yml`

```yaml
version: '3.8'

services:
  # Redis - For caching
  redis:
    image: redis:7-alpine
    container_name: salonhub-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # MongoDB - Your existing database (optional - use if not already running)
  # mongo:
  #   image: mongo:6
  #   container_name: salonhub-mongo
  #   ports:
  #     - "27017:27017"
  #   volumes:
  #     - mongo-data:/data/db
  #   environment:
  #     MONGO_INITDB_DATABASE: salonhub

volumes:
  redis-data:
  # mongo-data:
```

**Start Redis with one command:**
```bash
docker-compose -f docker-compose.dev.yml up -d redis
```

**Stop Redis:**
```bash
docker-compose -f docker-compose.dev.yml down
```

**Check if Redis is running:**
```bash
docker ps
# You should see redis container running
```

---

## 🧪 Testing Your Setup

### Test Redis Connection

Create `test-redis.js`:

```javascript
const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',
  port: 6379
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully!');

  // Test set/get
  redis.set('test-key', 'Hello from Redis!', (err) => {
    if (err) {
      console.error('❌ Error setting key:', err);
      return;
    }

    redis.get('test-key', (err, result) => {
      if (err) {
        console.error('❌ Error getting key:', err);
        return;
      }
      console.log('✅ Retrieved from Redis:', result);
      redis.disconnect();
    });
  });
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});
```

Run it:
```bash
npm install ioredis
node test-redis.js
```

---

## 📁 Project Structure Setup

```bash
cd c:\Users\narsh\Desktop\Directory-SalonHub\main-site\zip-directory

# Create time-service structure
mkdir -p time-service/src/{api/v1/{visitor,owner},domain/{task,reminder},infrastructure/{database,cache,queue},shared,workers,config}

# Install dependencies for time-service
cd time-service
npm init -y

# Core dependencies
npm install express mongoose ioredis bull dotenv winston
npm install joi express-rate-limit helmet cors

# Development dependencies
npm install -D nodemon jest supertest
```

---

## 🔐 Environment Variables Setup

Create `time-service/.env`:

```env
# Server
NODE_ENV=development
PORT=5500
SERVICE_NAME=time-service

# MongoDB
MONGODB_URI=mongodb://localhost:27017/salonhub
MONGODB_DB_NAME=salonhub

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Cache Settings
CACHE_TTL_DAILY=300
CACHE_TTL_WEEKLY=600
CACHE_TTL_MONTHLY=900

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60

# External Services
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_token_here
TWILIO_PHONE_NUMBER=your_twilio_number_here

SENDGRID_API_KEY=your_sendgrid_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# JWT (for auth verification)
JWT_SECRET=your_jwt_secret_from_main_backend

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs

# Worker Settings
REMINDER_WORKER_CONCURRENCY=5
REMINDER_CRON_SCHEDULE=*/1 * * * *
```

Create `time-service/.env.example` (without secrets):
```env
NODE_ENV=development
PORT=5500
MONGODB_URI=mongodb://localhost:27017/salonhub
REDIS_HOST=localhost
REDIS_PORT=6379
# ... (copy structure, remove values)
```

---

## 🎯 Docker Compose Learning Path

### Level 1: Just Redis (You are here)

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

**Commands to learn:**
```bash
docker-compose up -d          # Start in background
docker-compose ps             # Check status
docker-compose logs redis     # View logs
docker-compose down           # Stop and remove
docker-compose restart redis  # Restart service
```

### Level 2: Redis + MongoDB

```yaml
version: '3.8'
services:
  redis:
    # ... (same as above)

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  redis-data:
  mongo-data:
```

### Level 3: Full Stack (Later)

```yaml
version: '3.8'
services:
  redis:
    # ...
  mongo:
    # ...
  time-service:
    build: ./time-service
    ports:
      - "5500:5500"
    depends_on:
      - redis
      - mongo
    environment:
      - MONGODB_URI=mongodb://mongo:27017/salonhub
      - REDIS_HOST=redis
```

---

## 📊 Understanding Your Architecture

```
Your Computer
├── Main Backend (Port 5000)
│   └── Proxies to time-service
│
├── Time Service (Port 5500) ← We're building this
│   ├── Connects to MongoDB
│   ├── Connects to Redis (for caching)
│   └── Connects to Queue (for reminders)
│
├── MongoDB (Port 27017)
│   └── Stores all data
│
├── Redis (Port 6379) ← New addition
│   └── Caches frequent queries
│
└── Frontend (Port 3000)
    └── Calls main backend → routes to time-service
```

---

## ✅ Verification Checklist

Before starting Phase 1 implementation:

- [ ] Node.js v18+ installed
- [ ] Docker Desktop installed and running
- [ ] Redis running (via Docker or native)
- [ ] Can connect to Redis (test script passes)
- [ ] MongoDB running and accessible
- [ ] time-service folder structure created
- [ ] Dependencies installed
- [ ] .env file configured
- [ ] Twilio credentials ready
- [ ] SendGrid API key ready

---

## 🆘 Troubleshooting

### Redis won't start
```bash
# Check if port 6379 is in use
netstat -ano | findstr :6379

# Kill process if needed
taskkill /PID <process_id> /F

# Restart Docker Desktop
```

### Docker commands not working
```bash
# Restart Docker Desktop
# Check Docker is running: open Docker Desktop app
# Try running as Administrator
```

### Can't connect to Redis from Node
```javascript
// Check firewall isn't blocking
// Try 127.0.0.1 instead of localhost
const redis = new Redis({
  host: '127.0.0.1',
  port: 6379
});
```

---

## 📚 Resources

- [Docker Desktop Docs](https://docs.docker.com/desktop/windows/install/)
- [Redis Quick Start](https://redis.io/docs/getting-started/)
- [Docker Compose Tutorial](https://docs.docker.com/compose/gettingstarted/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🎓 Learning Docker Compose (5-minute lessons)

### Lesson 1: What is Docker?
Docker runs applications in "containers" - isolated environments that include everything needed to run your app.

**Think of it like:**
- Container = A complete mini-computer with just Redis (or MongoDB, or Node.js)
- No installation mess on your actual computer
- Easy to start/stop/delete

### Lesson 2: What is Docker Compose?
Docker Compose lets you run multiple containers together with one command.

**Example:**
Instead of:
```bash
docker run redis
docker run mongo
docker run your-app
```

You do:
```bash
docker-compose up
```

### Lesson 3: Reading docker-compose.yml

```yaml
services:           # List of containers to run
  redis:           # Name of this container
    image:         # What software to run
    ports:         # Make it accessible on your computer
    volumes:       # Save data even when container stops
```

---

**Next Steps:**
1. Install Docker Desktop
2. Start Redis with Docker Compose
3. Run test script to verify
4. Tell me when ready, and we'll start Phase 1 implementation!

---

*Remember: Big companies use Docker because it makes deployment consistent and scalable. You're learning production-grade tools!*
