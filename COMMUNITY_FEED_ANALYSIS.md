# 🎯 Community Feed 2025 — Integration Analysis

**Date:** November 23, 2025
**Status:** Analysis Complete — Ready for Implementation Plan

---

## 📊 Current Codebase Architecture

### **Existing Components ✅**

| Component | Location | Current State | Reusability |
|-----------|----------|---------------|-------------|
| **Survey Model** | `backend/models/Survey.js` | ✅ Exists (multi-option) | **EXTEND** for Love feature |
| **FeedPostCard** | `frontend/src/visitor/components/FeedPostCard.jsx` | ✅ Exists | **REUSE** pattern |
| **FeedSurveyCard** | `frontend/src/visitor/components/FeedSurveyCard.jsx` | ✅ Exists (voting UI) | **TRANSFORM** to Love-only |
| **OwnerHome** | `frontend/src/pages/owner/OwnerHome.jsx` | ✅ Feed integration | **ENHANCE** with new ranking |
| **FollowButton** | `frontend/src/components/FollowButton.jsx` | ✅ Exists | **REUSE** |
| **v1Client API** | `frontend/src/api/v1.js` | ✅ Feed endpoints | **EXTEND** with Love API |
| **User Model** | `backend/models/User.js` | ✅ Has role field | **REUSE** |
| **Business Model** | `backend/models/Business.js` | ✅ Has Premium flag | **REUSE** for status |

---

## 🔄 PRD Requirements → Existing Codebase Mapping

### **1. Survey Model Enhancement**

**PRD Requirement:**
```javascript
const SurveySchema = new Schema({
  authorId: ObjectId,
  authorType: { type: String, enum: ['owner', 'visitor'] },
  isPremium: Boolean,
  question: { type: String, maxlength: 120 },
  imageUrl: String,
  loveCount: { type: Number, default: 0 },
  lastLoveAt: Date,
  authorNote: String,  // revealed after vote
}, { timestamps: true });
```

**Existing Schema:**
```javascript
const surveySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  options: [{ id: String, label: String, votes: Number }], // ← CURRENT: Multiple options
  category: { type: String, enum: ['Hair', 'Skin', ...] },
  totalVotes: { type: Number, default: 0 },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  visibility: { type: String, enum: ['public', 'followers'] },
}, { timestamps: true });
```

**Integration Strategy:**
- ✅ **KEEP** existing schema (backward compatible)
- ✅ **ADD** new fields:
  - `loveCount` (for Love-only surveys)
  - `lastLoveAt` (for recency scoring)
  - `authorNote` (revealed after vote)
  - `surveyType: { type: String, enum: ['multiple-choice', 'love-only'], default: 'multiple-choice' }`
  - `isPremium` (computed from author's Business.listingType)
  - `imageUrl` (optional image)

**Result:** One unified Survey model supports both:
1. **Legacy multi-option surveys** (existing)
2. **New Love-only surveys** (PRD feature)

---

### **2. Vote/Love Tracking**

**PRD Requirement:**
```javascript
const VoteSchema = new Schema({
  surveyId: ObjectId,
  userId: ObjectId,
}, { timestamps: true });
```

**Existing Implementation:**
```javascript
// Current: voters array in Survey model
voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
```

**Integration Strategy:**
- ✅ **KEEP** `voters` array for simple duplicate prevention
- ✅ **OPTIONAL:** Create separate `SurveyLove` model for detailed analytics:
  ```javascript
  const SurveyLoveSchema = new Schema({
    survey: { type: ObjectId, ref: 'Survey', required: true },
    user: { type: ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  });
  SurveyLoveSchema.index({ survey: 1, user: 1 }, { unique: true });
  ```

**Decision:** Start with `voters` array (simple), add `SurveyLove` model later for analytics

---

### **3. Follow System**

**PRD Requirement:**
```javascript
// Follow model (already exists — reuse)
```

**Existing Implementation:**
- **FollowContext** exists (`frontend/src/context/FollowContext`)
- **FollowButton** component exists
- **Follow state** managed globally

**Integration Strategy:**
- ✅ **100% REUSE** — No changes needed!
- ✅ Already integrated in `FeedPostCard` and `FeedSurveyCard`

---

### **4. Feed Ranking Algorithm**

**PRD Requirement:**
```javascript
const feed = await Survey.aggregate([
  {
    $addFields: {
      isFollowed: { $in: [userId, "$followedBy"] },
      score: {
        $add: [
          { $multiply: ["$loveCount", 10] },
          { $cond: ["$isPremium", 50, 0] },
          { $cond: ["$isFollowed", 1000, 0] },
          { $divide: [1, { $add: [{ $divide: [{ $subtract: [new Date(), "$lastLoveAt"] }, 3600000] }, 1] }] }
        ]
      }
    }
  },
  { $sort: { score: -1 } },
  { $limit: 50 }
]);
```

**Existing Implementation:**
```javascript
// Current: Simple reverse chronological
const feedResponse = await v1Client.feed.getFeed({ limit: 30 });
// Backend likely: Survey.find().sort({ createdAt: -1 }).limit(30)
```

**Integration Strategy:**
- ✅ **ENHANCE** existing feed endpoint (`/api/feed` or `/api/v1/feed`)
- ✅ **ADD** smart ranking algorithm:
  1. **Followed owners** (1000 points)
  2. **Premium owners** (50 points)
  3. **Love count** (10 points per love)
  4. **Recency** (decay over time)

**Implementation:**
```javascript
// backend/controllers/feedController.js (NEW or ENHANCE existing)
exports.getFeed = async (req, res) => {
  const userId = req.user.id;

  // Get user's following list
  const followedUsers = await Follow.find({ follower: userId }).select('following');
  const followedIds = followedUsers.map(f => f.following);

  const feed = await Survey.aggregate([
    { $match: { isActive: true, visibility: 'public' } },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'authorUser'
      }
    },
    {
      $lookup: {
        from: 'businesses',
        localField: 'author',
        foreignField: 'owner',
        as: 'authorBusiness'
      }
    },
    {
      $addFields: {
        isFollowed: { $in: ['$author', followedIds] },
        isPremium: {
          $cond: [
            { $eq: [{ $arrayElemAt: ['$authorBusiness.listingType', 0] }, 'premium'] },
            true,
            false
          ]
        },
        score: {
          $add: [
            { $multiply: [{ $ifNull: ['$loveCount', 0] }, 10] },
            { $cond: [{ $eq: [{ $arrayElemAt: ['$authorBusiness.listingType', 0] }, 'premium'] }, 50, 0] },
            { $cond: [{ $in: ['$author', followedIds] }, 1000, 0] },
            // Recency score (decay over hours)
            {
              $divide: [
                1,
                {
                  $add: [
                    {
                      $divide: [
                        { $subtract: [new Date(), { $ifNull: ['$lastLoveAt', '$createdAt'] }] },
                        3600000
                      ]
                    },
                    1
                  ]
                }
              ]
            }
          ]
        }
      }
    },
    { $sort: { score: -1 } },
    { $limit: 50 }
  ]);

  res.json({ success: true, items: feed });
};
```

---

### **5. UI Components**

**PRD Requirement:**
```
- Vertical one-card feed (only one survey visible at a time)
- Love ♥ button only
- Ripple reward animation
- Visual hierarchy (neon trim for followed, gold orbit for premium)
- After-vote owner note
```

**Existing Implementation:**
- **FeedSurveyCard** — Shows multi-option survey with vote buttons
- **Current UI:** Traditional card list (all visible)

**Integration Strategy:**

#### **Option A: Transform Existing FeedSurveyCard** ✅ RECOMMENDED
- ✅ Add `surveyType` check
- ✅ If `surveyType === 'love-only'`:
  - Show single Love button
  - Hide multiple options
  - Show ripple animation on vote
  - Reveal `authorNote` after vote

#### **Option B: Create New Component**
- Create `LoveSurveyCard.jsx` alongside `FeedSurveyCard.jsx`
- Keep existing multi-option surveys working
- Render different components based on `surveyType`

**Recommended: Option A** (single component, conditional rendering)

---

## 🛠️ Implementation Plan (Without Duplicates)

### **Phase 1: Backend Enhancements (Day 1-2)**

#### **File 1: Extend Survey Model**
**Location:** `backend/models/Survey.js`

**Changes:**
```javascript
const surveySchema = new mongoose.Schema({
  // ✅ EXISTING FIELDS (keep all)
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  options: [...], // Keep for backward compatibility

  // 🆕 NEW FIELDS (add these)
  surveyType: {
    type: String,
    enum: ['multiple-choice', 'love-only'],
    default: 'multiple-choice'
  },
  loveCount: { type: Number, default: 0 },
  lastLoveAt: { type: Date },
  authorNote: { type: String, maxlength: 280 }, // Revealed after vote
  imageUrl: { type: String },

  // ✅ EXISTING FIELDS (keep)
  totalVotes: { type: Number, default: 0 },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // ... rest of existing fields
});

// 🆕 NEW INDEXES
surveySchema.index({ loveCount: -1, lastLoveAt: -1 }); // For ranking
surveySchema.index({ surveyType: 1, isActive: 1 });
```

#### **File 2: Enhance Feed Controller**
**Location:** `backend/controllers/feedController.js` (if exists) or `backend/controllers/owner/ownerFeedController.js`

**Changes:**
- ✅ Add smart ranking algorithm (see code above)
- ✅ Populate author info + business info
- ✅ Calculate `isPremium` flag
- ✅ Calculate `isFollowed` flag

#### **File 3: Add Love API Endpoint**
**Location:** `backend/routes/surveyRoutes.js` (or create new)

**Changes:**
```javascript
// POST /api/surveys/:surveyId/love
router.post('/:surveyId/love', protectRoute, async (req, res) => {
  const { surveyId } = req.params;
  const userId = req.user.id;

  const survey = await Survey.findById(surveyId);

  // Check if already loved
  if (survey.voters.includes(userId)) {
    return res.status(409).json({ message: 'Already loved this survey' });
  }

  // Add love
  survey.loveCount += 1;
  survey.lastLoveAt = new Date();
  survey.voters.push(userId);
  await survey.save();

  // Populate author + business
  await survey.populate('author');
  await survey.populate({ path: 'author', populate: { path: 'business' } });

  res.json({
    success: true,
    survey,
    authorNote: survey.authorNote // Reveal after vote
  });
});
```

---

### **Phase 2: Frontend Enhancements (Day 3-4)**

#### **File 4: Transform FeedSurveyCard**
**Location:** `frontend/src/visitor/components/FeedSurveyCard.jsx`

**Changes:**
```javascript
const FeedSurveyCard = ({ survey }) => {
  const [loved, setLoved] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const handleLove = async () => {
    if (survey.surveyType === 'love-only') {
      // New Love-only flow
      const response = await v1Client.surveys.love(survey._id);
      setLoved(true);
      setShowRipple(true);
      setTimeout(() => setShowNote(true), 800); // Show note after animation
    } else {
      // Existing multi-option flow
      // ... existing vote logic
    }
  };

  if (survey.surveyType === 'love-only') {
    return (
      <article className="feed-card feed-card--love">
        {/* Premium orbit or Followed neon trim */}
        <div className={`card-border ${survey.isPremium ? 'premium-orbit' : survey.isFollowed ? 'neon-trim' : ''}`}>

          {/* Question */}
          <h2 className="love-question">{survey.question}</h2>

          {/* Image (optional) */}
          {survey.imageUrl && <img src={survey.imageUrl} alt="" />}

          {/* Love Button */}
          {!loved ? (
            <button className="love-button" onClick={handleLove}>
              <span className="love-icon">♥</span>
              <span>Love</span>
            </button>
          ) : (
            <>
              {/* Ripple Animation */}
              {showRipple && <div className="ripple-effect"></div>}

              {/* Results */}
              <div className="love-results">
                <div className="love-percentage">
                  {Math.round((survey.loveCount / survey.totalVotes) * 100)}% voted Love ♥
                </div>
                <div className="your-impact">
                  +{Math.round((1 / survey.totalVotes) * 100)}% from your vote
                </div>
              </div>

              {/* Author Note (revealed) */}
              {showNote && survey.authorNote && (
                <div className="author-note">
                  <p>{survey.author.name}: "{survey.authorNote}"</p>
                </div>
              )}
            </>
          )}
        </div>
      </article>
    );
  }

  // ✅ EXISTING: Multi-option survey rendering (keep unchanged)
  return (
    <article className="feed-card feed-card--survey">
      {/* ... existing multi-option UI ... */}
    </article>
  );
};
```

#### **File 5: Add Futuristic Styles**
**Location:** `frontend/src/styles/loveFeed.css` (NEW)

**Changes:**
```css
/* Futuristic Love Feed Styles */
.feed-card--love {
  background: #0f0f0f; /* Matte black */
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  color: white;
  font-family: 'Inter', sans-serif;
}

/* Neon trim for followed owners */
.neon-trim {
  border: 2px solid transparent;
  background: linear-gradient(#0f0f0f, #0f0f0f) padding-box,
              linear-gradient(135deg, #667eea, #764ba2) border-box;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

/* Gold orbit for premium owners */
.premium-orbit {
  border: 2px solid #FFD700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
  animation: orbit-glow 3s ease-in-out infinite;
}

@keyframes orbit-glow {
  0%, 100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
  50% { box-shadow: 0 0 50px rgba(255, 215, 0, 0.9); }
}

.love-question {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  line-height: 1.4;
}

.love-button {
  width: 100%;
  padding: 20px;
  background: transparent;
  border: 2px solid #ff006e; /* Hot pink */
  border-radius: 12px;
  color: white;
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
  box-shadow: 0 8px 30px rgba(255, 0, 110, 0.5);
  transform: translateY(-2px);
}

.love-icon {
  font-size: 28px;
}

/* Ripple effect */
.ripple-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 0, 110, 0.5);
  animation: ripple 0.8s ease-out;
}

@keyframes ripple {
  to {
    width: 300px;
    height: 300px;
    margin-left: -150px;
    margin-top: -150px;
    opacity: 0;
  }
}

.love-results {
  text-align: center;
  padding: 24px;
  background: rgba(255, 0, 110, 0.1);
  border-radius: 12px;
  margin-top: 16px;
}

.love-percentage {
  font-size: 32px;
  font-weight: 800;
  color: #ff006e;
  margin-bottom: 8px;
}

.your-impact {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.author-note {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 4px solid #ff006e;
  border-radius: 8px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.9);
}
```

---

### **Phase 3: Create Survey Flow (Day 5)**

#### **File 6: Enhance CreateSurveyModal**
**Location:** `frontend/src/components/CreateSurveyModal.jsx`

**Changes:**
```javascript
const CreateSurveyModal = ({ isOpen, onClose }) => {
  const [surveyType, setSurveyType] = useState('multiple-choice'); // or 'love-only'

  return (
    <div className="modal">
      <h2>Create Survey</h2>

      {/* Survey Type Selection */}
      <div className="survey-type-selector">
        <button
          className={surveyType === 'multiple-choice' ? 'active' : ''}
          onClick={() => setSurveyType('multiple-choice')}
        >
          Multiple Choice
        </button>
        <button
          className={surveyType === 'love-only' ? 'active' : ''}
          onClick={() => setSurveyType('love-only')}
        >
          Love-Only 💗
        </button>
      </div>

      {surveyType === 'love-only' ? (
        <>
          <input placeholder="Question (e.g., Should I add purple balayage?)" />
          <textarea placeholder="Your note (revealed after votes)" />
          <input type="file" accept="image/*" />
        </>
      ) : (
        <>
          {/* Existing multi-option UI */}
        </>
      )}
    </div>
  );
};
```

---

## 🎯 No Duplicate Code Strategy

### **Reuse Existing:**
1. ✅ **Survey Model** — Extend (don't duplicate)
2. ✅ **FeedSurveyCard** — Conditional rendering (don't create new component)
3. ✅ **FollowButton** — 100% reuse
4. ✅ **OwnerHome / VisitorHome** — Enhance feed API (don't rewrite)
5. ✅ **v1Client API** — Add `surveys.love()` method (don't duplicate client)

### **Create New:**
1. 🆕 **loveFeed.css** — New styles only (no duplicates)
2. 🆕 **Feed ranking algorithm** — New logic in existing controller
3. 🆕 **Love API endpoint** — New route in existing router

---

## 📊 Success Metrics Tracking

### **Database Additions for Analytics:**
```javascript
// Add to Survey schema
analytics: {
  impressions: { type: Number, default: 0 }, // How many times shown
  loveConversionRate: { type: Number, default: 0 }, // % who loved after seeing
  avgTimeToLove: { type: Number }, // Seconds from view to love
}
```

### **Track in Feed Controller:**
```javascript
// When survey is shown
Survey.findByIdAndUpdate(surveyId, { $inc: { 'analytics.impressions': 1 } });

// When loved
const timeToLove = Date.now() - sessionStartTime;
Survey.findByIdAndUpdate(surveyId, {
  $inc: { 'analytics.loveConversionRate': 1 },
  $push: { 'analytics.loveTimes': timeToLove }
});
```

---

## 🚀 Migration Strategy (Zero Downtime)

### **Step 1: Deploy Backend Changes**
- Add new fields to Survey model (backward compatible)
- Deploy feed ranking algorithm
- Add Love API endpoint
- ✅ Existing surveys still work (all have `surveyType: 'multiple-choice'`)

### **Step 2: Deploy Frontend Changes**
- Update FeedSurveyCard with conditional rendering
- Add new styles
- ✅ Existing surveys render normally (multi-option)

### **Step 3: Enable Love-Only Surveys**
- Update CreateSurveyModal to allow `surveyType: 'love-only'`
- Owners can now create Love-only surveys
- ✅ Both types coexist in feed

---

## ✅ Final Checklist

### **No Duplicates:**
- [ ] Survey model extended (not duplicated)
- [ ] FeedSurveyCard enhanced (not duplicated)
- [ ] Feed API enhanced (not duplicated)
- [ ] Styles added to new file (no conflicts)

### **Backward Compatibility:**
- [ ] Existing multi-option surveys still work
- [ ] Existing feed still loads
- [ ] No breaking changes to API

### **New Features:**
- [ ] Love-only survey type
- [ ] Smart feed ranking (followed > premium > loved > recent)
- [ ] Ripple animation on vote
- [ ] Author note reveal
- [ ] Visual hierarchy (neon trim, gold orbit)

---

**Ready for next step:** Send detailed implementation requirements or ask specific questions!
