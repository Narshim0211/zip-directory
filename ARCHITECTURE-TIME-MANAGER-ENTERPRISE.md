# Time Manager - Enterprise Architecture Design

**Version:** 1.0
**Date:** January 14, 2025
**Status:** Design Phase

---

## 🎯 Executive Summary

This document outlines the enterprise-grade architecture for the Time Manager system, designed to handle millions of users with high availability, scalability, and maintainability.

---

## 📐 System Architecture

### **1. Microservices Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                     API Gateway (Backend)                │
│                    Port 5000 (Main Backend)              │
│  - Authentication                                        │
│  - Rate Limiting                                         │
│  - Request Routing                                       │
│  - Response Aggregation                                  │
└────────────┬────────────────────────────────────────────┘
             │
             ├──────────────────────────────────────────────┐
             │                                              │
┌────────────▼────────────┐              ┌─────────────────▼──────────┐
│   Time Service          │              │   Other Services           │
│   Port 5500             │              │   - Feed Service           │
│                         │              │   - Notification Service   │
│  ┌──────────────────┐   │              │   - User Service           │
│  │ API Layer        │   │              └────────────────────────────┘
│  │ - Visitor Routes │   │
│  │ - Owner Routes   │   │
│  └────────┬─────────┘   │
│           │             │
│  ┌────────▼─────────┐   │
│  │ Business Layer   │   │
│  │ - TaskService    │   │
│  │ - ReminderService│   │
│  │ - ValidationSvc  │   │
│  └────────┬─────────┘   │
│           │             │
│  ┌────────▼─────────┐   │
│  │ Data Layer       │   │
│  │ - Repositories   │   │
│  │ - MongoDB Models │   │
│  └────────┬─────────┘   │
│           │             │
└───────────┼─────────────┘
            │
┌───────────▼─────────────────────────────────────────────┐
│                    Data Storage                          │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   MongoDB     │  │    Redis     │  │  Event Queue │ │
│  │  (Primary DB) │  │   (Cache)    │  │  (Bull/RabbitMQ)│ │
│  └───────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Design

### **Collections Schema**

#### **visitor_time_tasks**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed),

  // Task metadata
  title: String (required, max 200),
  notes: String (max 1000),

  // Temporal data
  taskDate: Date (indexed, UTC midnight),
  session: Enum['morning', 'afternoon', 'evening'] (indexed),
  timeOfDay: String, // "HH:MM" format
  durationMin: Number,

  // Classification
  priority: Enum['low', 'medium', 'high'],
  scopeTag: Enum['daily', 'weekly', 'monthly'],
  category: String,
  tags: [String],

  // Status
  completed: Boolean (indexed),
  completedAt: Date,

  // Reminder (embedded document)
  reminder: {
    enabled: Boolean,
    channels: [Enum['sms', 'email']],
    sendAt: Date (indexed),
    phone: String,
    email: String,
    sentAt: Date,
    status: Enum['pending', 'sent', 'failed'],
    attempts: Number,
    lastError: String
  },

  // Audit
  createdAt: Date,
  updatedAt: Date,
  version: Number // For optimistic locking
}
```

#### **Indexes Strategy**

```javascript
// Primary access patterns
db.visitor_time_tasks.createIndex({ userId: 1, taskDate: 1 })
db.visitor_time_tasks.createIndex({ userId: 1, taskDate: 1, session: 1 })
db.visitor_time_tasks.createIndex({ userId: 1, completed: 1, taskDate: 1 })

// Reminder processing
db.visitor_time_tasks.createIndex({
  "reminder.enabled": 1,
  "reminder.sendAt": 1,
  "reminder.sentAt": 1
})

// Date range queries (for weekly/monthly)
db.visitor_time_tasks.createIndex({ userId: 1, taskDate: 1, scopeTag: 1 })

// Performance optimization
db.visitor_time_tasks.createIndex({ createdAt: -1 }) // For pagination
```

#### **Sharding Strategy** (For scale)
```javascript
// Shard key: userId (ensures user data stays together)
sh.shardCollection("salonhub.visitor_time_tasks", { userId: 1, taskDate: 1 })
```

---

## 🏗️ Service Layer Architecture

### **Time Service Structure**

```
time-service/
├── src/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── visitor/
│   │   │   │   ├── routes/
│   │   │   │   │   └── task.routes.js
│   │   │   │   ├── controllers/
│   │   │   │   │   └── task.controller.js
│   │   │   │   └── validators/
│   │   │   │       └── task.validator.js
│   │   │   └── owner/
│   │   │       └── (similar structure)
│   │   └── middleware/
│   │       ├── auth.middleware.js
│   │       ├── rateLimit.middleware.js
│   │       └── validation.middleware.js
│   │
│   ├── domain/
│   │   ├── task/
│   │   │   ├── Task.entity.js        // Domain entity
│   │   │   ├── TaskService.js        // Business logic
│   │   │   ├── TaskRepository.js     // Data access
│   │   │   └── TaskFactory.js        // Object creation
│   │   └── reminder/
│   │       ├── Reminder.entity.js
│   │       ├── ReminderService.js
│   │       └── ReminderProcessor.js
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── models/
│   │   │   │   ├── TaskModel.js
│   │   │   │   └── index.js
│   │   │   ├── repositories/
│   │   │   │   └── TaskRepository.js
│   │   │   └── migrations/
│   │   │       └── 001_create_indexes.js
│   │   ├── cache/
│   │   │   ├── RedisClient.js
│   │   │   └── CacheService.js
│   │   ├── queue/
│   │   │   ├── BullQueue.js
│   │   │   └── ReminderQueue.js
│   │   └── external/
│   │       ├── sms/
│   │       │   └── TwilioService.js
│   │       └── email/
│   │           └── SendGridService.js
│   │
│   ├── shared/
│   │   ├── utils/
│   │   │   ├── dateUtils.js
│   │   │   ├── errorHandler.js
│   │   │   └── logger.js
│   │   ├── constants/
│   │   │   └── index.js
│   │   └── types/
│   │       └── index.js
│   │
│   ├── workers/
│   │   ├── reminderWorker.js
│   │   └── cleanupWorker.js
│   │
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── index.js
│   │
│   └── app.js
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## 🔄 Request Flow (Example: Create Task)

```
┌─────────┐      ┌─────────────┐      ┌──────────────┐
│ Client  │─────▶│ API Gateway │─────▶│ Time Service │
│(React)  │      │   (5000)    │      │    (5500)    │
└─────────┘      └─────────────┘      └──────┬───────┘
                                              │
                        ┌─────────────────────┼─────────────────┐
                        │                     │                 │
                   ┌────▼────┐          ┌────▼────┐      ┌─────▼─────┐
                   │ Rate    │          │ Auth    │      │Validation │
                   │ Limiter │          │Middleware│      │Middleware │
                   └────┬────┘          └────┬────┘      └─────┬─────┘
                        │                    │                 │
                        └────────────┬───────┴─────────────────┘
                                     │
                              ┌──────▼───────┐
                              │ Controller   │
                              │ - Validate   │
                              │ - Transform  │
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │TaskService   │
                              │- Business    │
                              │  Logic       │
                              └──────┬───────┘
                                     │
                        ┌────────────┼────────────┐
                        │            │            │
                   ┌────▼────┐  ┌────▼────┐  ┌───▼────┐
                   │Repository│  │ Cache   │  │ Queue  │
                   │  Save    │  │Invalidate│ │Schedule│
                   └────┬────┘  └─────────┘  └────────┘
                        │
                   ┌────▼────┐
                   │ MongoDB │
                   │  Write  │
                   └─────────┘
```

---

## 🚀 API Design

### **RESTful Endpoints (v1)**

#### **Visitor Task Endpoints**

```
POST   /api/v1/visitor/time/tasks
GET    /api/v1/visitor/time/tasks/daily?date=YYYY-MM-DD
GET    /api/v1/visitor/time/tasks/weekly?weekStart=YYYY-MM-DD
GET    /api/v1/visitor/time/tasks/monthly?month=M&year=YYYY
GET    /api/v1/visitor/time/tasks/:id
PUT    /api/v1/visitor/time/tasks/:id
PATCH  /api/v1/visitor/time/tasks/:id/complete
DELETE /api/v1/visitor/time/tasks/:id

POST   /api/v1/visitor/time/tasks/batch        // Bulk operations
GET    /api/v1/visitor/time/tasks/search       // Advanced search
GET    /api/v1/visitor/time/analytics          // Task analytics
```

#### **Request/Response Format**

**Create Task Request:**
```json
{
  "title": "Morning standup meeting",
  "notes": "Discuss sprint progress",
  "taskDate": "2025-01-15",
  "session": "morning",
  "timeOfDay": "09:00",
  "durationMin": 30,
  "priority": "high",
  "scopeTag": "daily",
  "category": "work",
  "tags": ["meeting", "team"],
  "reminder": {
    "enabled": true,
    "channels": ["sms", "email"],
    "sendAt": "2025-01-15T08:30:00Z",
    "phone": "+1234567890",
    "email": "user@example.com"
  }
}
```

**Standard Response Format:**
```json
{
  "success": true,
  "data": {
    "_id": "task_id",
    "title": "Morning standup meeting",
    // ... full task object
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-01-15T10:00:00Z",
    "version": "v1"
  }
}
```

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid task date",
    "details": [
      {
        "field": "taskDate",
        "message": "Date must be in YYYY-MM-DD format"
      }
    ],
    "requestId": "req_abc123",
    "timestamp": "2025-01-15T10:00:00Z"
  }
}
```

---

## 🔒 Security & Performance

### **Rate Limiting Strategy**

```javascript
// Per-user limits
const userLimits = {
  tasksPerDay: 1000,
  tasksPerHour: 100,
  apiCallsPerMinute: 60
};

// Per-IP limits (prevent abuse)
const ipLimits = {
  apiCallsPerMinute: 100,
  burstLimit: 200
};
```

### **Caching Strategy**

```javascript
// Cache daily tasks (hot data)
CACHE_KEY: `tasks:user:{userId}:daily:{date}`
TTL: 300 seconds (5 minutes)

// Cache weekly tasks
CACHE_KEY: `tasks:user:{userId}:weekly:{weekStart}`
TTL: 600 seconds (10 minutes)

// Invalidation on writes
ON_CREATE/UPDATE/DELETE: invalidate all related cache keys
```

### **Input Validation**

```javascript
// Joi schema example
const taskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  notes: Joi.string().max(1000).optional(),
  taskDate: Joi.date().iso().required(),
  session: Joi.string().valid('morning', 'afternoon', 'evening').required(),
  // ... etc
});
```

---

## 📊 Monitoring & Observability

### **Metrics to Track**

```javascript
// Performance Metrics
- API response time (p50, p95, p99)
- Database query time
- Cache hit rate
- Queue processing time

// Business Metrics
- Tasks created per day
- Tasks completed rate
- Reminder delivery success rate
- Active users

// System Metrics
- CPU/Memory usage
- Database connections
- Redis memory usage
- Event queue length
```

### **Logging Strategy**

```javascript
// Structured logging with Winston
logger.info('Task created', {
  userId: 'user123',
  taskId: 'task456',
  session: 'morning',
  duration: 125, // ms
  requestId: 'req_abc123'
});

// Error logging
logger.error('Database connection failed', {
  error: err.message,
  stack: err.stack,
  context: { operation: 'createTask' }
});
```

### **Alerting**

```javascript
// Critical alerts
- API error rate > 5%
- Database connection failures
- Queue processing delays > 5 minutes
- Reminder delivery failure rate > 10%

// Warning alerts
- Cache hit rate < 80%
- API response time p95 > 500ms
- Database query time > 100ms
```

---

## 🔄 Event-Driven Architecture (Reminders)

### **Event Flow**

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│ Task Created│────▶│  Event Bus   │────▶│ Reminder Queue │
│with Reminder│     │  (In-memory  │     │   (Bull/Redis) │
└─────────────┘     │   or Kafka)  │     └────────┬───────┘
                    └──────────────┘              │
                                                  │
                    ┌─────────────────────────────▼
                    │
              ┌─────▼──────┐
              │ Cron Job   │ (Every 1 minute)
              │ Find due   │
              │ reminders  │
              └─────┬──────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
    ┌────▼───┐ ┌───▼────┐ ┌───▼────┐
    │  SMS   │ │ Email  │ │  Push  │
    │ Worker │ │ Worker │ │ Worker │
    └────┬───┘ └───┬────┘ └───┬────┘
         │         │          │
         └─────────┼──────────┘
                   │
            ┌──────▼────────┐
            │ Update Task   │
            │ reminder.sentAt│
            └───────────────┘
```

---

## 🧪 Testing Strategy

### **Test Pyramid**

```
        ┌─────────┐
       /           \
      /   E2E (10%) \
     /───────────────\
    /  Integration    \
   /     (30%)         \
  /─────────────────────\
 /      Unit Tests       \
/        (60%)            \
─────────────────────────────
```

### **Test Coverage Requirements**

```javascript
// Minimum coverage
- Unit Tests: 80%
- Integration Tests: 60%
- E2E Tests: Critical paths only

// Critical paths to test
- Task CRUD operations
- Reminder scheduling and delivery
- Date range queries
- Cache invalidation
- Error handling
```

---

## 🚢 Deployment Strategy

### **Docker Compose (Development)**

```yaml
version: '3.8'
services:
  time-service:
    build: ./time-service
    ports:
      - "5500:5500"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/salonhub
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  mongo-data:
  redis-data:
```

### **Production Considerations**

```javascript
// High Availability
- Multiple service instances (3+)
- Load balancer (NGINX/HAProxy)
- MongoDB replica set (3 nodes)
- Redis cluster/Sentinel
- Queue worker scaling

// Disaster Recovery
- Daily MongoDB backups
- Point-in-time recovery
- Multi-region deployment (optional)
- Automated failover
```

---

## 📈 Scalability Plan

### **Horizontal Scaling**

```
Load Balancer
      │
      ├──▶ Time Service Instance 1
      ├──▶ Time Service Instance 2
      ├──▶ Time Service Instance 3
      └──▶ Time Service Instance N
            │
            └──▶ MongoDB (Replica Set)
            └──▶ Redis (Cluster)
```

### **Performance Targets**

```javascript
// Latency (95th percentile)
- API Response Time: < 200ms
- Database Query: < 50ms
- Cache Access: < 5ms

// Throughput
- Requests per second: 10,000+
- Concurrent users: 100,000+
- Tasks per second: 1,000+

// Availability
- Uptime SLA: 99.9% (8.76 hours downtime/year)
- Data durability: 99.999999999% (11 nines)
```

---

## 🔐 Data Privacy & Compliance

### **GDPR Compliance**

```javascript
// User data export
GET /api/v1/visitor/data/export
// Returns all user data in portable format

// User data deletion
DELETE /api/v1/visitor/data
// Soft delete with 30-day retention

// Data encryption
- At rest: MongoDB encryption
- In transit: TLS 1.3
- PII masking in logs
```

---

## 📝 Implementation Phases

### **Phase 1: Core Infrastructure** (Week 1)
- [ ] Set up time-service microservice
- [ ] Database design and indexes
- [ ] Redis caching layer
- [ ] Basic API structure

### **Phase 2: Visitor Daily Planner** (Week 2)
- [ ] Visitor task CRUD
- [ ] Daily view API
- [ ] Frontend React components
- [ ] Error handling

### **Phase 3: Weekly & Monthly** (Week 3)
- [ ] Week range queries
- [ ] Month range queries
- [ ] Frontend weekly/monthly views
- [ ] Caching optimization

### **Phase 4: Reminders** (Week 4)
- [ ] Reminder queue system
- [ ] SMS integration (Twilio)
- [ ] Email integration (SendGrid)
- [ ] Cron workers

### **Phase 5: Owner Features** (Week 5)
- [ ] Owner task endpoints
- [ ] Team task assignment
- [ ] Owner frontend views

### **Phase 6: Production Readiness** (Week 6)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Monitoring & alerting
- [ ] Documentation
- [ ] Deployment automation

---

## 🎯 Success Metrics

### **Technical Metrics**
- API uptime: 99.9%+
- Average response time: < 200ms
- Cache hit rate: > 80%
- Test coverage: > 80%

### **Business Metrics**
- Daily active users
- Tasks created per user
- Reminder delivery success rate
- User retention rate

---

## 🔗 References

- [12-Factor App Methodology](https://12factor.net/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Microservices Patterns](https://microservices.io/patterns/index.html)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Document End**

*This architecture is designed to be production-ready, scalable, and maintainable for millions of users.*
