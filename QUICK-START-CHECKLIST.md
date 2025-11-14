# Quick Start Checklist - Time Manager Setup

**Time to complete:** 15-20 minutes
**Goal:** Get Redis running and verify everything is ready for Phase 1

---

## ☑️ Step-by-Step Checklist

### 1. Install Docker Desktop (10 minutes)

- [ ] Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
- [ ] Run installer
- [ ] Restart computer
- [ ] Open Docker Desktop application
- [ ] Wait for Docker to fully start (whale icon in system tray should be green)
- [ ] Verify installation:

```bash
docker --version
docker-compose --version
```

**Expected output:**
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

### 2. Start Redis (2 minutes)

Open Terminal/PowerShell in the project directory:

```bash
cd c:\Users\narsh\Desktop\Directory-SalonHub\main-site\zip-directory

# Start Redis
docker-compose -f docker-compose.dev.yml up -d

# Check if running
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE              PORTS                    NAMES
xxxxx          redis:7-alpine     0.0.0.0:6379->6379/tcp   salonhub-redis-dev
xxxxx          rediscommander...  0.0.0.0:8081->8081/tcp   salonhub-redis-ui
```

---

### 3. Install ioredis for Testing (1 minute)

```bash
npm install ioredis
```

---

### 4. Test Redis Connection (1 minute)

```bash
node test-redis.js
```

**Expected output:**
```
✅ Redis connection established!

📝 Running Redis Tests...

Test 1: String Operations
   ✓ SET/GET: "Hello from Redis!"
...
✅ All tests passed! Redis is ready for Time Manager.
```

---

### 5. View Redis Web UI (Optional - Cool!)

- [ ] Open browser: http://localhost:8081
- [ ] You should see Redis Commander interface
- [ ] This lets you see cached data visually (helpful for learning)

---

### 6. Configure API Keys (5 minutes)

#### Twilio Setup:
1. [ ] Go to: https://console.twilio.com/
2. [ ] Copy your Account SID
3. [ ] Copy your Auth Token
4. [ ] Get your Twilio phone number

#### SendGrid Setup:
1. [ ] Go to: https://app.sendgrid.com/settings/api_keys
2. [ ] Create new API key
3. [ ] Copy the key (you only see it once!)

#### Save to Environment File:

Create `time-service/.env` (if it doesn't exist):

```env
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

---

## ✅ Verification

### All systems ready?

- [ ] Docker Desktop installed and running
- [ ] Redis container running (`docker ps` shows it)
- [ ] Test script passes (node test-redis.js)
- [ ] Redis Commander accessible at localhost:8081
- [ ] Twilio credentials saved in .env
- [ ] SendGrid API key saved in .env
- [ ] MongoDB running (your existing setup)

---

## 🎯 You're Ready!

If all checkboxes above are checked, you're ready for Phase 1 implementation!

**What happens next:**

1. I'll build the time-service with enterprise patterns
2. You'll see how caching works in real-time (via Redis Commander UI)
3. Code will be production-ready from day one
4. When you hit 1M users, you'll just add more servers - code stays the same!

---

## 🆘 Troubleshooting

### Docker Desktop won't start
```
1. Restart computer
2. Run Docker Desktop as Administrator
3. Check Windows features: Hyper-V and Containers must be enabled
```

### Redis container won't start
```bash
# Check if port 6379 is in use
netstat -ano | findstr :6379

# If something is using it, kill it:
taskkill /PID <process_id> /F

# Then restart Redis:
docker-compose -f docker-compose.dev.yml restart redis
```

### Test script fails
```
Error: "ECONNREFUSED 127.0.0.1:6379"

Solution:
1. Check Docker Desktop is running
2. Check Redis container is running: docker ps
3. Restart Redis: docker-compose -f docker-compose.dev.yml restart redis
```

---

## 📚 Docker Commands Cheat Sheet

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down

# View running containers
docker ps

# View logs
docker-compose -f docker-compose.dev.yml logs redis
docker-compose -f docker-compose.dev.yml logs -f redis  # Follow logs

# Restart a service
docker-compose -f docker-compose.dev.yml restart redis

# Remove everything (clean slate)
docker-compose -f docker-compose.dev.yml down -v

# Check Redis CLI directly
docker exec -it salonhub-redis-dev redis-cli
# Then type: PING (should respond PONG)
# Type: exit (to quit)
```

---

## 🎓 What You're Learning

**Docker Concepts:**
- **Container**: Isolated environment running one service (like Redis)
- **Image**: Blueprint for a container (redis:7-alpine)
- **Volume**: Persistent storage that survives container restarts
- **Compose**: Tool to manage multiple containers together

**Why This Matters:**
- Same setup works on your computer, staging server, and production
- No "works on my machine" problems
- Easy to scale: start 10 Redis containers instead of 1
- Your resume: "Built scalable microservices with Docker" 🚀

---

**Ready to start? Let me know when all checkboxes are checked!**
