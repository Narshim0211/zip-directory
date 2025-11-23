# 🚀 IMPLEMENTATION EXECUTION PLAN

**Feature:** Visitor Business Profile Page + Pay-to-Chat System
**Start Date:** November 23, 2025
**Estimated Duration:** 5-7 days
**Team Size:** 1 developer (you) + AI assistant

---

## 📋 OVERVIEW

This plan executes the implementation in **5 sprints** with **zero duplication** and **100% alignment** with existing codebase.

**Reuse Rate:** 76% existing code | 24% new code
**Files to Create:** 8 new files
**Files to Enhance:** 6 existing files
**Files to Delete:** 0 (only deprecate routes)

---

## 🎯 SPRINT BREAKDOWN

### **SPRINT 1: Backend Foundation** (Day 1-2)

**Goal:** Build service layer + entitlements system + API endpoints

**Estimated Time:** 8-10 hours

#### **Tasks:**

1. **Create Service Layer Directory** (15 min)
   ```bash
   mkdir backend/services
   touch backend/services/README.md
   ```

2. **Create VisitorChatSubscription Model** (30 min)
   - File: `backend/models/VisitorChatSubscription.js`
   - Copy from: WORLD_CLASS_VISITOR_PROFILE_IMPLEMENTATION.md (lines 318-411)
   - Test: Model can be imported without errors

3. **Create Entitlements Service** (2 hours)
   - File: `backend/services/entitlements.service.js`
   - Copy from: WORLD_CLASS_VISITOR_PROFILE_IMPLEMENTATION.md (lines 418-622)
   - Test: Import in Node REPL, call methods with mock data

4. **Create ProfileBuilder Service** (2 hours)
   - File: `backend/services/profileBuilder.service.js`
   - Copy from: WORLD_CLASS_VISITOR_PROFILE_IMPLEMENTATION.md (lines 629-817)
   - Test: Build profile for existing business in DB

5. **Enhance Error Handler** (30 min)
   - File: `backend/middleware/errorHandler.js`
   - Add new error codes: PROFILE_NOT_FOUND, SUBSCRIPTION_REQUIRED, BUSINESS_NOT_PREMIUM
   - Test: Throw AppError and verify response format

6. **Create/Enhance Public Routes** (1 hour)
   - File: `backend/routes/publicRoutes.js`
   - Add: GET /api/v1/public/profile/:slug
   - Add: GET /api/v1/public/chat/entitlements/:businessId
   - Test: Curl endpoints, verify responses

7. **Integration Testing** (2 hours)
   - Test full flow: Owner saves → API returns → Visitor sees
   - Test entitlements: Free business, Premium business, Subscription checks
   - Fix any bugs found

#### **Deliverables:**
- ✅ 3 new service files
- ✅ 1 new model
- ✅ 2 new API endpoints
- ✅ All backend tests passing
- ✅ Postman collection with example requests

#### **Success Criteria:**
```bash
# Test profile builder
curl http://localhost:5000/api/v1/public/profile/test-slug
# Expected: 200 OK with profile data

# Test entitlements (requires auth)
curl http://localhost:5000/api/v1/public/chat/entitlements/business-id \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: 200 OK with permission data
```

---

### **SPRINT 2: Frontend Hooks & Utils** (Day 2-3)

**Goal:** Create reusable hooks for data fetching and permissions

**Estimated Time:** 4-6 hours

#### **Tasks:**

1. **Create Hooks Directory** (5 min)
   ```bash
   mkdir frontend/src/hooks
   ```

2. **Create usePublicProfile Hook** (1 hour)
   - File: `frontend/src/hooks/usePublicProfile.js`
   - Copy from: WORLD_CLASS_VISITOR_PROFILE_IMPLEMENTATION.md (lines 950-1017)
   - Test: Import in test component, verify data fetching

3. **Create useEntitlements Hook** (1 hour)
   - File: `frontend/src/hooks/useEntitlements.js`
   - Copy from: WORLD_CLASS_VISITOR_PROFILE_IMPLEMENTATION.md (lines 1025-1098)
   - Test: Call with business ID, verify permission checks

4. **Create useChatSubscription Hook** (1 hour)
   - File: `frontend/src/hooks/useChatSubscription.js`
   - Similar pattern to useEntitlements
   - Manages visitor's subscription status
   - Test: Check subscription, handle Stripe integration

5. **Reorganize Shared Components** (30 min)
   ```bash
   mkdir frontend/src/components/shared
   mkdir frontend/src/components/visitor

   # Move existing components
   mv frontend/src/components/MessageButton.jsx frontend/src/components/shared/
   mv frontend/src/components/promotions/PromotionBanner.jsx frontend/src/components/shared/
   mv frontend/src/components/reviews/ReviewList.jsx frontend/src/components/shared/
   ```

6. **Update Import Paths** (30 min)
   - Find all files importing MessageButton, PromotionBanner, ReviewList
   - Update paths to new `/shared` location
   - Test: Ensure no broken imports

#### **Deliverables:**
- ✅ 3 custom hooks
- ✅ Reorganized component structure
- ✅ Updated import paths
- ✅ Component README documentation

#### **Success Criteria:**
```javascript
// Test in browser console
const { profile, loading } = usePublicProfile('test-slug');
console.log(profile); // Should fetch and display profile

const { canSendMessage } = useEntitlements('business-id');
console.log(canSendMessage); // Should check permissions
```

---

### **SPRINT 3: Visitor Components** (Day 3-4)

**Goal:** Build all new visitor-specific UI components

**Estimated Time:** 6-8 hours

#### **Tasks:**

1. **Create MasonryGallery Component** (2 hours)
   - File: `frontend/src/components/visitor/MasonryGallery.jsx`
   - Features:
     - 3-column masonry layout (desktop), 2-column (mobile)
     - Free users: limit to 3 photos + "Upgrade to see more" overlay
     - Premium users: show all photos
     - Click to open lightbox
     - Before/after label support
   - Test: Render with 10 photos, verify free vs premium display

2. **Create StickyCTA Component** (1 hour)
   - File: `frontend/src/components/visitor/StickyCTA.jsx`
   - Features:
     - Fixed position at bottom of screen
     - Book Now button (pink gradient)
     - Message button (purple)
     - Call button (gray, small)
     - Responsive (stacks on mobile)
   - Test: Scroll page, verify always visible

3. **Create RatingSummaryBanner Component** (1 hour)
   - File: `frontend/src/components/visitor/RatingSummaryBanner.jsx`
   - Features:
     - Large rating number (4.8)
     - Gold star icons
     - Review count
     - Trust message: "4.7+ rating converts 3× better"
   - Test: Render with different ratings

4. **Create ChatSubscriptionPaywall Component** (2 hours)
   - File: `frontend/src/components/visitor/ChatSubscriptionPaywall.jsx`
   - Features:
     - Modal overlay
     - Pricing: $9.99/month
     - Feature list (unlimited messaging, read replies, etc.)
     - Stripe checkout button
     - "Maybe Later" close button
   - Test: Click message button, verify paywall shows

5. **Create FreeListingNotice Component** (30 min)
   - File: `frontend/src/components/visitor/FreeListingNotice.jsx`
   - Features:
     - Info box: "This business has a free listing"
     - Message: "Cannot reply to messages"
     - Suggestion: "Premium businesses can chat directly"
   - Test: Show on free business profile

#### **Deliverables:**
- ✅ 5 new visitor components
- ✅ Component documentation
- ✅ Storybook stories (optional)
- ✅ CSS styles

#### **Success Criteria:**
- All components render without errors
- Responsive on mobile/desktop
- Accessible (keyboard navigation, screen readers)
- Performance: <100ms render time

---

### **SPRINT 4: PublicProfile Page Enhancement** (Day 4-5)

**Goal:** Integrate all components into main visitor profile page

**Estimated Time:** 6-8 hours

#### **Tasks:**

1. **Read Current PublicProfile.jsx** (30 min)
   - File: `frontend/src/pages/PublicProfile.jsx`
   - Understand current structure
   - Identify sections to enhance vs keep

2. **Enhance PublicProfile.jsx - Hero Section** (1 hour)
   - Add premium gold badge (💎 Premium)
   - Add sticky CTAs
   - Differentiate free vs premium visually
   - Test: View as free vs premium business

3. **Enhance PublicProfile.jsx - Services Section** (30 min)
   - Add prominent "Book Now" CTAs on each service
   - Show pricing clearly
   - Test: Click service booking

4. **Enhance PublicProfile.jsx - Gallery Section** (1 hour)
   - Replace carousel with MasonryGallery component
   - Pass isPremium prop for free/premium differentiation
   - Test: Free user sees 3 photos + upgrade notice

5. **Enhance PublicProfile.jsx - Reviews Section** (1 hour)
   - Add RatingSummaryBanner at top
   - Keep existing ReviewList component
   - Prioritize photo reviews
   - Test: Reviews display correctly

6. **Enhance PublicProfile.jsx - Team Section** (30 min)
   - Add "Book with [Name]" buttons
   - Show specialties clearly
   - Test: Click staff booking

7. **Add StickyCTA Component** (30 min)
   - Import and render at bottom of page
   - Pass business data as props
   - Test: Scroll, verify always visible

8. **Add Free Listing Logic** (1 hour)
   - Check if business.listingType === 'free'
   - Show FreeListingNotice instead of MessageButton
   - Hide premium-only features
   - Test: Free business profile looks correct

9. **Integration Testing** (2 hours)
   - Test full visitor flow
   - Test all 7 sections render
   - Test booking flow
   - Test messaging flow
   - Test free vs premium differences
   - Fix any bugs

#### **Deliverables:**
- ✅ Enhanced PublicProfile.jsx with all 7 sections
- ✅ Free vs Premium differentiation working
- ✅ All CTAs functional
- ✅ Responsive design
- ✅ Screenshots of before/after

#### **Success Criteria:**
```bash
# Visit free business profile
http://localhost:3000/booking-profile/free-salon
# Expected: No message button, limited gallery, free listing notice

# Visit premium business profile
http://localhost:3000/booking-profile/premium-salon
# Expected: Message button, full gallery, sticky CTAs
```

---

### **SPRINT 5: Testing & Polish** (Day 5-7)

**Goal:** Comprehensive testing + bug fixes + documentation

**Estimated Time:** 8-10 hours

#### **Tasks:**

1. **Unit Tests** (3 hours)
   - Write tests from TESTING_STRATEGY.md
   - Run: `npm test -- --coverage`
   - Fix failing tests
   - Achieve >80% coverage

2. **Integration Tests** (2 hours)
   - Test API endpoints
   - Test data flow (owner → visitor)
   - Test entitlements logic
   - Test subscription flow

3. **E2E Tests** (2 hours)
   - Test user journeys with Cypress
   - Test booking flow
   - Test messaging + paywall
   - Test free vs premium experience

4. **Performance Optimization** (2 hours)
   - Run Lighthouse audit
   - Optimize images (lazy loading)
   - Minimize bundle size
   - Test page load time < 2s

5. **Bug Fixes** (2 hours)
   - Fix any issues found during testing
   - Handle edge cases
   - Improve error messages

6. **Documentation** (1 hour)
   - Update API documentation
   - Create component usage guide
   - Document error codes
   - Write deployment checklist

#### **Deliverables:**
- ✅ All tests passing
- ✅ >80% code coverage
- ✅ Performance score >90 (Lighthouse)
- ✅ Zero critical bugs
- ✅ Complete documentation

#### **Success Criteria:**
- All automated tests pass
- Manual QA approves
- Performance targets met
- Ready for production deployment

---

## 📊 PROGRESS TRACKING

### **Daily Standup Checklist**

**Day 1:**
- [ ] Backend services created
- [ ] API endpoints working
- [ ] Postman tests passing

**Day 2:**
- [ ] Frontend hooks created
- [ ] Component structure reorganized
- [ ] Import paths updated

**Day 3:**
- [ ] Visitor components built
- [ ] Styles applied
- [ ] Components tested in isolation

**Day 4:**
- [ ] PublicProfile.jsx enhanced
- [ ] All sections integrated
- [ ] Free vs premium working

**Day 5:**
- [ ] Unit tests written
- [ ] Integration tests passing
- [ ] E2E tests running

**Day 6:**
- [ ] Performance optimized
- [ ] Bugs fixed
- [ ] Documentation complete

**Day 7:**
- [ ] Final QA
- [ ] Staging deployment
- [ ] Production ready

---

## 🚨 RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Existing PublicProfile.jsx has breaking changes | Medium | High | Read file carefully first, test thoroughly |
| Chat system integration breaks | Low | Medium | Reuse existing MessageButton, minimal changes |
| Performance issues with large galleries | Medium | Medium | Implement lazy loading, optimize images |
| Stripe integration fails | Low | High | Use test mode, fallback to manual subscription |
| Mobile responsiveness issues | Medium | Medium | Test on real devices, use responsive design |

---

## ✅ DEFINITION OF DONE

A feature is "done" when:
- [ ] Code written and reviewed
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance targets met
- [ ] Documentation updated
- [ ] QA approved
- [ ] Deployed to staging
- [ ] Ready for production

---

## 🎯 FINAL DELIVERABLES

1. **Backend:**
   - 3 new services (entitlements, profileBuilder, subscription)
   - 1 new model (VisitorChatSubscription)
   - 2 new API endpoints

2. **Frontend:**
   - 3 custom hooks (usePublicProfile, useEntitlements, useChatSubscription)
   - 5 new components (MasonryGallery, StickyCTA, RatingSummaryBanner, ChatSubscriptionPaywall, FreeListingNotice)
   - 1 enhanced page (PublicProfile.jsx)

3. **Testing:**
   - 30+ unit tests
   - 10+ integration tests
   - 5+ E2E test scenarios

4. **Documentation:**
   - API contracts
   - Component usage guide
   - Error codes catalog
   - Deployment checklist

---

## 📞 DAILY SYNC POINTS

**End of Each Day:**
1. Review completed tasks
2. Demo working features
3. Discuss blockers
4. Plan next day

**Questions to Answer:**
- What did you complete today?
- What are you working on tomorrow?
- Any blockers or questions?

---

**Generated:** November 23, 2025
**Status:** Ready to execute
**Next Step:** Start Sprint 1 - Backend Foundation
