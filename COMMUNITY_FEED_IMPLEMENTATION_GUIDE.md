# 🚀 Community Feed v1.0 — Complete Implementation Guide

**Date:** November 23, 2025
**Status:** Ready to Build
**Build Time:** 5 days
**Complexity:** Medium

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Database Schema Changes](#database-schema-changes)
3. [API Endpoints](#api-endpoints)
4. [Component Architecture](#component-architecture)
5. [UX Flow (Step-by-Step)](#ux-flow-step-by-step)
6. [5-Day Implementation Schedule](#5-day-implementation-schedule)
7. [Testing Checklist](#testing-checklist)
8. [Success Metrics](#success-metrics)

---

## 📊 Executive Summary

### **What We're Building:**
A Love-only survey feature that coexists with your existing multi-option polls, featuring:
- ✅ Simple one-tap Love button
- ✅ Instant feedback after vote (fade animation)
- ✅ Author notes revealed after voting
- ✅ Premium/Following badges (subtle, clean)
- ✅ Smart feed ranking algorithm
- ✅ Inline follow suggestions

### **What We're NOT Building (v1.0):**
- ❌ One-card-at-a-time feed (keeping scroll)
- ❌ Card flip animation (using fade)
- ❌ Neon glow borders (using badges)
- ❌ Swipe gestures (using tap)

### **Files Changed:**
- **Backend:** 3 files modified, 1 new controller
- **Frontend:** 3 files modified, 1 new CSS file
- **Total:** ~800 new lines of code

---

## 🗄️ Database Schema Changes

### **File:** `backend/models/Survey.js`

**Changes: EXTEND existing schema (backward compatible)**

```javascript
const surveySchema = new mongoose.Schema({
  // ========================================
  // EXISTING FIELDS (keep all unchanged)
  // ========================================
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: { type: String, required: true },
  options: {
    type: [optionSchema],
    validate: [(v) => Array.isArray(v) && v.length >= 2, 'Provide at least 2 options'],
  },
  category: {
    type: String,
    enum: ['Hair', 'Skin', 'Nails', 'Makeup', 'Spa', 'General'],
    default: 'General',
  },
  totalVotes: { type: Number, default: 0 },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  visibility: {
    type: String,
    enum: ['public', 'followers'],
    default: 'public',
  },
  visibleToVisitors: { type: Boolean, default: true },

  // ========================================
  // 🆕 NEW FIELDS (Love-only surveys)
  // ========================================
  surveyType: {
    type: String,
    enum: ['poll', 'love-only'],
    default: 'poll',
    index: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  loveCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastLoveAt: {
    type: Date,
    default: null
  },
  authorNote: {
    type: String,
    maxlength: 280,
    default: ''
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

// ========================================
// 🆕 NEW INDEXES (for feed ranking)
// ========================================
surveySchema.index({ surveyType: 1, isActive: 1, createdAt: -1 });
surveySchema.index({ loveCount: -1, lastLoveAt: -1 });
surveySchema.index({ author: 1, surveyType: 1 });
```

**Migration Strategy:**
```javascript
// All existing surveys automatically get surveyType: 'poll'
// No data migration needed (backward compatible)
```

---

## 🔌 API Endpoints

### **1. Love a Survey**

**Endpoint:** `POST /api/surveys/:surveyId/love`
**Auth:** Required (any authenticated user)
**Purpose:** Vote Love on a Love-only survey

**Request:**
```http
POST /api/surveys/507f1f77bcf86cd799439011/love
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "survey": {
    "_id": "507f1f77bcf86cd799439011",
    "question": "Should I add purple balayage to my menu?",
    "surveyType": "love-only",
    "loveCount": 47,
    "totalVotes": 65,
    "viewCount": 248,
    "authorNote": "Purple it is! Launching Friday 💜",
    "author": {
      "_id": "507f191e810c19729de860ea",
      "name": "Sarah @ Bella Braids",
      "role": "owner"
    },
    "isPremium": true,
    "lovePercentage": 72,
    "yourImpact": 4
  }
}
```

**Response (Already Voted):**
```json
{
  "success": false,
  "message": "You've already voted on this survey",
  "statusCode": 409
}
```

**Implementation:**
```javascript
// File: backend/controllers/surveyController.js

exports.loveSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const userId = req.user.id;

    // Find survey
    const survey = await Survey.findById(surveyId)
      .populate('author', 'name role email');

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check survey type
    if (survey.surveyType !== 'love-only') {
      return res.status(400).json({
        success: false,
        message: 'This survey is not a Love-only type'
      });
    }

    // Check if already voted
    if (survey.voters.includes(userId)) {
      return res.status(409).json({
        success: false,
        message: "You've already voted on this survey"
      });
    }

    // Add love
    survey.loveCount += 1;
    survey.totalVotes += 1;
    survey.lastLoveAt = new Date();
    survey.voters.push(userId);
    await survey.save();

    // Get author's business for Premium status
    const Business = require('../models/Business');
    const business = await Business.findOne({ owner: survey.author._id })
      .select('listingType premiumSubscription');

    const isPremium = business?.listingType === 'premium' &&
                      business?.premiumSubscription?.active === true;

    // Calculate percentages
    const lovePercentage = Math.round((survey.loveCount / survey.totalVotes) * 100);
    const yourImpact = Math.round((1 / survey.totalVotes) * 100);

    // Return enhanced survey data
    res.json({
      success: true,
      survey: {
        ...survey.toObject(),
        isPremium,
        lovePercentage,
        yourImpact
      }
    });

  } catch (error) {
    console.error('Love survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to love survey',
      error: error.message
    });
  }
};
```

---

### **2. Enhanced Feed Endpoint**

**Endpoint:** `GET /api/feed` (ENHANCE existing)
**Auth:** Required
**Purpose:** Get personalized feed with Love-only + Poll surveys

**Request:**
```http
GET /api/feed?limit=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "type": "survey",
      "data": {
        "_id": "507f1f77bcf86cd799439011",
        "surveyType": "love-only",
        "question": "Should I add purple balayage?",
        "imageUrl": "https://...",
        "loveCount": 47,
        "viewCount": 248,
        "authorNote": "Purple it is!",
        "author": {
          "_id": "507f191e810c19729de860ea",
          "name": "Sarah @ Bella Braids",
          "role": "owner"
        },
        "isPremium": true,
        "isFollowing": true,
        "hasVoted": false,
        "score": 1350
      }
    },
    {
      "type": "survey",
      "data": {
        "_id": "507f1f77bcf86cd799439012",
        "surveyType": "poll",
        "question": "What color should I try next?",
        "options": [
          { "id": "1", "label": "Red", "votes": 15 },
          { "id": "2", "label": "Blue", "votes": 23 }
        ],
        // ...
      }
    }
  ],
  "pagination": {
    "total": 127,
    "page": 1,
    "limit": 50
  }
}
```

**Implementation:**
```javascript
// File: backend/controllers/feedController.js

exports.getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    // Get user's following list
    const Follow = require('../models/Follow');
    const follows = await Follow.find({ follower: userId }).select('following');
    const followedIds = follows.map(f => f.following.toString());

    // Aggregate feed with smart ranking
    const feed = await Survey.aggregate([
      // Only active, public surveys
      {
        $match: {
          isActive: true,
          visibility: 'public'
        }
      },

      // Lookup author
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorUser'
        }
      },

      // Lookup business (for Premium status)
      {
        $lookup: {
          from: 'businesses',
          localField: 'author',
          foreignField: 'owner',
          as: 'authorBusiness'
        }
      },

      // Calculate score
      {
        $addFields: {
          isFollowing: {
            $in: ['$author', followedIds.map(id => mongoose.Types.ObjectId(id))]
          },
          isPremium: {
            $and: [
              { $eq: [{ $arrayElemAt: ['$authorBusiness.listingType', 0] }, 'premium'] },
              { $eq: [{ $arrayElemAt: ['$authorBusiness.premiumSubscription.active', 0] }, true] }
            ]
          },
          hasVoted: {
            $in: [mongoose.Types.ObjectId(userId), '$voters']
          },

          // Recency score (0-24 points, based on hours old)
          recencyScore: {
            $let: {
              vars: {
                hoursOld: {
                  $divide: [
                    { $subtract: [new Date(), { $ifNull: ['$lastLoveAt', '$createdAt'] }] },
                    3600000 // ms to hours
                  ]
                }
              },
              in: {
                $max: [0, { $subtract: [24, '$$hoursOld'] }]
              }
            }
          },

          // Random discovery boost (0-10 points)
          randomBoost: { $multiply: [{ $rand: {} }, 10] },

          // Total score
          score: {
            $add: [
              // Followed boost
              { $cond: [
                { $in: ['$author', followedIds.map(id => mongoose.Types.ObjectId(id))] },
                300,
                0
              ]},

              // Premium boost
              { $cond: [
                {
                  $and: [
                    { $eq: [{ $arrayElemAt: ['$authorBusiness.listingType', 0] }, 'premium'] },
                    { $eq: [{ $arrayElemAt: ['$authorBusiness.premiumSubscription.active', 0] }, true] }
                  ]
                },
                50,
                0
              ]},

              // Love count (popularity)
              { $multiply: [{ $ifNull: ['$loveCount', 0] }, 5] },

              // Recency (fresh content)
              { $multiply: ['$recencyScore', 20] },

              // Random (discovery)
              '$randomBoost'
            ]
          }
        }
      },

      // Sort by score (highest first)
      { $sort: { score: -1, createdAt: -1 } },

      // Limit results
      { $limit: parseInt(limit) },

      // Project final shape
      {
        $project: {
          _id: 1,
          surveyType: 1,
          question: 1,
          imageUrl: 1,
          loveCount: 1,
          totalVotes: 1,
          viewCount: 1,
          authorNote: 1,
          options: 1,
          category: 1,
          createdAt: 1,
          author: { $arrayElemAt: ['$authorUser', 0] },
          isPremium: 1,
          isFollowing: 1,
          hasVoted: 1,
          score: 1
        }
      }
    ]);

    // Format response
    const items = feed.map(survey => ({
      type: 'survey',
      data: {
        ...survey,
        author: {
          _id: survey.author._id,
          name: survey.author.name,
          role: survey.author.role,
          avatarUrl: survey.author.avatarUrl
        }
      }
    }));

    res.json({
      success: true,
      items,
      pagination: {
        total: items.length,
        page: 1,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed',
      error: error.message
    });
  }
};
```

---

### **3. Create Love-Only Survey**

**Endpoint:** `POST /api/surveys` (ENHANCE existing)
**Auth:** Required
**Purpose:** Create a new Love-only survey

**Request:**
```json
{
  "surveyType": "love-only",
  "question": "Should I add purple balayage to my menu?",
  "imageUrl": "https://...",
  "authorNote": "I'll pick the color based on this! 💜",
  "category": "Hair",
  "visibility": "public"
}
```

**Response:**
```json
{
  "success": true,
  "survey": {
    "_id": "507f1f77bcf86cd799439011",
    "surveyType": "love-only",
    "question": "Should I add purple balayage to my menu?",
    "imageUrl": "https://...",
    "authorNote": "I'll pick the color based on this! 💜",
    "loveCount": 0,
    "totalVotes": 0,
    "viewCount": 0,
    "createdAt": "2025-11-23T10:30:00Z"
  }
}
```

**Implementation:** Enhance existing survey creation endpoint to accept `surveyType: 'love-only'`

---

## 🧩 Component Architecture

### **Component Tree:**

```
OwnerHome / VisitorHome
└── Feed
    ├── FeedPostCard (existing)
    └── FeedSurveyCard (MODIFIED)
        ├── MultiOptionSurvey (existing logic)
        └── LoveOnlySurvey (NEW)
            ├── SurveyHeader (badges)
            ├── LoveButton
            ├── LoveResults (after vote)
            │   ├── Percentage display
            │   ├── Impact message
            │   ├── AuthorNote
            │   └── FollowSuggestion
            └── SurveyImage (optional)
```

---

### **File:** `frontend/src/visitor/components/FeedSurveyCard.jsx`

**Changes: MODIFY existing component**

```jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import IdentityBadge from "../../components/SharedComponents/IdentityBadge";
import FollowButton from "../../components/FollowButton";
import SurveyEngagementBar from "../../components/engagement/SurveyEngagementBar";
import VerificationBadgeInline from "../../components/VerificationBadgeInline";
import v1Client from "../../api/v1";
import "../../styles/loveFeed.css";

const FeedSurveyCard = React.memo(function FeedSurveyCard({ survey }) {
  const navigate = useNavigate();
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(survey.hasVoted || false);
  const [localSurvey, setLocalSurvey] = useState(survey);
  const [error, setError] = useState("");
  const [following, setFollowing] = useState(survey.isFollowing || false);

  // ========================================
  // LOVE-ONLY SURVEY COMPONENT
  // ========================================
  if (survey.surveyType === 'love-only') {
    const handleLove = async () => {
      if (voting || voted) return;

      setVoting(true);
      setError("");

      try {
        const response = await v1Client.surveys.love(localSurvey._id);

        if (response?.success && response?.survey) {
          setLocalSurvey(response.survey);
          setVoted(true);
        }
      } catch (err) {
        if (err.response?.status === 409) {
          setError("You've already voted on this survey");
          setVoted(true);
        } else {
          setError(err.response?.data?.message || "Failed to vote");
        }
      } finally {
        setVoting(false);
      }
    };

    const handleFollow = async () => {
      try {
        await v1Client.follow.toggle(survey.author._id, survey.author.role);
        setFollowing(true);
      } catch (err) {
        console.error('Follow error:', err);
      }
    };

    return (
      <article className="feed-card feed-card--love">
        {/* Header with badges */}
        <header className="feed-card__header">
          <div className="survey-author">
            <Link
              to={`/profile/${survey.author?._id}`}
              state={{ from: 'feed' }}
              className="author-link"
            >
              <IdentityBadge identity={survey.identity} author={survey.author} />
            </Link>

            {/* Premium & Following Badges */}
            <div className="author-badges">
              {localSurvey.isPremium && (
                <span className="badge badge--premium">
                  <span className="badge-icon">👑</span>
                  <span className="badge-text">Premium</span>
                </span>
              )}
              {following && (
                <span className="badge badge--following">
                  <span className="badge-icon">✓</span>
                  <span className="badge-text">Following</span>
                </span>
              )}
            </div>
          </div>

          {/* Follow button (top-right) */}
          <FollowButton
            targetId={survey.author?._id}
            targetType={survey.author?.role || 'owner'}
          />
        </header>

        {/* Question */}
        <h2 className="love-question">{survey.question}</h2>

        {/* Optional image */}
        {survey.imageUrl && (
          <div className="love-image">
            <img src={survey.imageUrl} alt="" />
          </div>
        )}

        {/* Love Button or Results */}
        {!voted ? (
          <button
            className="love-button"
            onClick={handleLove}
            disabled={voting}
          >
            <span className="love-icon">♥</span>
            <span className="love-text">{voting ? 'Loving...' : 'Love'}</span>
          </button>
        ) : (
          <div className="love-results fade-in">
            {/* Percentage */}
            <div className="love-percentage">
              <span className="percentage-value">
                {localSurvey.lovePercentage || 0}%
              </span>
              <span className="percentage-label">Love ♥</span>
            </div>

            {/* Impact message */}
            <p className="your-impact">
              +{localSurvey.yourImpact || 0}% from your vote
            </p>

            {/* Author note (revealed) */}
            {localSurvey.authorNote && (
              <div className="author-note">
                <p className="note-author">{survey.author.name} says:</p>
                <p className="note-text">"{localSurvey.authorNote}"</p>
              </div>
            )}

            {/* Follow suggestion (inline) */}
            {!following && (
              <div className="follow-suggestion">
                <p>Enjoying {survey.author.name}'s content?</p>
                <button
                  className="follow-button-inline"
                  onClick={handleFollow}
                >
                  Follow
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && <p className="error-message">{error}</p>}

        {/* Engagement bar (likes, comments - optional) */}
        <div className="engagement-section">
          <SurveyEngagementBar surveyId={survey._id} />
        </div>
      </article>
    );
  }

  // ========================================
  // EXISTING MULTI-OPTION SURVEY (keep unchanged)
  // ========================================
  return (
    <article className="feed-card feed-card--survey">
      {/* ... existing multi-option survey UI ... */}
    </article>
  );
});

export default FeedSurveyCard;
```

---

### **File:** `frontend/src/styles/loveFeed.css` (NEW)

```css
/* ========================================
   LOVE-ONLY SURVEY STYLES
   ======================================== */

.feed-card--love {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Header with badges */
.survey-author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.author-link {
  text-decoration: none;
  color: inherit;
}

.author-badges {
  display: flex;
  gap: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.badge--premium {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1a1a1a;
  box-shadow: 0 2px 6px rgba(255, 215, 0, 0.3);
}

.badge--following {
  background: #3b82f6;
  color: white;
}

.badge-icon {
  font-size: 14px;
}

.badge-text {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Question */
.love-question {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 20px;
  line-height: 1.4;
}

/* Optional image */
.love-image {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.love-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* Love button */
.love-button {
  width: 100%;
  padding: 18px 24px;
  background: white;
  border: 3px solid #ff006e;
  border-radius: 12px;
  color: #ff006e;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.love-button:hover {
  background: #ff006e;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 0, 110, 0.3);
}

.love-button:active {
  transform: translateY(0);
}

.love-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.love-icon {
  font-size: 28px;
  line-height: 1;
}

.love-text {
  font-size: 18px;
}

/* Results section */
.love-results {
  padding: 24px;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border-radius: 12px;
  text-align: center;
}

.fade-in {
  animation: fadeIn 0.4s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.love-percentage {
  margin-bottom: 12px;
}

.percentage-value {
  display: block;
  font-size: 48px;
  font-weight: 900;
  color: #ff006e;
  line-height: 1;
  margin-bottom: 4px;
}

.percentage-label {
  font-size: 16px;
  color: #64748b;
}

.your-impact {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 20px;
  font-weight: 600;
}

/* Author note */
.author-note {
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-left: 4px solid #ff006e;
  border-radius: 8px;
  text-align: left;
}

.note-author {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.note-text {
  font-size: 15px;
  color: #475569;
  font-style: italic;
  line-height: 1.5;
  margin: 0;
}

/* Follow suggestion */
.follow-suggestion {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}

.follow-suggestion p {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
}

.follow-button-inline {
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.follow-button-inline:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.follow-button-inline:active {
  transform: translateY(0);
}

/* Error message */
.error-message {
  margin-top: 12px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  text-align: center;
}

/* Engagement section */
.engagement-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

/* Responsive */
@media (max-width: 768px) {
  .feed-card--love {
    padding: 20px 16px;
  }

  .love-question {
    font-size: 20px;
  }

  .love-button {
    padding: 16px 20px;
    font-size: 16px;
  }

  .love-icon {
    font-size: 24px;
  }

  .percentage-value {
    font-size: 40px;
  }
}
```

---

## 📱 UX Flow (Step-by-Step)

### **Flow 1: Visitor Votes on Love-Only Survey**

```
1. User opens OwnerHome or VisitorHome
   ↓
2. Feed loads with mixed content (posts, polls, love surveys)
   ↓
3. User scrolls and sees Love-only survey card
   - Large question text visible
   - Premium badge if author is Premium
   - Following badge if user follows author
   - Big pink Love button
   ↓
4. User taps Love button
   - Button shows "Loving..." (disabled)
   - API call: POST /api/surveys/:id/love
   ↓
5. API responds with results
   - lovePercentage: 72
   - yourImpact: 4
   - authorNote: "Purple it is!"
   ↓
6. Card animates (fade transition)
   - Love button fades out
   - Results section fades in
   ↓
7. User sees results
   - "72% Love ♥" (large text)
   - "+4% from your vote" (impact message)
   - Author note (if provided): "Sarah says: Purple it is!"
   ↓
8. If user doesn't follow author:
   - "Enjoying Sarah's content?" prompt appears
   - "Follow" button visible
   ↓
9. User taps Follow (optional)
   - Following badge appears immediately
   - Card border doesn't change (keeping clean)
   ↓
10. User scrolls to next item in feed
```

---

### **Flow 2: Owner Creates Love-Only Survey**

```
1. Owner opens OwnerHome
   ↓
2. Taps "Create Survey" floating button (existing)
   ↓
3. CreateSurveyModal opens
   ↓
4. Owner sees survey type selector:
   [📊 Poll] [💗 Love-Only]
   ↓
5. Owner taps "Love-Only"
   ↓
6. UI changes to Love-only form:
   - Question input (120 chars max)
   - Optional image upload
   - Author note input (280 chars max)
   - Category dropdown (Hair, Skin, etc.)
   ↓
7. Owner fills form:
   - Question: "Should I add purple balayage?"
   - Author note: "I'll launch it Friday! 💜"
   - Uploads image of purple hair
   ↓
8. Owner taps "Create Survey"
   ↓
9. API call: POST /api/surveys
   {
     "surveyType": "love-only",
     "question": "Should I add purple balayage?",
     "authorNote": "I'll launch it Friday! 💜",
     "imageUrl": "https://..."
   }
   ↓
10. Modal closes
    ↓
11. Feed refreshes
    ↓
12. New survey appears at top of feed
    - Owner sees their own survey
    - Can't vote on it (author check)
    - Shows "0 Loves" initially
```

---

### **Flow 3: Premium Owner Gets Visibility Boost**

```
1. Premium owner creates Love-only survey
   ↓
2. Survey enters feed ranking algorithm
   ↓
3. Algorithm calculates score:
   - Base score: 0
   - Premium boost: +50 points
   - Recency: +480 points (24 hrs × 20 multiplier)
   - Random: +5 points
   - Total: 535 points
   ↓
4. Non-premium owner's survey (same time):
   - Base score: 0
   - Premium boost: 0 (not premium)
   - Recency: +480 points
   - Random: +3 points
   - Total: 483 points
   ↓
5. Feed sorts by score (descending)
   - Premium survey appears higher
   - Gets more visibility
   - Gets more votes
   ↓
6. After 24 hours:
   - Premium survey: 47 loves (more exposure)
   - Non-premium survey: 12 loves (less exposure)
   ↓
7. Premium owner sees value:
   - "My surveys get 4x more engagement!"
   - Incentive to stay Premium or upgrade
```

---

## 📅 5-Day Implementation Schedule

### **Day 1: Backend Foundation**
**Time:** 6-8 hours

**Tasks:**
- [ ] Update Survey model schema
- [ ] Add new indexes
- [ ] Create Love endpoint (POST /api/surveys/:id/love)
- [ ] Test endpoint with Postman/Thunder Client

**Deliverables:**
- ✅ Survey model supports Love-only type
- ✅ Love API endpoint works
- ✅ Can create Love-only surveys via Postman

---

### **Day 2: Feed Ranking Algorithm**
**Time:** 6-8 hours

**Tasks:**
- [ ] Enhance feed controller with ranking logic
- [ ] Add Follow lookup aggregation
- [ ] Add Premium status aggregation
- [ ] Test ranking with sample data

**Deliverables:**
- ✅ Feed endpoint returns scored surveys
- ✅ Followed content appears first
- ✅ Premium content gets boost
- ✅ Fresh content rises

---

### **Day 3: Frontend Components**
**Time:** 8 hours

**Tasks:**
- [ ] Modify FeedSurveyCard component
- [ ] Add Love-only UI branch
- [ ] Create loveFeed.css
- [ ] Add fade animation
- [ ] Add badges (Premium, Following)

**Deliverables:**
- ✅ Love-only surveys render correctly
- ✅ Love button works
- ✅ Results show after vote
- ✅ Badges appear correctly

---

### **Day 4: Create Survey Flow**
**Time:** 6 hours

**Tasks:**
- [ ] Enhance CreateSurveyModal
- [ ] Add survey type selector
- [ ] Add Love-only form fields
- [ ] Handle image upload
- [ ] Test survey creation

**Deliverables:**
- ✅ Owners can create Love-only surveys
- ✅ Modal shows correct fields
- ✅ Surveys appear in feed immediately

---

### **Day 5: Polish & Testing**
**Time:** 8 hours

**Tasks:**
- [ ] Add error handling
- [ ] Add loading states
- [ ] Test all user flows
- [ ] Fix bugs
- [ ] Test responsive design (mobile)
- [ ] Add analytics tracking

**Deliverables:**
- ✅ All flows work end-to-end
- ✅ Mobile UI looks good
- ✅ No console errors
- ✅ Ready for production

---

## ✅ Testing Checklist

### **Backend Tests**

- [ ] Love endpoint accepts valid votes
- [ ] Love endpoint rejects duplicate votes (409 error)
- [ ] Love endpoint rejects invalid survey IDs (404)
- [ ] Love endpoint requires authentication (401)
- [ ] Love count increments correctly
- [ ] lastLoveAt updates correctly
- [ ] Feed ranking algorithm works
- [ ] Followed content appears first
- [ ] Premium content gets boost
- [ ] Fresh content rises

### **Frontend Tests**

- [ ] Love-only surveys render correctly
- [ ] Love button triggers vote
- [ ] Results fade in after vote
- [ ] Percentage displays correctly
- [ ] Impact message displays correctly
- [ ] Author note appears (if provided)
- [ ] Follow suggestion appears (if not following)
- [ ] Follow button works
- [ ] Premium badge appears (if premium)
- [ ] Following badge appears (if following)
- [ ] Multi-option surveys still work (backward compatible)
- [ ] Mobile UI responsive
- [ ] Error messages display correctly

### **User Flow Tests**

- [ ] Visitor can vote on Love survey
- [ ] Visitor can follow after voting
- [ ] Owner can create Love survey
- [ ] Owner can create Poll survey (existing)
- [ ] Premium owners get visibility boost
- [ ] Feed loads in <2 seconds
- [ ] No duplicate votes possible

---

## 📊 Success Metrics (Track After 30 Days)

| Metric | How to Measure | Target |
|--------|----------------|--------|
| **Love surveys created** | Count `surveyType: 'love-only'` | 40% of total surveys |
| **Vote conversion rate** | votes / views on Love surveys | >60% |
| **Avg votes per survey** | loveCount average | >50 votes |
| **Follow growth** | Follows from feed suggestions | +30% |
| **Premium upgrades** | Conversions attributed to feed | +20% |
| **Daily active users** | Unique feed viewers per day | +40% |
| **Avg session time** | Time on feed page | >3 minutes |

---

## 🚀 Ready to Build!

All specifications are complete. You can now:

1. ✅ **Start coding** (follow Day 1-5 schedule)
2. ✅ **Ask questions** (if any step is unclear)
3. ✅ **Request modifications** (if you want changes)

**Let me know when you're ready to start, or if you need:**
- More detailed component code
- API route files
- Test cases
- Deployment guide

I'm ready to help with implementation! 🎯
