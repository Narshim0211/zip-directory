# SalonHub Time Management Microservice

A comprehensive, enterprise-grade time management system for SalonHub with complete separation of Visitor and Owner modules, independent fault isolation, and scalable architecture.

## 🎯 Overview

This microservice manages time planning, task tracking, goal setting, reflection journaling, and reminder notifications for both visitor and owner users. It features:

- **Complete Data Isolation**: Separate collections for visitor and owner data
- **Independent Fault Isolation**: One role's failure doesn't affect the other
- **Separate API Routes**: `/api/visitor/time/*` and `/api/owner/time/*`
- **Role-Based Access Control**: JWT validation with per-role guards
- **Scalable Architecture**: Designed for 10k+ concurrent users
- **Comprehensive Reminder System**: Email, SMS, in-app, push, and Slack notifications
- **Analytics & Insights**: Daily, weekly, and monthly metrics
- **Team Collaboration**: Owner-specific task assignment and performance tracking

## 📁 Project Structure

```
time-service/
├── app.js                          # Main Express application
├── package.json                    # Dependencies and scripts
├── .env.example                    # Environment template
├── Dockerfile                      # Docker configuration
├── README.md                       # This file
│
├── src/
│   ├── models/
│   │   ├── visitor/
│   │   │   ├── VisitorTask.js         # Daily/weekly/monthly tasks
│   │   │   ├── VisitorGoal.js         # Goal tracking
│   │   │   ├── VisitorReminder.js     # Reminder scheduling
│   │   │   └── VisitorReflection.js   # Daily reflections
│   │   ├── owner/
│   │   │   ├── OwnerTask.js           # Business tasks with team support
│   │   │   ├── OwnerGoal.js           # Business goals with KPIs
│   │   │   ├── OwnerReminder.js       # Business reminders with team notifications
│   │   │   └── OwnerReflection.js     # Business performance reflections
│   │   └── shared/
│   │       └── Quote.js               # Shared daily quotes
│   │
│   ├── controllers/
│   │   ├── visitorTimeController.js   # Visitor endpoints logic
│   │   └── ownerTimeController.js     # Owner endpoints logic
│   │
│   ├── services/
│   │   ├── visitor/
│   │   │   └── visitorTimeService.js  # Visitor CRUD operations
│   │   ├── owner/
│   │   │   └── ownerTimeService.js    # Owner CRUD operations
│   │   └── shared/
│   │       ├── quoteService.js        # Quote management
│   │       ├── analyticsService.js    # Metrics and insights
│   │       └── reminderService.js     # Reminder delivery (email, SMS, etc)
│   │
│   ├── routes/
│   │   ├── visitor/
│   │   │   └── timeRoutes.js          # Visitor API endpoints
│   │   └── owner/
│   │       └── timeRoutes.js          # Owner API endpoints
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT validation
│   │   ├── authVisitor.js             # Visitor role guard
│   │   ├── authOwner.js               # Owner role guard
│   │   ├── errorHandler.js            # Global error handling
│   │   ├── rateLimiter.js             # Per-user rate limiting
│   │   └── asyncHandler.js            # Async error wrapper
│   │
│   └── cron/
│       └── reminderCron.js            # Reminder processing (independent per role)
│
└── logs/
    ├── reminder-visitor.log           # Visitor reminder logs
    └── reminder-owner.log             # Owner reminder logs
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Installation

1. **Clone and install dependencies:**

```bash
cd time-service
npm install
```

2. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set environment variables:**

```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/time-service-db
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

4. **Start the service:**

```bash
npm start          # Production
npm run dev        # Development with nodemon
```

### Docker Deployment

```bash
# Build image
docker build -t salonhub-time-service .

# Run container
docker run -p 5001:5001 \
  -e MONGODB_URI=mongodb://mongo:27017/time-service-db \
  -e NODE_ENV=production \
  salonhub-time-service
```

## 📚 API Reference

### Health Check

```
GET /health
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

### Visitor Endpoints

Base: `/api/visitor/time`

#### Tasks
- `GET    /tasks` - List visitor tasks with filters
- `POST   /tasks` - Create new task
- `GET    /tasks/:taskId` - Get single task
- `PUT    /tasks/:taskId` - Update task
- `DELETE /tasks/:taskId` - Delete task

#### Goals
- `GET    /goals` - List visitor goals
- `POST   /goals` - Create new goal
- `GET    /goals/:goalId` - Get single goal
- `PUT    /goals/:goalId` - Update goal

#### Reminders
- `GET    /reminders` - List reminders
- `POST   /reminders` - Create reminder

#### Reflections
- `GET    /reflections` - List reflections
- `POST   /reflections` - Create reflection
- `GET    /reflections/:reflectionId` - Get single reflection

#### Utility
- `GET    /analytics?period=daily` - Get analytics
- `GET    /quote` - Get random daily quote

### Owner Endpoints

Base: `/api/owner/time`

#### Tasks (with team support)
- `GET    /tasks` - List owner tasks
- `POST   /tasks` - Create task (with team assignment)
- `GET    /tasks/:taskId` - Get single task
- `PUT    /tasks/:taskId` - Update task
- `PUT    /tasks/:taskId/status` - Update task status
- `DELETE /tasks/:taskId` - Delete task

#### Goals (with KPI tracking)
- `GET    /goals` - List business goals
- `POST   /goals` - Create goal (with team members)
- `GET    /goals/:goalId` - Get single goal
- `PUT    /goals/:goalId` - Update goal

#### Reminders (with team notifications)
- `GET    /reminders` - List reminders
- `POST   /reminders` - Create reminder (with team notify option)

#### Reflections (with business metrics)
- `GET    /reflections` - List reflections
- `POST   /reflections` - Create reflection (with business metrics)
- `GET    /reflections/:reflectionId` - Get single reflection

#### Team Analytics
- `GET    /team-performance?businessId=...` - Team performance metrics
- `GET    /department-stats?businessId=...&department=...` - Department statistics
- `GET    /analytics?period=daily&businessId=...` - Business analytics
- `GET    /quote` - Get random daily quote

## 🔐 Authentication

All endpoints require JWT token in `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Token validation:
- Extracts `userId`, `role` (visitor/owner), `email`
- Validates expiry
- Guards per-role endpoints (visitor routes reject owner users, etc)

## 📊 Data Models

### Visitor Models

**VisitorTask**
```javascript
{
  userId,              // Required
  title,               // Required
  description,
  scope,               // daily/weekly/monthly
  session,             // Morning/Afternoon/Evening
  isCompleted,
  completedAt,
  reminderEnabled,
  reminderType,        // email/sms/in-app
  reminderTime,
  priority,            // low/medium/high
  category,
  tags,
  dueDate
}
```

**VisitorGoal**
```javascript
{
  userId,              // Required
  title,               // Required
  scope,               // daily/weekly/monthly
  targetValue,
  currentProgress,
  unit,                // count/hours/etc
  category,
  status,              // active/completed/paused/failed
  startDate,
  endDate,
  priority,            // low/medium/high
  tags,
  completedAt
}
```

**VisitorReminder**
```javascript
{
  userId,              // Required
  taskId,              // Optional reference
  title,
  message,
  reminderType,        // email/sms/in-app/push
  scheduledTime,       // Required
  sendTime,
  isSent,
  frequency,           // once/daily/weekly/monthly
  isActive,
  recipient,
  status,              // pending/sent/failed/cancelled
  errorMessage
}
```

**VisitorReflection**
```javascript
{
  userId,              // Required
  date,                // Required
  title,
  content,             // Required
  mood,                // excellent/good/neutral/bad/terrible
  energyLevel,         // 1-10
  tasksCompleted,
  goalsAchieved,
  keyHighlights,
  areasForImprovement,
  gratitudeItems,
  tags,
  isPublic
}
```

### Owner Models

Extend Visitor models with:

**OwnerTask** (extends VisitorTask)
```javascript
{
  businessId,          // Reference to business
  assignedTo,          // User reference
  department,
  estimatedHours,
  actualHours,
  isTeamTask,
  status               // todo/in-progress/pending-review/completed/blocked
}
```

**OwnerGoal** (extends VisitorGoal)
```javascript
{
  businessId,
  teamGoal,
  assignedTeamMembers, // Array of user references
  department,
  kpiMetric,
  visibility           // private/team/public
}
```

**OwnerReminder** (extends VisitorReminder)
```javascript
{
  businessId,
  notifyTeam,
  teamMembers,         // Array of user references
  department,
  priority,            // low/medium/high/urgent
  relatedGoalId,
  escalationLevel
}
```

**OwnerReflection** (extends VisitorReflection)
```javascript
{
  businessId,
  businessPerformance, // 1-10
  teamMood,            // excellent/good/neutral/bad/terrible
  revenueNotes,
  customerFeedback,
  staffInsights,
  operationalChallenges,
  successMetrics: {
    customersServed,
    appointmentsCompleted,
    revenueGenerated,
    reviewsReceived
  },
  visibility,          // private/team/public
  isWeeklyReview,
  isMonthlyReview
}
```

## 🔔 Reminder System

### Features

- **Multiple Channels**: Email, SMS, in-app, push notifications, Slack
- **Scheduling**: One-time or recurring (daily/weekly/monthly)
- **Fault Isolation**: Visitor reminders fail independently from owner reminders
- **Separate Logging**: Dedicated log files per role
- **Error Recovery**: Failed reminders tracked with error messages

### Cron Job Details

**Visitor Reminders Cron**
- Runs every minute
- Processes pending reminders within 5-minute window
- Logs to `/logs/reminder-visitor.log`
- Independent try/catch prevents owner cron failures

**Owner Reminders Cron**
- Runs every minute (30-second offset)
- Supports team member notifications
- Logs to `/logs/reminder-owner.log`
- Independent try/catch prevents visitor cron failures

### Example Reminder

```javascript
// Create visitor reminder
POST /api/visitor/time/reminders
{
  "taskId": "507f1f77bcf86cd799439011",
  "title": "Complete daily tasks",
  "reminderType": "email",
  "scheduledTime": "2024-01-15T09:00:00Z",
  "frequency": "daily",
  "message": "Don't forget to complete your daily tasks!"
}

// Create owner reminder with team notification
POST /api/owner/time/reminders
{
  "taskId": "507f1f77bcf86cd799439011",
  "title": "Team standup meeting",
  "reminderType": "slack",
  "scheduledTime": "2024-01-15T10:00:00Z",
  "businessId": "507f1f77bcf86cd799439012",
  "notifyTeam": true,
  "teamMembers": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
  "priority": "high"
}
```

## 📈 Analytics

Both visitor and owner endpoints provide insights:

```javascript
// Visitor analytics
GET /api/visitor/time/analytics?period=daily

Response:
{
  "period": "daily",
  "tasks": {
    "total": 15,
    "completed": 12,
    "completionRate": 80,
    "active": 3
  },
  "goals": {
    "total": 5,
    "active": 4,
    "completed": 1,
    "completionRate": 20
  },
  "insights": [
    "🎉 Excellent task completion rate! Keep up the momentum!"
  ]
}

// Owner analytics
GET /api/owner/time/analytics?period=weekly&businessId=507f1f77bcf86cd799439012

Response:
{
  "period": "weekly",
  "tasks": {
    "total": 45,
    "completed": 38,
    "inProgress": 5,
    "blocked": 2,
    "completionRate": 84
  },
  "team": {
    "totalTeamTasks": 30,
    "memberPerformance": {...}
  },
  "insights": [
    "🚀 Excellent business performance! Tasks are flowing smoothly."
  ]
}
```

## 🛡️ Error Handling

Global error handler catches all errors:

- **Validation Errors** (400)
- **Authentication Errors** (401)
- **Authorization Errors** (403)
- **Rate Limit Exceeded** (429)
- **Not Found** (404)
- **Server Errors** (500)

All errors logged with request context (role, userId, endpoint).

## ⚙️ Configuration

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/time-service-db

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Auth Service
AUTH_SERVICE_URL=http://localhost:5000
JWT_SECRET=your_jwt_secret

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@salonhub.com
EMAIL_PASSWORD=your_app_password

# SMS Service (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Logging
LOG_LEVEL=debug
LOG_DIR=./logs

# Feature Flags
ENABLE_VISITOR_REMINDERS=true
ENABLE_OWNER_REMINDERS=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
```

## 📝 Logging

### Log Files

**Reminder Logs**
- `/logs/reminder-visitor.log` - All visitor reminder processing
- `/logs/reminder-owner.log` - All owner reminder processing

**Console Logs**
- Development: `morgan` middleware with 'dev' format
- Production: 'combined' format
- Health check endpoint excluded

### Log Format

```
[2024-01-15T10:30:45.123Z] [role:userId] endpoint: message
```

## 🧪 Testing

### Test Reminder Processing

```bash
# Create a reminder with scheduledTime in next 5 minutes
curl -X POST http://localhost:5001/api/visitor/time/reminders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test reminder",
    "reminderType": "in-app",
    "scheduledTime": "2024-01-15T10:35:00Z"
  }'

# Wait 1 minute for cron job to process
# Check logs/reminder-visitor.log for processing result
```

### Health Check

```bash
curl http://localhost:5001/health
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure real MongoDB (Atlas, self-hosted)
- [ ] Set up email service credentials
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and alerting
- [ ] Review and test reminder delivery
- [ ] Set up log rotation
- [ ] Enable database backups
- [ ] Configure Rate Limiting to production values

### Monitoring

Monitor the following health indicators:

- **Reminder Success Rate**: Check logs for success/failure counts
- **Database Connection**: `/health` endpoint
- **API Response Times**: Request logging
- **Queue Depth**: Count pending reminders
- **Error Rates**: Global error handler metrics

## 📞 Support & Troubleshooting

### Common Issues

**Reminders not sending**
- Check `/logs/reminder-visitor.log` or `/logs/reminder-owner.log`
- Verify `ENABLE_*_REMINDERS` flags are `true`
- Check email service credentials
- Verify MongoDB connection

**Rate limit exceeded**
- Check rate limit headers in response
- Configure `RATE_LIMITS` in `rateLimiter.js`
- Adjust based on role (visitor vs owner)

**Database connection errors**
- Verify `MONGODB_URI` is correct
- Check MongoDB is running
- Verify credentials if using Atlas

## 📄 License

MIT

## 👥 Contributors

SalonHub Team

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: Production Ready
