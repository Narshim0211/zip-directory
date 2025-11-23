# 🛡️ Admin Moderation & Reporting System - Complete Architecture

**Status:** READY FOR IMPLEMENTATION
**Date:** November 22, 2025
**Scope:** Unified admin dashboard for all moderation tasks
**Goal:** 5-10 minutes/day admin work, zero missed reports, clear actionable data

---

## 🎯 PROBLEM STATEMENT

You need a centralized admin system to:

1. **Review Business Quality** (Business Moderation Engine - already built)
2. **Review Business Claims** (Claim This Business - planned)
3. **Review User Reports** (Report spam/inappropriate content - NEW)
4. **Review Flagged Reviews** (Community-reported reviews - NEW)
5. **View Audit Logs** (Track all admin actions - NEW)
6. **Dashboard Analytics** (Queue sizes, trends - NEW)

**Current State:**
- ✅ Business Moderation Engine exists (PENDING businesses)
- ❌ No reporting system for spam/abuse
- ❌ No unified admin dashboard
- ❌ No audit trail

**Desired State:**
- ✅ Single admin dashboard with all moderation queues
- ✅ Clear report categorization and prioritization
- ✅ One-click actions (approve, reject, ban, delete)
- ✅ Full audit trail for accountability
- ✅ Smart auto-flagging based on community reports

---

## 🏗️ ARCHITECTURE OVERVIEW

### **Unified Admin Dashboard Structure**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN MODERATION DASHBOARD                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  OVERVIEW (Dashboard Home)                                       │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Pending      │  │ Business     │  │ User         │          │
│  │ Businesses   │  │ Claims       │  │ Reports      │          │
│  │   5 items    │  │   3 items    │  │   12 items   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Flagged      │  │ Audit        │  │ Banned       │          │
│  │ Reviews      │  │ Logs         │  │ Users        │          │
│  │   2 items    │  │   156 total  │  │   1 user     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  📊 ACTIVITY GRAPH (Last 7 Days)                                │
│  [Chart showing reports submitted, resolved, auto-approved]     │
│                                                                  │
│  🔥 PRIORITY QUEUE (Needs Immediate Attention)                  │
│  1. Business Report: "Miami Salon" (spam, 5 reports)            │
│  2. Review Flagged: Profanity detected (3 community flags)      │
│  3. Claim Pending: High-risk score (new account + VPN)          │
└─────────────────────────────────────────────────────────────────┘

Navigation:
├── 📊 Dashboard (Overview)
├── 🏢 Business Moderation
│   ├── Pending Approval
│   ├── Rejected
│   └── History
├── 🏆 Business Claims
│   ├── Pending Review
│   ├── High Risk
│   ├── Approved
│   └── Rejected
├── 🚨 User Reports
│   ├── Open
│   ├── In Progress
│   ├── Resolved
│   └── Dismissed
├── ⭐ Review Moderation
│   ├── Flagged by Users
│   ├── Auto-Flagged (Profanity)
│   └── Disputed
├── 📜 Audit Logs
│   ├── All Actions
│   ├── By Admin
│   └── By Date
└── ⚙️ Settings
    ├── Auto-Moderation Rules
    ├── Admin Users
    └── Notification Settings
```

---

## 📋 REPORTABLE ENTITIES

Users can report the following:

| Entity | Report Types | Auto-Flag Threshold | Action Options |
|--------|--------------|---------------------|----------------|
| **Business Profile** | Spam, Fake/Duplicate, Inappropriate Content, Closed Permanently, Wrong Information | 3 reports | Unpublish, Edit, Delete, Ban Owner |
| **Review** | Spam, Fake, Offensive, Off-Topic, Competitor Attack | 2 reports | Hide, Delete, Ban Reviewer |
| **Social Post** | Spam, Harassment, Inappropriate Image, Impersonation | 2 reports | Hide, Delete, Warn User, Ban User |
| **User Profile** | Impersonation, Spam Account, Harassment | 3 reports | Warn, Suspend, Ban |

---

## 🗂️ DATABASE SCHEMA

### **1. Report Model (`backend/models/Report.js`)**

```javascript
const reportSchema = new mongoose.Schema({
  // What is being reported
  reportedEntityType: {
    type: String,
    enum: ['Business', 'Review', 'Post', 'User'],
    required: true,
    index: true
  },
  reportedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    refPath: 'reportedEntityType' // Dynamic reference
  },

  // Who reported it
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Report details
  reason: {
    type: String,
    enum: [
      'spam',
      'fake',
      'inappropriate',
      'harassment',
      'offensive',
      'duplicate',
      'wrong_info',
      'closed_business',
      'impersonation',
      'other'
    ],
    required: true,
    index: true
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  evidence: [{
    type: { type: String, enum: ['screenshot', 'link', 'text'] },
    url: String,
    caption: String
  }],

  // Status tracking
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'dismissed'],
    default: 'open',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },

  // Admin review
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin user
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  resolution: {
    type: String,
    enum: [
      'content_removed',
      'user_warned',
      'user_banned',
      'entity_deleted',
      'no_action',
      'false_report'
    ]
  },
  adminNotes: {
    type: String,
    maxlength: 2000
  },

  // Auto-flagging metadata
  autoFlagged: {
    type: Boolean,
    default: false
  },
  similarReportsCount: {
    type: Number,
    default: 1 // This is the first report
  },
  aggregatedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report' // Other reports for same entity
  }],

  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  resolvedAt: {
    type: Date
  }
});

// Compound indexes for fast queries
reportSchema.index({ reportedEntityType: 1, reportedEntityId: 1, status: 1 });
reportSchema.index({ status: 1, priority: -1, submittedAt: -1 });
reportSchema.index({ reporter: 1, submittedAt: -1 });

// Prevent duplicate reports from same user for same entity
reportSchema.index(
  { reporter: 1, reportedEntityId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['open', 'in_progress'] }
    }
  }
);

module.exports = mongoose.model('Report', reportSchema);
```

---

### **2. AuditLog Model (`backend/models/AuditLog.js`)**

```javascript
const auditLogSchema = new mongoose.Schema({
  // Who performed the action
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // What action was performed
  action: {
    type: String,
    enum: [
      'approve_business',
      'reject_business',
      'approve_claim',
      'reject_claim',
      'resolve_report',
      'dismiss_report',
      'ban_user',
      'unban_user',
      'delete_business',
      'delete_review',
      'delete_post',
      'edit_business'
    ],
    required: true,
    index: true
  },

  // What entity was affected
  targetEntityType: {
    type: String,
    enum: ['Business', 'Review', 'Post', 'User', 'ClaimRequest', 'Report'],
    required: true
  },
  targetEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetEntityType'
  },

  // Action details
  previousState: {
    type: mongoose.Schema.Types.Mixed // JSON snapshot before
  },
  newState: {
    type: mongoose.Schema.Types.Mixed // JSON snapshot after
  },
  reason: {
    type: String,
    maxlength: 1000
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // Additional context
  },

  // Timestamp
  performedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for fast queries
auditLogSchema.index({ admin: 1, performedAt: -1 });
auditLogSchema.index({ targetEntityType: 1, targetEntityId: 1, performedAt: -1 });
auditLogSchema.index({ action: 1, performedAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

---

### **3. BannedUser Model (`backend/models/BannedUser.js`)**

```javascript
const bannedUserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // Ban details
  banType: {
    type: String,
    enum: ['permanent', 'temporary'],
    default: 'permanent'
  },
  reason: {
    type: String,
    required: true,
    maxlength: 1000
  },
  expiresAt: {
    type: Date // null for permanent bans
  },

  // Who banned them
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin
    required: true
  },
  bannedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Related entities
  relatedReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],

  // Offense tracking
  previousWarnings: {
    type: Number,
    default: 0
  },
  violationHistory: [{
    date: Date,
    type: String, // 'spam', 'harassment', etc.
    severity: String // 'low', 'medium', 'high'
  }]
});

module.exports = mongoose.model('BannedUser', bannedUserSchema);
```

---

## 🔄 AUTO-FLAGGING LOGIC

### **Community-Driven Auto-Flagging**

```javascript
// backend/services/reportService.js

/**
 * Auto-flag content when threshold is reached
 */
async function checkAutoFlagThreshold(reportedEntityType, reportedEntityId) {
  const reportsCount = await Report.countDocuments({
    reportedEntityType,
    reportedEntityId,
    status: { $in: ['open', 'in_progress'] }
  });

  const thresholds = {
    Business: 3, // 3 reports = auto-unpublish
    Review: 2,   // 2 reports = auto-hide
    Post: 2,     // 2 reports = auto-hide
    User: 3      // 3 reports = auto-suspend
  };

  const threshold = thresholds[reportedEntityType];

  if (reportsCount >= threshold) {
    // Auto-flag the entity
    await autoFlagEntity(reportedEntityType, reportedEntityId, reportsCount);

    // Set priority to URGENT
    await Report.updateMany(
      { reportedEntityType, reportedEntityId, status: 'open' },
      {
        priority: 'urgent',
        autoFlagged: true,
        similarReportsCount: reportsCount
      }
    );

    // Notify admin
    await notifyAdmin({
      type: 'auto_flag',
      entity: reportedEntityType,
      id: reportedEntityId,
      reportsCount
    });
  }
}

/**
 * Auto-flag entity (hide from public)
 */
async function autoFlagEntity(entityType, entityId, reportsCount) {
  switch (entityType) {
    case 'Business':
      await Business.findByIdAndUpdate(entityId, {
        status: 'flagged', // Hidden from public
        moderationStatus: 'PENDING',
        moderationIssues: [`Auto-flagged due to ${reportsCount} user reports`]
      });
      break;

    case 'Review':
      await Review.findByIdAndUpdate(entityId, {
        isHidden: true,
        flaggedReason: `Auto-flagged due to ${reportsCount} user reports`
      });
      break;

    case 'Post':
      // Assuming you have a Post model
      await Post.findByIdAndUpdate(entityId, {
        isHidden: true,
        flaggedReason: `Auto-flagged due to ${reportsCount} user reports`
      });
      break;

    case 'User':
      // Temporarily suspend account
      await User.findByIdAndUpdate(entityId, {
        accountStatus: 'suspended',
        suspensionReason: `Auto-suspended due to ${reportsCount} user reports`
      });
      break;
  }
}
```

---

## 🎯 API ENDPOINTS

### **Public Report Endpoints (Any Logged-In User)**

```javascript
// POST /api/reports/submit
// Submit a new report
Body: {
  reportedEntityType: 'Business',
  reportedEntityId: '507f1f77bcf86cd799439011',
  reason: 'spam',
  description: 'This business is posting fake reviews',
  evidence: [
    { type: 'screenshot', url: 'https://...', caption: 'Fake review screenshot' }
  ]
}
Auth: Required (any user)
Returns: { success, reportId, message }

// GET /api/reports/my-reports
// Get all reports submitted by current user
Auth: Required
Returns: [{ reportId, entity, reason, status, submittedAt }]

// GET /api/reports/:reportId/status
// Check status of a specific report
Auth: Required (reporter only)
Returns: { reportId, status, resolution, reviewedAt }
```

---

### **Admin Report Endpoints**

```javascript
// GET /api/admin/reports/queue
// Get all pending reports with filters
Query: {
  status: 'open|in_progress|resolved|dismissed',
  priority: 'low|medium|high|urgent',
  entityType: 'Business|Review|Post|User',
  page: 1,
  limit: 20
}
Auth: Admin only
Returns: {
  reports: [{
    id,
    reportedEntity: { type, id, name, preview },
    reporter: { id, name, email },
    reason,
    description,
    evidence,
    status,
    priority,
    autoFlagged,
    similarReportsCount,
    submittedAt
  }],
  pagination: { total, page, pages }
}

// POST /api/admin/reports/:reportId/assign
// Assign report to admin
Body: { adminId }
Auth: Admin only
Returns: { success, message }

// POST /api/admin/reports/:reportId/resolve
// Resolve a report
Body: {
  resolution: 'content_removed|user_warned|user_banned|entity_deleted|no_action|false_report',
  adminNotes: 'Explanation of decision',
  applyPenalty: true // Ban user, delete content, etc.
}
Auth: Admin only
Returns: { success, message, actionsTaken: [] }

// POST /api/admin/reports/:reportId/dismiss
// Dismiss a false report
Body: { reason: 'Explanation' }
Auth: Admin only
Returns: { success, message }

// GET /api/admin/reports/stats
// Get report statistics
Query: { dateRange: 'today|week|month' }
Auth: Admin only
Returns: {
  totalReports: 125,
  openReports: 12,
  resolvedToday: 5,
  averageResolutionTime: '4.2 hours',
  topReasons: [
    { reason: 'spam', count: 45 },
    { reason: 'fake', count: 30 }
  ],
  topReportedEntities: [
    { entity: 'Business', id: '...', name: 'Miami Salon', reportsCount: 5 }
  ]
}

// POST /api/admin/reports/bulk-resolve
// Resolve multiple reports at once
Body: {
  reportIds: ['id1', 'id2', 'id3'],
  resolution: 'no_action',
  reason: 'All reviewed, no violations found'
}
Auth: Admin only
Returns: { success, resolvedCount: 3 }
```

---

### **Admin Ban Management Endpoints**

```javascript
// POST /api/admin/users/:userId/ban
// Ban a user
Body: {
  reason: 'Repeated spam violations',
  banType: 'permanent|temporary',
  duration: 30, // days (for temporary bans)
  deleteContent: true, // Delete all user's businesses/reviews/posts
  relatedReportIds: ['id1', 'id2']
}
Auth: Admin only
Returns: { success, message, bannedUser }

// POST /api/admin/users/:userId/unban
// Unban a user
Body: { reason: 'Appeal approved' }
Auth: Admin only
Returns: { success, message }

// GET /api/admin/users/banned
// Get list of banned users
Query: { page: 1, limit: 20 }
Auth: Admin only
Returns: {
  bannedUsers: [{
    user: { id, name, email },
    reason,
    bannedBy,
    bannedAt,
    expiresAt,
    violationHistory
  }],
  pagination: {}
}
```

---

### **Admin Audit Log Endpoints**

```javascript
// GET /api/admin/audit-logs
// Get all admin actions
Query: {
  adminId: 'filter by specific admin',
  action: 'approve_business|reject_business|ban_user|...',
  dateFrom: '2025-11-01',
  dateTo: '2025-11-22',
  page: 1,
  limit: 50
}
Auth: Admin only
Returns: {
  logs: [{
    admin: { id, name },
    action,
    targetEntity: { type, id, name },
    reason,
    performedAt
  }],
  pagination: {}
}

// GET /api/admin/audit-logs/:entityId
// Get all actions performed on a specific entity
Auth: Admin only
Returns: [{ admin, action, reason, performedAt, previousState, newState }]
```

---

## 🎨 ADMIN UI COMPONENTS

### **1. Report Queue View**

```
┌─────────────────────────────────────────────────────────────────┐
│  🚨 REPORT QUEUE                                [Filter ▼] [⚙️]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Filters:                                                        │
│  [ All ] [ Open (12) ] [ In Progress (3) ] [ Resolved ]         │
│  Priority: [ All ] [ Urgent (2) ] [ High ] [ Medium ] [ Low ]   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🔴 URGENT - Auto-Flagged (5 reports)                       │ │
│  │ Business: "Miami Glow Salon"                               │ │
│  │ Reasons: Spam (3), Fake (2)                                │ │
│  │ Submitted: Nov 22, 2025 - 2:30 PM                          │ │
│  │                                                             │ │
│  │ [View Details] [Resolve] [Dismiss] [Assign to Me]          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🟠 HIGH - Auto-Flagged (2 reports)                         │ │
│  │ Review: "This place is terrible..."                        │ │
│  │ Reasons: Offensive (2)                                      │ │
│  │ Submitted: Nov 22, 2025 - 1:15 PM                          │ │
│  │                                                             │ │
│  │ [View Details] [Resolve] [Dismiss] [Assign to Me]          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🟡 MEDIUM                                                   │ │
│  │ User: "john_doe_123"                                        │ │
│  │ Reason: Impersonation                                       │ │
│  │ Submitted: Nov 22, 2025 - 10:00 AM                         │ │
│  │                                                             │ │
│  │ [View Details] [Resolve] [Dismiss] [Assign to Me]          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Showing 1-10 of 12      [< Previous] [1] [2] [Next >]          │
└─────────────────────────────────────────────────────────────────┘
```

---

### **2. Report Detail Modal**

```
┌─────────────────────────────────────────────────────────────────┐
│  REPORT DETAILS                                        [✕ Close] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📋 REPORT INFORMATION                                           │
│  ────────────────────────────────────────────                   │
│  Report ID: #12345                                               │
│  Status: Open                                                    │
│  Priority: Urgent                                                │
│  Submitted: Nov 22, 2025 - 2:30 PM                              │
│  Auto-Flagged: Yes (5 similar reports)                          │
│                                                                  │
│  👤 REPORTER                                                     │
│  ────────────────────────────────────────────                   │
│  Name: Jane Smith                                                │
│  Email: jane@example.com                                         │
│  Account Age: 6 months                                           │
│  Previous Reports: 2 (both valid)                                │
│                                                                  │
│  🎯 REPORTED ENTITY                                              │
│  ────────────────────────────────────────────                   │
│  Type: Business                                                  │
│  Name: Miami Glow Salon                                          │
│  Owner: John Doe (john@salon.com)                                │
│  Created: Nov 1, 2025                                            │
│  Status: Flagged (auto-flagged due to reports)                  │
│  [View Full Profile →]                                           │
│                                                                  │
│  📝 REPORT REASON                                                │
│  ────────────────────────────────────────────                   │
│  Primary: Spam                                                   │
│  Description:                                                    │
│  "This business is posting fake reviews and spamming             │
│   their profile with duplicate content. I've noticed             │
│   multiple reviews from the same accounts."                      │
│                                                                  │
│  📷 EVIDENCE                                                     │
│  ────────────────────────────────────────────                   │
│  [Screenshot 1: Fake review pattern]                            │
│  [Screenshot 2: Duplicate reviews]                               │
│                                                                  │
│  🔗 RELATED REPORTS (4 similar)                                  │
│  ────────────────────────────────────────────                   │
│  1. Report #12340 - Same business, Reason: Fake (Nov 22)        │
│  2. Report #12338 - Same business, Reason: Spam (Nov 21)        │
│  3. Report #12335 - Same business, Reason: Fake (Nov 21)        │
│  4. Report #12330 - Same business, Reason: Spam (Nov 20)        │
│                                                                  │
│  ✅ RECOMMENDED ACTION                                           │
│  ────────────────────────────────────────────                   │
│  Based on analysis:                                              │
│  • 5 reports from different users                                │
│  • Pattern of fake reviews detected                              │
│  • Business recently created (< 1 month)                         │
│                                                                  │
│  Suggested: Delete Business + Ban Owner                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ TAKE ACTION                                               │   │
│  │                                                           │   │
│  │ Resolution: [Delete Business ▼]                          │   │
│  │             Options: No Action, Warn Owner, Delete       │   │
│  │                     Business, Ban Owner, Delete +        │   │
│  │                     Ban, False Report                    │   │
│  │                                                           │   │
│  │ Admin Notes:                                              │   │
│  │ ┌───────────────────────────────────────────────────┐    │   │
│  │ │ Reviewed evidence. Confirmed fake review pattern. │    │   │
│  │ │ Deleting business and banning owner permanently.  │    │   │
│  │ └───────────────────────────────────────────────────┘    │   │
│  │                                                           │   │
│  │ [ ] Send notification email to reporter                  │   │
│  │ [ ] Ban user (owner) permanently                          │   │
│  │ [x] Delete all related content                            │   │
│  │ [x] Resolve all similar reports                           │   │
│  │                                                           │   │
│  │ [Cancel]                             [Resolve Report]    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### **3. Admin Dashboard Home**

```
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ ADMIN MODERATION DASHBOARD                         👤 Admin │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 OVERVIEW                                                     │
│  ────────────────────────────────────────────                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ 🏢 Businesses │  │ 🏆 Claims    │  │ 🚨 Reports   │          │
│  │              │  │              │  │              │          │
│  │   5 Pending  │  │  3 Pending   │  │  12 Open     │          │
│  │   150 Total  │  │  45 Approved │  │  2 Urgent    │          │
│  │              │  │              │  │              │          │
│  │ [View Queue] │  │ [View Queue] │  │ [View Queue] │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ ⭐ Reviews   │  │ 🔒 Banned    │  │ 📜 Audit     │          │
│  │              │  │              │  │              │          │
│  │   2 Flagged  │  │  1 User      │  │  45 Today    │          │
│  │   1,250 Total│  │  0 Active    │  │  1,200 Total │          │
│  │              │  │              │  │              │          │
│  │ [View Queue] │  │ [View List]  │  │ [View Logs]  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  🔥 PRIORITY QUEUE (Needs Immediate Attention)                  │
│  ────────────────────────────────────────────                   │
│  1. 🔴 Business Report: "Miami Glow Salon" (5 reports - spam)   │
│     Submitted: 2:30 PM | Auto-Flagged | [Review Now]            │
│                                                                  │
│  2. 🟠 Review Flagged: Profanity detected (3 community flags)   │
│     Submitted: 1:15 PM | Auto-Flagged | [Review Now]            │
│                                                                  │
│  3. 🟡 Claim Pending: High-risk score (new account + VPN)       │
│     Submitted: 10:00 AM | Manual Review Required | [Review Now] │
│                                                                  │
│  📈 ACTIVITY TRENDS (Last 7 Days)                               │
│  ────────────────────────────────────────────                   │
│  [Line chart showing:                                            │
│   - Reports Submitted: 45                                        │
│   - Reports Resolved: 40                                         │
│   - Auto-Flagged: 8                                              │
│   - Businesses Approved: 25                                      │
│   - Claims Approved: 12]                                         │
│                                                                  │
│  ⏱️ PERFORMANCE METRICS                                          │
│  ────────────────────────────────────────────                   │
│  • Average Resolution Time: 4.2 hours                            │
│  • Auto-Approval Rate: 87%                                       │
│  • False Positive Rate: 3%                                       │
│  • Admin Response Time: 1.5 hours                                │
│                                                                  │
│  👥 ADMIN ACTIVITY TODAY                                         │
│  ────────────────────────────────────────────                   │
│  • You: 12 actions (8 resolved, 3 approved, 1 banned)           │
│  • Sarah (Admin): 5 actions                                      │
│  • Mike (Admin): 8 actions                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 IMPLEMENTATION PLAN

### **Phase 1: Core Reporting System (Days 1-2)**

**Files to Create:**
- `backend/models/Report.js` - Report data model
- `backend/models/AuditLog.js` - Audit trail model
- `backend/models/BannedUser.js` - Banned users model
- `backend/services/reportService.js` - Report logic (submit, auto-flag, resolve)
- `backend/controllers/reportController.js` - Public report endpoints
- `backend/controllers/admin/reportController.js` - Admin report queue
- `backend/routes/reportRoutes.js` - Public routes
- `backend/routes/admin/reportRoutes.js` - Admin routes

**Day 1:**
- ✅ Create Report, AuditLog, BannedUser models
- ✅ Create reportService (submit, auto-flag threshold logic)
- ✅ Create public report endpoints (submit, my-reports, status)

**Day 2:**
- ✅ Create admin report controller (queue, assign, resolve, dismiss)
- ✅ Implement auto-flagging logic (hide content at threshold)
- ✅ Create ban management endpoints
- ✅ Create audit logging middleware

---

### **Phase 2: Admin Dashboard Integration (Days 3-4)**

**Day 3: Backend Consolidation**
- ✅ Create unified admin dashboard controller
- ✅ Consolidate all queue endpoints (businesses, claims, reports, reviews)
- ✅ Create dashboard stats endpoint (overview, trends, metrics)
- ✅ Create audit log endpoints

**Day 4: Frontend Admin UI**
- ✅ Admin dashboard home (overview page)
- ✅ Report queue view (table with filters)
- ✅ Report detail modal (full context + actions)
- ✅ Ban management UI
- ✅ Audit log viewer

---

### **Phase 3: Polish & Testing (Days 5-6)**

**Day 5:**
- ✅ Add notification system (email admins on urgent reports)
- ✅ Implement bulk actions (resolve multiple reports)
- ✅ Add report analytics (top reasons, top entities)
- ✅ Create admin settings page (auto-moderation rules config)

**Day 6:**
- ✅ End-to-end testing (submit report → auto-flag → admin resolve)
- ✅ Test all resolution paths (delete, ban, dismiss, etc.)
- ✅ Test audit logging
- ✅ Performance testing (1000+ reports)

---

## 🎯 SUCCESS CRITERIA

| Metric | Target |
|--------|--------|
| Admin Resolution Time | < 5 minutes per report |
| Auto-Flag Accuracy | ≥ 90% (true positives) |
| False Positive Rate | < 5% |
| Admin Time/Day | ≤ 10 minutes (for routine queue) |
| User Report Submission Time | < 30 seconds |
| Audit Trail Completeness | 100% (all actions logged) |

---

## 🛡️ SECURITY & ABUSE PREVENTION

### **1. Prevent Report Spam**

```javascript
// Rate limit report submissions
const reportRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 reports per user per day
  keyGenerator: (req) => req.user.id,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Report limit reached. Please try again tomorrow.'
    });
  }
});
```

---

### **2. Detect False Reporters**

```javascript
// Track report accuracy
async function trackReporterAccuracy(reporterId, resolution) {
  const user = await User.findById(reporterId);

  if (resolution === 'false_report') {
    user.reportAccuracy = user.reportAccuracy || 100;
    user.reportAccuracy -= 10; // Penalize false reports

    if (user.reportAccuracy < 30) {
      // Disable reporting for chronic false reporters
      user.canReport = false;
      await user.save();
    }
  } else if (resolution === 'content_removed' || resolution === 'user_banned') {
    user.reportAccuracy = user.reportAccuracy || 100;
    user.reportAccuracy = Math.min(100, user.reportAccuracy + 2); // Reward accurate reports
  }

  await user.save();
}
```

---

### **3. Prevent Admin Abuse**

```javascript
// Log every admin action
async function logAdminAction(adminId, action, targetEntity, reason, metadata) {
  await AuditLog.create({
    admin: adminId,
    action,
    targetEntityType: targetEntity.type,
    targetEntityId: targetEntity.id,
    reason,
    metadata,
    performedAt: new Date()
  });

  // Alert senior admin if suspicious pattern
  const recentActions = await AuditLog.countDocuments({
    admin: adminId,
    action: 'ban_user',
    performedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // last hour
  });

  if (recentActions > 10) {
    await notifySeniorAdmin({
      alert: 'Unusual admin activity',
      admin: adminId,
      action: 'ban_user',
      count: recentActions
    });
  }
}
```

---

## 📋 FINAL FILE STRUCTURE

```
backend/
├── models/
│   ├── Report.js                    ✅ NEW (report data model)
│   ├── AuditLog.js                  ✅ NEW (admin action logging)
│   ├── BannedUser.js                ✅ NEW (banned users tracking)
│   ├── Business.js                  ⚠️ MODIFY (add 'flagged' status)
│   └── Review.js                    ⚠️ MODIFY (add 'isHidden' field)
│
├── services/
│   └── reportService.js             ✅ NEW (report submission, auto-flag, resolution)
│
├── controllers/
│   ├── reportController.js          ✅ NEW (public report endpoints)
│   └── admin/
│       ├── reportController.js      ✅ NEW (admin report queue)
│       ├── dashboardController.js   ✅ NEW (unified admin dashboard)
│       ├── auditController.js       ✅ NEW (audit log viewer)
│       └── moderationController.js  ✅ EXISTS (business moderation)
│
├── routes/
│   ├── reportRoutes.js              ✅ NEW (public report routes)
│   └── admin/
│       ├── reportRoutes.js          ✅ NEW (admin report routes)
│       ├── dashboardRoutes.js       ✅ NEW (admin dashboard routes)
│       └── moderationRoutes.js      ✅ EXISTS (business moderation routes)
│
├── middleware/
│   ├── rateLimitMiddleware.js       ⚠️ MODIFY (add report rate limiter)
│   └── auditMiddleware.js           ✅ NEW (auto-log admin actions)
│
└── server.js                        ⚠️ MODIFY (register new routes)

frontend/
├── src/
│   ├── components/
│   │   ├── ReportModal.jsx          ✅ NEW (report submission form)
│   │   └── ReportButton.jsx         ✅ NEW (hidden report button)
│   │
│   └── pages/
│       ├── admin/
│       │   ├── Dashboard.jsx        ✅ NEW (admin home)
│       │   ├── ReportQueue.jsx      ✅ NEW (report queue view)
│       │   ├── ReportDetail.jsx     ✅ NEW (report detail modal)
│       │   ├── AuditLogs.jsx        ✅ NEW (audit log viewer)
│       │   ├── BannedUsers.jsx      ✅ NEW (banned users list)
│       │   └── Settings.jsx         ✅ NEW (auto-mod settings)
│       │
│       └── MyReports.jsx            ✅ NEW (user's submitted reports)
```

**Total Files:**
- New: 17
- Modified: 4
- **Total Lines of Code:** ~2,500

---

## 🎉 NEXT STEPS

1. **Approve Architecture** - Review and approve this design
2. **Implement Backend** - Create models, services, controllers (Days 1-3)
3. **Implement Admin UI** - Build dashboard and queues (Days 4-5)
4. **Test & Launch** - End-to-end testing (Day 6)

**Ready to proceed?** Let me know if you want any changes to the architecture!
