# SalonHub Messaging System - Engineer Guide

**Welcome to the SalonHub Messaging System!** 🎉

This guide will help you understand, maintain, and extend the dual-inbox messaging system.

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 16+
- MongoDB running locally or remote connection
- Basic understanding of React & Express

### Setup

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Set environment variables
# backend/.env
MONGODB_URI=mongodb://localhost:27017/salonhub
JWT_SECRET=your-secret-key
PORT=5001

# frontend/.env
REACT_APP_API_URL=http://localhost:5001/api

# 3. Start services
cd backend && npm start    # Port 5001
cd frontend && npm start   # Port 3000
```

### Test the System

1. **Create two user accounts:**
   - One visitor account
   - One owner account

2. **Test messaging flow:**
   - Log in as visitor
   - Go to an owner's profile
   - Click "Message" button
   - Send a message
   - Log in as owner
   - Check `/owner/inbox`
   - Reply to the message
   - Log back in as visitor
   - Check `/visitor/inbox`

---

## 📁 Codebase Tour

### Backend Architecture

```
backend/
├── models/
│   ├── MessageThread.js        ← Thread schema (CRITICAL)
│   ├── Message.js              ← Individual messages
│   ├── User.js                 ← User accounts
│   └── Business.js             ← Business listings
│
├── controllers/
│   └── chatController.js       ← All messaging logic (START HERE)
│       ├── sendMessage()       ← Universal message sending
│       ├── replyMessage()      ← Reply to thread
│       ├── getVisitorInbox()   ← Visitor inbox with filtering
│       ├── getOwnerInbox()     ← Owner inbox with tabs
│       ├── getThreadMessages() ← Fetch thread messages
│       └── markMessagesRead()  ← Mark as read
│
├── routes/
│   └── chatRoutes.js           ← API endpoint definitions
│
├── middleware/
│   └── authMiddleware.js       ← JWT validation (protect)
│
└── server.js                   ← App entry point
```

### Frontend Architecture

```
frontend/src/
├── components/
│   ├── VisitorInbox.jsx        ← Visitor inbox UI (START HERE)
│   ├── OwnerInbox.jsx          ← Owner inbox UI
│   ├── ChatThread.jsx          ← Thread view (shared)
│   ├── InboxPreviewCard.jsx    ← Thread preview (shared)
│   └── profile/
│       └── ProfileMessageButton.jsx  ← Start conversation
│
├── api/
│   ├── chatApi.js              ← API calls to backend
│   │   ├── sendMessage()
│   │   ├── getVisitorInbox()
│   │   ├── getOwnerInbox()
│   │   ├── getThreadMessages()
│   │   └── markMessagesRead()
│   │
│   └── axios.js                ← HTTP client (auto JWT)
│
├── context/
│   └── AuthContext.js          ← User authentication state
│
├── pages/
│   └── ProfilePage.jsx         ← Profile with message button
│
└── App.js                      ← Routes definition
```

---

## 🔍 Deep Dive: How It Works

### 1. Starting a Conversation

**User Action:** Clicks "Message" button on a profile

**Frontend Flow:**
```javascript
// ProfileMessageButton.jsx
const handleMessageClick = async () => {
  const threadType = profileUser.role === 'owner' ? 'owner' : 'visitor';
  const targetId = profileUser.userId;

  const response = await sendMessage(threadType, targetId, 'Hi!');

  navigate(`/visitor/chat/${response.threadId}`);
};
```

**API Call:**
```javascript
// chatApi.js
export const sendMessage = async (threadType, targetId, text) => {
  const payload = { threadType, text };

  if (threadType === 'owner') {
    payload.ownerId = targetId;
  } else if (threadType === 'visitor') {
    payload.visitorId = targetId;
  }

  const { data } = await api.post('/v1/messages/send', payload);
  return data;
};
```

**Backend Processing:**
```javascript
// chatController.js - sendMessage()
const sendMessage = async (req, res) => {
  const senderId = req.user.id;  // From JWT
  const { threadType, ownerId, text } = req.body;

  // Find existing thread OR create new one
  let thread = await MessageThread.findOne({
    $or: [
      { ownerId, visitorId: senderId, threadType: 'owner' },
      { ownerId: senderId, visitorId: ownerId, threadType: 'owner' }
    ]
  });

  if (!thread) {
    thread = await MessageThread.create({
      threadType: 'owner',
      ownerId,
      visitorId: senderId,
      status: 'OPEN'
    });
  }

  const message = await Message.create({
    threadId: thread._id,
    senderId,
    senderRole: req.user.role,
    text
  });

  thread.lastMessageAt = new Date();
  await thread.save();

  res.json({ threadId: thread._id, message });
};
```

### 2. Loading Visitor Inbox

**User Action:** Navigates to `/visitor/inbox`

**Frontend Component:**
```javascript
// VisitorInbox.jsx
const VisitorInbox = () => {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    const response = await getVisitorInbox();
    setThreads(response.threads);
  };

  return (
    <div>
      {threads.map(thread => (
        <InboxPreviewCard
          key={thread._id}
          thread={thread}
          onClick={() => openThread(thread)}
        />
      ))}
    </div>
  );
};
```

**Backend Query:**
```javascript
// chatController.js - getVisitorInbox()
const getVisitorInbox = async (req, res) => {
  const visitorId = req.user.id;  // JWT authenticated

  const threads = await MessageThread.find({
    visitorId,                    // ONLY this user's threads
    status: { $ne: 'BLOCKED' }
  })
  .populate('ownerId', 'firstName lastName avatarUrl')
  .populate('businessId', 'businessName slug')
  .sort({ lastMessageAt: -1 })  // Most recent first
  .limit(20);

  res.json({ threads });
};
```

**Key Point:** The query filters by `visitorId: req.user.id`, ensuring the visitor ONLY sees their own threads.

### 3. Loading Owner Inbox

**User Action:** Navigates to `/owner/inbox`

**Backend Query:**
```javascript
// chatController.js - getOwnerInbox()
const getOwnerInbox = async (req, res) => {
  const ownerId = req.user.id;  // JWT authenticated
  const { filter } = req.query;  // 'all' | 'business' | 'owner'

  const query = {
    ownerId,                      // ONLY this user's threads
    status: { $ne: 'BLOCKED' }
  };

  // Optional tab filtering
  if (filter === 'business') {
    query.threadType = 'business';
  } else if (filter === 'owner') {
    query.threadType = 'owner';
  }

  const threads = await MessageThread.find(query)
    .populate('visitorId', 'firstName lastName avatarUrl')
    .populate('businessId', 'businessName slug')
    .sort({ lastMessageAt: -1 })
    .limit(20);

  res.json({ threads });
};
```

**Key Point:** The query filters by `ownerId: req.user.id`, ensuring the owner ONLY sees their own threads.

---

## 🔐 Data Separation Explained

### The Critical Guarantee

**Visitor Inbox:**
- Query: `{ visitorId: currentUser.id }`
- Returns: Only threads where user is the visitor
- **Cannot see:** Any thread where user is not the visitor

**Owner Inbox:**
- Query: `{ ownerId: currentUser.id }`
- Returns: Only threads where user is the owner
- **Cannot see:** Any thread where user is not the owner

### Why This is Bulletproof

```javascript
// Example: User A is a visitor
GET /api/v1/messages/inbox/visitor
Headers: { Authorization: Bearer <User_A_Token> }

Backend:
req.user.id = "user_A_id"  // From JWT

Query:
MessageThread.find({ visitorId: "user_A_id" })

Result:
[
  { visitorId: "user_A_id", ownerId: "owner_1", ... },
  { visitorId: "user_A_id", ownerId: "owner_2", ... }
]

// User A can ONLY see threads where they are the visitor
// Impossible to see threads where visitorId ≠ user_A_id
```

### Mutual Exclusivity

```javascript
// Visitor inbox query
{ visitorId: "A" }  ← Returns threads where A is visitor

// Owner inbox query
{ ownerId: "A" }    ← Returns threads where A is owner

// These queries are mutually exclusive
// No overlap possible unless user has both roles
```

---

## 🛠️ Common Development Tasks

### Task 1: Add a New Field to Messages

**Example:** Add `isEdited` flag to messages

```javascript
// 1. Update Message model
// backend/models/Message.js
const messageSchema = new mongoose.Schema({
  // ... existing fields
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  }
});

// 2. Update sendMessage endpoint (optional)
// backend/controllers/chatController.js
const message = await Message.create({
  threadId: thread._id,
  senderId,
  senderRole: req.user.role,
  text,
  isEdited: false  // Default value
});

// 3. Update frontend display
// frontend/src/components/ChatThread.jsx
<div className="message">
  <p>{message.text}</p>
  {message.isEdited && <span className="edited">(edited)</span>}
</div>
```

### Task 2: Add Pagination to Inbox

```javascript
// Backend
// chatController.js - getVisitorInbox()
const getVisitorInbox = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const threads = await MessageThread.find({ visitorId: req.user.id })
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await MessageThread.countDocuments({ visitorId: req.user.id });

  res.json({
    threads,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }
  });
};

// Frontend
// VisitorInbox.jsx
const loadMore = async () => {
  const nextPage = page + 1;
  const response = await getVisitorInbox(nextPage, 20);
  setThreads([...threads, ...response.threads]);
  setPage(nextPage);
};
```

### Task 3: Add Real-Time Updates with Socket.io

```javascript
// Backend - server.js
const io = require('socket.io')(server, {
  cors: { origin: 'http://localhost:3000' }
});

io.on('connection', (socket) => {
  socket.on('join_thread', (threadId) => {
    socket.join(`thread_${threadId}`);
  });

  socket.on('new_message', async (data) => {
    const message = await Message.create(data);
    io.to(`thread_${data.threadId}`).emit('message_received', message);
  });
});

// Frontend - ChatThread.jsx
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

useEffect(() => {
  socket.emit('join_thread', threadId);

  socket.on('message_received', (message) => {
    setMessages([...messages, message]);
  });

  return () => socket.disconnect();
}, [threadId]);
```

---

## 🧪 Testing Guide

### Unit Tests

```javascript
// backend/tests/chatController.test.js
describe('getVisitorInbox', () => {
  it('should return only visitor threads', async () => {
    const visitor = await User.create({ role: 'visitor' });
    const owner = await User.create({ role: 'owner' });

    // Create thread for visitor
    await MessageThread.create({
      visitorId: visitor._id,
      ownerId: owner._id,
      threadType: 'owner'
    });

    const req = { user: { id: visitor._id } };
    const res = { json: jest.fn() };

    await getVisitorInbox(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        threads: expect.arrayContaining([
          expect.objectContaining({ visitorId: visitor._id })
        ])
      })
    );
  });
});
```

### Integration Tests

```javascript
// Test complete message flow
describe('Complete Message Flow', () => {
  it('visitor sends message to owner, owner receives and replies', async () => {
    // 1. Visitor sends message
    const visitorToken = await getAuthToken('visitor@test.com');
    const response1 = await request(app)
      .post('/api/v1/messages/send')
      .set('Authorization', `Bearer ${visitorToken}`)
      .send({
        threadType: 'owner',
        ownerId: ownerId,
        text: 'Hello!'
      });

    expect(response1.status).toBe(200);
    const threadId = response1.body.threadId;

    // 2. Owner checks inbox
    const ownerToken = await getAuthToken('owner@test.com');
    const response2 = await request(app)
      .get('/api/v1/messages/inbox/owner')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response2.body.threads).toHaveLength(1);

    // 3. Owner replies
    const response3 = await request(app)
      .post('/api/v1/messages/reply')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ threadId, text: 'Hi there!' });

    expect(response3.status).toBe(200);

    // 4. Visitor sees reply
    const response4 = await request(app)
      .get(`/api/v1/messages/thread/${threadId}`)
      .set('Authorization', `Bearer ${visitorToken}`);

    expect(response4.body.messages).toHaveLength(2);
  });
});
```

---

## 🐛 Debugging Tips

### Problem: User sees empty inbox

**Check:**
1. Authentication token is valid
2. User ID matches thread visitorId/ownerId
3. Thread status is not 'BLOCKED'
4. Database has threads for this user

**Debug:**
```javascript
// Add logging to chatController
console.log('User ID:', req.user.id);
console.log('Query:', query);
const threads = await MessageThread.find(query);
console.log('Found threads:', threads.length);
```

### Problem: Messages not appearing in real-time

**Check:**
1. Frontend polling interval (if using polling)
2. Socket.io connection (if using WebSockets)
3. Thread lastMessageAt is updating

**Debug:**
```javascript
// Check if message was saved
const message = await Message.create({ ... });
console.log('Message created:', message._id);

// Check if thread was updated
thread.lastMessageAt = new Date();
await thread.save();
console.log('Thread updated:', thread.lastMessageAt);
```

### Problem: Duplicate threads created

**Check:**
1. Unique indexes are created on MessageThread
2. Bidirectional search is working correctly

**Fix:**
```bash
# Recreate indexes
mongo
> use salonhub
> db.messagethreads.dropIndexes()
> db.messagethreads.createIndex({ businessId: 1, visitorId: 1, threadType: 1 }, { unique: true, sparse: true })
```

---

## 📊 Performance Optimization

### Database Indexes

**Critical indexes already defined:**
```javascript
// MessageThread
{ businessId: 1, visitorId: 1, threadType: 1 }  // Unique constraint
{ ownerId: 1, threadType: 1, lastMessageAt: -1 } // Owner inbox
{ visitorId: 1, status: 1, lastMessageAt: -1 }   // Visitor inbox

// Message
{ threadId: 1, createdAt: 1 }  // Thread messages
{ senderId: 1, createdAt: -1 } // User message history
```

**Verify indexes:**
```javascript
// In MongoDB shell
db.messagethreads.getIndexes()
db.messages.getIndexes()
```

### Query Optimization

**Bad:**
```javascript
// Loads ALL threads then filters in JavaScript
const allThreads = await MessageThread.find();
const visitorThreads = allThreads.filter(t => t.visitorId === userId);
```

**Good:**
```javascript
// Filters in database using index
const visitorThreads = await MessageThread.find({ visitorId: userId });
```

### Caching Strategy

```javascript
// Simple in-memory cache for inbox (5 min TTL)
const cache = new Map();

const getVisitorInbox = async (req, res) => {
  const cacheKey = `inbox_visitor_${req.user.id}`;

  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < 300000) {  // 5 min
      return res.json(cached.data);
    }
  }

  const threads = await MessageThread.find({ visitorId: req.user.id });

  cache.set(cacheKey, {
    data: { threads },
    timestamp: Date.now()
  });

  res.json({ threads });
};
```

---

## 🚨 Security Best Practices

### 1. Always Validate User Input

```javascript
// Bad
const { text } = req.body;
await Message.create({ text });

// Good
const { text } = req.body;
if (!text || text.trim().length === 0) {
  return res.status(400).json({ message: 'Text is required' });
}
if (text.length > 500) {
  return res.status(400).json({ message: 'Text too long (max 500 chars)' });
}
await Message.create({ text: text.trim() });
```

### 2. Never Trust Client-Side IDs

```javascript
// Bad - Client sends userId
const { userId, text } = req.body;
await Message.create({ senderId: userId, text });

// Good - Use authenticated user from JWT
const senderId = req.user.id;  // From middleware
await Message.create({ senderId, text });
```

### 3. Prevent SQL/NoSQL Injection

```javascript
// Bad - Direct string interpolation
const threads = await MessageThread.find({ visitorId: req.params.id });

// Good - Use Mongoose query builders
const threads = await MessageThread.find({
  visitorId: mongoose.Types.ObjectId(req.params.id)
});
```

### 4. Rate Limiting

```javascript
// Prevent spam/abuse
const rateLimit = require('express-rate-limit');

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,              // 10 messages per minute
  message: 'Too many messages. Please slow down.'
});

router.post('/send', protect, messageLimiter, chatController.sendMessage);
```

---

## 📚 Additional Resources

- **Architecture Doc:** [claude.md](.github/claude.md)
- **MongoDB Indexes:** https://docs.mongodb.com/manual/indexes/
- **React Hooks:** https://reactjs.org/docs/hooks-intro.html
- **Express Middleware:** https://expressjs.com/en/guide/using-middleware.html

---

## 💡 Pro Tips

1. **Always test with multiple users** - Create test accounts for both roles
2. **Use MongoDB Compass** - Visual tool to inspect database
3. **Enable debug logging** - Set `DEBUG=*` in development
4. **Use React DevTools** - Inspect component state
5. **Test edge cases** - Empty inbox, blocked threads, deleted messages

---

## 🎓 Learning Path

**New to the codebase?** Follow this path:

1. Read [claude.md](.github/claude.md) - Architecture overview
2. Explore models (MessageThread, Message)
3. Read chatController.js - All business logic
4. Understand authentication flow (authMiddleware)
5. Explore frontend components (VisitorInbox, ChatThread)
6. Test the system end-to-end
7. Make your first enhancement!

---

**Questions?** Check the main documentation or reach out to the team!

**Happy coding!** 🚀
