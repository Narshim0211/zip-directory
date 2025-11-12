# Time Service Quick Start Guide

## 🚀 Start Time Service Locally (5 minutes)

### Option 1: Docker Compose (Easiest)

```bash
cd time-service
docker-compose up
```

This starts:
- MongoDB on `localhost:27018`
- Time Service on `localhost:5001`

Check health:
```bash
curl http://localhost:5001/health
```

### Option 2: Manual Setup

**1. Start MongoDB locally**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or Docker
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:7.0
```

**2. Install dependencies**
```bash
cd time-service
npm install
```

**3. Create .env file**
```bash
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
```

**4. Start service**
```bash
npm run dev    # Development with hot-reload
# or
npm start      # Production
```

Service runs on `http://localhost:5001`

---

## 🧪 Test Visitor Endpoint

### 1. Get Auth Token

For testing, create a mock token:

```bash
# Visitor Token (example structure)
export VISITOR_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTAiLCJyb2xlIjoidmlzaXRvciIsImVtYWlsIjoidmlzaXRvckBzYWxvbmh1Yi5jb20ifQ.signature"
```

Or if using real auth service:
```bash
curl http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"visitor@salonhub.com","password":"password"}'
```

### 2. Create Visitor Task

```bash
curl -X POST http://localhost:5001/api/visitor/time/tasks \
  -H "Authorization: Bearer $VISITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning workout",
    "scope": "daily",
    "session": "Morning",
    "priority": "high",
    "dueDate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

### 3. Get All Tasks

```bash
curl http://localhost:5001/api/visitor/time/tasks \
  -H "Authorization: Bearer $VISITOR_TOKEN"
```

### 4. Get Daily Quote

```bash
curl http://localhost:5001/api/visitor/time/quote \
  -H "Authorization: Bearer $VISITOR_TOKEN"
```

---

## 🧪 Test Owner Endpoint

### 1. Get Auth Token (Owner)

```bash
# Owner Token
export OWNER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJyb2xlIjoib3duZXIiLCJlbWFpbCI6Im93bmVyQHNhbG9uaHViLmNvbSJ9.signature"
```

### 2. Create Owner Task with Team Assignment

```bash
curl -X POST http://localhost:5001/api/owner/time/tasks \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team morning standup",
    "scope": "daily",
    "priority": "high",
    "businessId": "507f1f77bcf86cd799439012",
    "assignedTo": "507f1f77bcf86cd799439013",
    "department": "Management",
    "estimatedHours": 0.5,
    "isTeamTask": true,
    "dueDate": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

### 3. Get Owner Analytics

```bash
curl "http://localhost:5001/api/owner/time/analytics?period=daily&businessId=507f1f77bcf86cd799439012" \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

---

## 🔔 Test Reminder System

### 1. Create Reminder for Next Minute

```bash
# Calculate time 2 minutes from now
REMINDER_TIME=$(node -e "console.log(new Date(Date.now() + 2*60000).toISOString())")

curl -X POST http://localhost:5001/api/visitor/time/reminders \
  -H "Authorization: Bearer $VISITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test reminder",
    "message": "This is a test reminder",
    "reminderType": "in-app",
    "scheduledTime": "'$REMINDER_TIME'",
    "frequency": "once",
    "recipient": "visitor@salonhub.com"
  }'
```

### 2. Watch Cron Job Process It

Check the logs as it's processed:

```bash
# Watch visitor reminders
tail -f logs/reminder-visitor.log

# In another terminal, wait 1 minute for cron job to run
```

You should see output like:
```
[2024-01-15T10:30:45.123Z] [Visitor Cron] ========== Starting visitor reminder processing ==========
[2024-01-15T10:30:45.234Z] [Visitor Cron] Found 1 visitor reminders to process
[2024-01-15T10:30:45.345Z] [Visitor Cron] Processing reminder 507f1f77bcf86cd799439011: "Test reminder"
[2024-01-15T10:30:45.456Z] [Visitor Cron] ✅ Successfully sent reminder 507f1f77bcf86cd799439011 (in-app)
```

---

## 📊 Monitor Service Health

### Health Check Endpoint

```bash
curl http://localhost:5001/health
```

Response:
```json
{
  "success": true,
  "message": "Time Service is running",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "development",
  "database": "connected"
}
```

### Check Logs

```bash
# Visitor reminder logs
tail -f logs/reminder-visitor.log

# Owner reminder logs
tail -f logs/reminder-owner.log

# Combined (development)
npm run dev | grep -E "Visitor|Owner|Error"
```

---

## 🛠️ Troubleshooting

### MongoDB Connection Error

```
❌ [Database] Connection failed: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: 
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Try Docker: `docker-compose up`

### Port Already in Use

```
❌ [Server] Port 5001 is already in use
```

**Solution**:
```bash
# Find process on port 5001
lsof -i :5001

# Kill it
kill -9 <PID>

# Or use different port
PORT=5002 npm start
```

### Invalid Token Error

```
❌ [AuthMiddleware] Token validation error: Unexpected token
```

**Solution**:
- Use proper JWT format with Bearer prefix
- Verify token hasn't expired
- Check JWT_SECRET in .env

### Reminders Not Processing

1. Check cron is running (should see startup message)
2. Check reminder status in database:
   ```bash
   db.visitorreminders.findOne({_id: ObjectId("...")})
   ```
3. Check logs:
   ```bash
   tail -f logs/reminder-visitor.log
   ```

---

## 📝 Common API Patterns

### Create Task

```bash
curl -X POST http://localhost:5001/api/visitor/time/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task name",
    "scope": "daily",
    "priority": "high",
    "dueDate": "2024-01-15T18:00:00Z"
  }'
```

### Update Task Status

```bash
curl -X PUT http://localhost:5001/api/visitor/time/tasks/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isCompleted": true
  }'
```

### Get Filtered Tasks

```bash
curl "http://localhost:5001/api/visitor/time/tasks?scope=daily&isCompleted=false" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Goal

```bash
curl -X POST http://localhost:5001/api/visitor/time/goals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Goal name",
    "scope": "weekly",
    "targetValue": 100,
    "unit": "minutes",
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2024-01-21T23:59:59Z"
  }'
```

### Create Reflection

```bash
curl -X POST http://localhost:5001/api/visitor/time/reflections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daily reflection",
    "content": "Today was productive...",
    "mood": "good",
    "energyLevel": 8,
    "keyHighlights": ["Completed project", "Team meeting"],
    "gratitudeItems": ["Team support", "Learning opportunity"]
  }'
```

---

## 📱 Next Steps

1. **Test All Endpoints**: Use curl or Postman to test each endpoint
2. **Frontend Integration**: Start Phase 5 when backend is stable
3. **Email Configuration**: Set up email service for reminders
4. **Load Testing**: Test with multiple concurrent users
5. **Production Deployment**: Use docker-compose or K8s

---

## 🆘 Need Help?

- Check README.md for full API documentation
- Check logs in `logs/reminder-*.log`
- Verify environment variables in .env
- Test health endpoint first
- Check MongoDB connection

---

**Happy coding! 🚀**
