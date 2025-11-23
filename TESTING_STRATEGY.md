# 🧪 TESTING STRATEGY — Visitor Profile Feature

**Date:** November 23, 2025
**Feature:** Visitor Business Profile Page + Pay-to-Chat System
**Scope:** Backend + Frontend + Integration + E2E

---

## 🎯 TESTING OBJECTIVES

1. **Ensure data integrity** - What owner saves = What visitor sees
2. **Validate entitlements** - Free/Premium/Subscription logic works correctly
3. **Prevent regressions** - Existing features still work
4. **Performance validation** - Page loads < 2 seconds
5. **Security verification** - No unauthorized access

---

## 📋 TESTING PHASES

### **Phase 1: Unit Tests (Backend)**

#### **1.1 Service Layer Tests**

**File:** `backend/tests/services/entitlements.service.test.js`

```javascript
/**
 * Entitlements Service Tests
 *
 * Tests the SSOT for all permission logic
 */

const EntitlementsService = require('../../services/entitlements.service');
const Business = require('../../models/Business');
const ChatThread = require('../../models/ChatThread');
const VisitorChatSubscription = require('../../models/VisitorChatSubscription');

describe('EntitlementsService', () => {

  describe('canSendMessage', () => {

    it('should ALLOW first message to premium business', async () => {
      // Setup
      const visitorId = 'visitor123';
      const businessId = 'business456';

      // Mock premium business
      Business.findById = jest.fn().mockResolvedValue({
        _id: businessId,
        listingType: 'premium',
        premiumSubscription: { active: true }
      });

      // Mock no existing thread
      ChatThread.findOne = jest.fn().mockResolvedValue(null);

      // Execute
      const result = await EntitlementsService.canSendMessage(visitorId, businessId);

      // Assert
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('FIRST_MESSAGE_FREE');
    });

    it('should BLOCK message to free business', async () => {
      // Setup
      const visitorId = 'visitor123';
      const businessId = 'business456';

      // Mock free business
      Business.findById = jest.fn().mockResolvedValue({
        _id: businessId,
        listingType: 'free'
      });

      // Execute
      const result = await EntitlementsService.canSendMessage(visitorId, businessId);

      // Assert
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('BUSINESS_NOT_PREMIUM');
      expect(result.message).toContain('free listing');
    });

    it('should ALLOW message with active subscription', async () => {
      // Setup
      const visitorId = 'visitor123';
      const businessId = 'business456';

      // Mock premium business
      Business.findById = jest.fn().mockResolvedValue({
        listingType: 'premium',
        premiumSubscription: { active: true }
      });

      // Mock existing thread (not first message)
      ChatThread.findOne = jest.fn().mockResolvedValue({
        messages: [{ senderId: visitorId, text: 'First message' }]
      });

      // Mock active subscription
      VisitorChatSubscription.findOne = jest.fn().mockResolvedValue({
        visitorId,
        status: 'active',
        isActive: () => true
      });

      // Execute
      const result = await EntitlementsService.canSendMessage(visitorId, businessId);

      // Assert
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('HAS_SUBSCRIPTION');
    });

    it('should REQUIRE subscription for second message', async () => {
      // Setup
      const visitorId = 'visitor123';
      const businessId = 'business456';

      // Mock premium business
      Business.findById = jest.fn().mockResolvedValue({
        listingType: 'premium',
        premiumSubscription: { active: true }
      });

      // Mock existing thread
      ChatThread.findOne = jest.fn().mockResolvedValue({
        messages: [{ senderId: visitorId, text: 'First message' }]
      });

      // Mock NO subscription
      VisitorChatSubscription.findOne = jest.fn().mockResolvedValue(null);

      // Execute
      const result = await EntitlementsService.canSendMessage(visitorId, businessId);

      // Assert
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('SUBSCRIPTION_REQUIRED');
      expect(result.requiresSubscription).toBe(true);
      expect(result.pricing.monthly).toBe(9.99);
    });
  });

  describe('canReadReplies', () => {

    it('should ALLOW reading when no owner replies', async () => {
      const visitorId = 'visitor123';
      const threadId = 'thread789';

      // Mock thread with only visitor message
      ChatThread.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          messages: [
            { senderId: visitorId, text: 'Hello' }
          ],
          businessId: { owner: 'owner123' }
        })
      });

      const result = await EntitlementsService.canReadReplies(visitorId, threadId);

      expect(result.allowed).toBe(true);
      expect(result.blurredCount).toBe(0);
    });

    it('should BLUR replies without subscription', async () => {
      const visitorId = 'visitor123';
      const threadId = 'thread789';
      const ownerId = 'owner123';

      // Mock thread with owner reply
      ChatThread.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          messages: [
            { senderId: visitorId, text: 'Hello' },
            { senderId: ownerId, text: 'Hi there!' }
          ],
          businessId: { owner: ownerId }
        })
      });

      // No subscription
      VisitorChatSubscription.findOne = jest.fn().mockResolvedValue(null);

      const result = await EntitlementsService.canReadReplies(visitorId, threadId);

      expect(result.allowed).toBe(false);
      expect(result.blurredCount).toBe(1);
      expect(result.message).toContain('$9.99/month');
    });
  });
});
```

**File:** `backend/tests/services/profileBuilder.service.test.js`

```javascript
/**
 * ProfileBuilder Service Tests
 */

const ProfileBuilderService = require('../../services/profileBuilder.service');
const Business = require('../../models/Business');
const Review = require('../../models/Review');

describe('ProfileBuilderService', () => {

  describe('buildProfile', () => {

    it('should build complete profile for premium business', async () => {
      // Mock business data
      const mockBusiness = {
        _id: 'business123',
        slug: 'sunset-salon-dallas',
        name: 'Sunset Hair Salon',
        description: 'Best salon in Dallas',
        businessType: 'salon',
        listingType: 'premium',
        premiumSubscription: { active: true },
        verificationStatus: 'fully_verified',
        images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
        services: [
          { name: 'Haircut', price: 50, duration: 60 }
        ],
        staff: [
          { name: 'Sarah', role: 'Senior Stylist' }
        ],
        hours: {
          monday: { open: '09:00', close: '18:00', closed: false }
        },
        owner: { email: 'owner@test.com' }
      };

      Business.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockBusiness)
        })
      });

      // Mock reviews
      Review.aggregate = jest.fn().mockResolvedValue([
        { average: 4.8, count: 25 }
      ]);

      Review.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });

      // Execute
      const profile = await ProfileBuilderService.buildProfile('sunset-salon-dallas');

      // Assert
      expect(profile.name).toBe('Sunset Hair Salon');
      expect(profile.listingType).toBe('premium');
      expect(profile.isPremium).toBe(true);
      expect(profile.services).toHaveLength(1);
      expect(profile.team).toHaveLength(1);
      expect(profile.rating.average).toBe(4.8);
      expect(profile.rating.count).toBe(25);
    });

    it('should throw error for inactive business', async () => {
      Business.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null)
        })
      });

      await expect(
        ProfileBuilderService.buildProfile('non-existent')
      ).rejects.toThrow('PROFILE_NOT_FOUND');
    });

    it('should correctly differentiate free vs premium', async () => {
      const freeBusiness = {
        slug: 'free-salon',
        listingType: 'free',
        images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'],
        owner: { email: 'test@test.com' }
      };

      Business.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(freeBusiness)
        })
      });

      Review.aggregate = jest.fn().mockResolvedValue([]);
      Review.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });

      const profile = await ProfileBuilderService.buildProfile('free-salon');

      expect(profile.isPremium).toBe(false);
      expect(profile.listingType).toBe('free');
    });
  });

  describe('_calculateOpenStatus', () => {

    it('should return true when business is open', () => {
      const now = new Date();
      const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];

      const hours = {
        [currentDay]: {
          open: '09:00',
          close: '18:00',
          closed: false
        }
      };

      // Set current time to 12:00 (within business hours)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(12);
      jest.spyOn(Date.prototype, 'getMinutes').mockReturnValue(0);

      const isOpen = ProfileBuilderService._calculateOpenStatus(hours);

      expect(isOpen).toBe(true);
    });

    it('should return false when business is closed', () => {
      const now = new Date();
      const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];

      const hours = {
        [currentDay]: {
          closed: true
        }
      };

      const isOpen = ProfileBuilderService._calculateOpenStatus(hours);

      expect(isOpen).toBe(false);
    });
  });
});
```

---

### **Phase 2: API Integration Tests**

**File:** `backend/tests/integration/publicProfile.test.js`

```javascript
/**
 * Public Profile API Integration Tests
 */

const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const Business = require('../../models/Business');
const Review = require('../../models/Review');

describe('Public Profile API', () => {

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    // Cleanup and disconnect
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await Business.deleteMany({});
    await Review.deleteMany({});
  });

  describe('GET /api/v1/public/profile/:slug', () => {

    it('should return 200 and profile data for existing business', async () => {
      // Create test business
      const business = await Business.create({
        slug: 'test-salon',
        name: 'Test Salon',
        description: 'Test description',
        businessType: 'salon',
        listingType: 'premium',
        status: 'active',
        owner: new mongoose.Types.ObjectId()
      });

      const response = await request(app)
        .get('/api/v1/public/profile/test-salon')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Salon');
      expect(response.body.data.slug).toBe('test-salon');
    });

    it('should return 404 for non-existent business', async () => {
      const response = await request(app)
        .get('/api/v1/public/profile/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PROFILE_NOT_FOUND');
    });

    it('should return 404 for inactive business', async () => {
      await Business.create({
        slug: 'inactive-salon',
        name: 'Inactive Salon',
        status: 'inactive',
        owner: new mongoose.Types.ObjectId()
      });

      const response = await request(app)
        .get('/api/v1/public/profile/inactive-salon')
        .expect(404);

      expect(response.body.error.code).toBe('PROFILE_NOT_FOUND');
    });

    it('should include aggregated rating from reviews', async () => {
      const business = await Business.create({
        slug: 'rated-salon',
        name: 'Rated Salon',
        status: 'active',
        owner: new mongoose.Types.ObjectId()
      });

      // Create reviews
      await Review.create([
        { businessId: business._id, rating: 5, status: 'approved', userId: new mongoose.Types.ObjectId() },
        { businessId: business._id, rating: 4, status: 'approved', userId: new mongoose.Types.ObjectId() },
        { businessId: business._id, rating: 5, status: 'approved', userId: new mongoose.Types.ObjectId() }
      ]);

      const response = await request(app)
        .get('/api/v1/public/profile/rated-salon')
        .expect(200);

      expect(response.body.data.rating.average).toBeCloseTo(4.7, 1);
      expect(response.body.data.rating.count).toBe(3);
    });

    it('should only include approved reviews', async () => {
      const business = await Business.create({
        slug: 'reviewed-salon',
        name: 'Reviewed Salon',
        status: 'active',
        owner: new mongoose.Types.ObjectId()
      });

      await Review.create([
        { businessId: business._id, rating: 5, status: 'approved', userId: new mongoose.Types.ObjectId() },
        { businessId: business._id, rating: 1, status: 'pending', userId: new mongoose.Types.ObjectId() },
        { businessId: business._id, rating: 1, status: 'rejected', userId: new mongoose.Types.ObjectId() }
      ]);

      const response = await request(app)
        .get('/api/v1/public/profile/reviewed-salon')
        .expect(200);

      expect(response.body.data.rating.count).toBe(1);
      expect(response.body.data.rating.average).toBe(5);
    });
  });

  describe('GET /api/v1/public/chat/entitlements/:businessId', () => {

    it('should require authentication', async () => {
      const businessId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/public/chat/entitlements/${businessId}`)
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return entitlements for authenticated visitor', async () => {
      // Create test business
      const business = await Business.create({
        name: 'Premium Salon',
        listingType: 'premium',
        premiumSubscription: { active: true },
        owner: new mongoose.Types.ObjectId()
      });

      // Login as visitor and get token
      const visitorToken = 'test-jwt-token'; // Mock JWT

      const response = await request(app)
        .get(`/api/v1/public/chat/entitlements/${business._id}`)
        .set('Authorization', `Bearer ${visitorToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('allowed');
      expect(response.body.data).toHaveProperty('reason');
    });
  });
});
```

---

### **Phase 3: Frontend Component Tests**

**File:** `frontend/src/hooks/__tests__/usePublicProfile.test.js`

```javascript
/**
 * usePublicProfile Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react';
import { usePublicProfile } from '../usePublicProfile';
import axios from '../../api/axios';

jest.mock('../../api/axios');

describe('usePublicProfile', () => {

  it('should fetch profile successfully', async () => {
    const mockProfile = {
      slug: 'test-salon',
      name: 'Test Salon',
      isPremium: true
    };

    axios.get.mockResolvedValue({
      data: { data: mockProfile }
    });

    const { result } = renderHook(() => usePublicProfile('test-salon'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.error).toBeNull();
  });

  it('should handle 404 error', async () => {
    axios.get.mockRejectedValue({
      response: {
        status: 404,
        data: {
          error: {
            code: 'PROFILE_NOT_FOUND',
            message: 'Profile not found'
          }
        }
      }
    });

    const { result } = renderHook(() => usePublicProfile('non-existent'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.error.code).toBe('PROFILE_NOT_FOUND');
  });

  it('should refetch when slug changes', async () => {
    const mockProfile1 = { slug: 'salon-1', name: 'Salon 1' };
    const mockProfile2 = { slug: 'salon-2', name: 'Salon 2' };

    axios.get
      .mockResolvedValueOnce({ data: { data: mockProfile1 } })
      .mockResolvedValueOnce({ data: { data: mockProfile2 } });

    const { result, rerender } = renderHook(
      ({ slug }) => usePublicProfile(slug),
      { initialProps: { slug: 'salon-1' } }
    );

    await waitFor(() => {
      expect(result.current.profile.name).toBe('Salon 1');
    });

    rerender({ slug: 'salon-2' });

    await waitFor(() => {
      expect(result.current.profile.name).toBe('Salon 2');
    });
  });
});
```

---

### **Phase 4: E2E Tests (Cypress/Playwright)**

**File:** `cypress/e2e/visitorProfile.cy.js`

```javascript
/**
 * Visitor Profile E2E Tests
 */

describe('Visitor Profile Page', () => {

  beforeEach(() => {
    // Seed test database with business
    cy.task('db:seed', {
      businesses: [
        {
          slug: 'sunset-salon',
          name: 'Sunset Hair Salon',
          listingType: 'premium',
          services: [
            { name: 'Haircut', price: 50, duration: 60 }
          ]
        }
      ]
    });
  });

  it('should display business profile correctly', () => {
    cy.visit('/booking-profile/sunset-salon');

    // Check hero section
    cy.contains('h1', 'Sunset Hair Salon').should('be.visible');
    cy.get('.verified-badge').should('exist');

    // Check services section
    cy.contains('Services').should('be.visible');
    cy.contains('Haircut').should('be.visible');
    cy.contains('$50').should('be.visible');

    // Check CTAs
    cy.contains('Book Appointment').should('be.visible');
    cy.contains('Send Message').should('be.visible');
  });

  it('should open booking modal when clicking Book Now', () => {
    cy.visit('/booking-profile/sunset-salon');

    cy.contains('Book Appointment').click();

    cy.url().should('include', '/book/sunset-salon');
  });

  it('should show chat paywall for non-subscribed visitor', () => {
    // Login as visitor without subscription
    cy.login('visitor@test.com', 'password');

    cy.visit('/booking-profile/sunset-salon');

    // Try to message
    cy.contains('Send Message').click();

    // Should show paywall
    cy.contains('$9.99/month').should('be.visible');
    cy.contains('Unlimited messaging').should('be.visible');
  });

  it('should show free listing notice for free businesses', () => {
    // Create free business
    cy.task('db:seed', {
      businesses: [
        {
          slug: 'free-salon',
          name: 'Free Salon',
          listingType: 'free'
        }
      ]
    });

    cy.visit('/booking-profile/free-salon');

    cy.contains('Send Message').should('not.exist');
    cy.contains('free listing').should('be.visible');
    cy.contains('cannot reply to messages').should('be.visible');
  });

  it('should load page within 2 seconds', () => {
    const start = Date.now();

    cy.visit('/booking-profile/sunset-salon');

    cy.get('h1').should('be.visible').then(() => {
      const loadTime = Date.now() - start;
      expect(loadTime).to.be.lessThan(2000);
    });
  });
});
```

---

## ✅ TEST EXECUTION PLAN

### **Step 1: Run Unit Tests**

```bash
# Backend unit tests
cd backend
npm test -- --coverage

# Expected: All tests pass, >80% coverage
```

### **Step 2: Run Integration Tests**

```bash
# API integration tests
cd backend
npm run test:integration

# Expected: All endpoints return correct responses
```

### **Step 3: Run Frontend Tests**

```bash
# Frontend component tests
cd frontend
npm test -- --coverage

# Expected: All hooks and components work correctly
```

### **Step 4: Run E2E Tests**

```bash
# Full user flow tests
npm run test:e2e

# Expected: All user journeys work end-to-end
```

---

## 📊 TESTING CHECKLIST

### **Backend Testing**
- [ ] Entitlements Service - All permission rules work
- [ ] ProfileBuilder Service - Correct data transformation
- [ ] Public Profile API - Returns 200 for valid slug
- [ ] Public Profile API - Returns 404 for invalid slug
- [ ] Chat Entitlements API - Requires authentication
- [ ] Chat Entitlements API - Returns correct permissions
- [ ] Rating aggregation - Calculates average correctly
- [ ] Review filtering - Only shows approved reviews
- [ ] Open/closed status - Calculates correctly

### **Frontend Testing**
- [ ] usePublicProfile - Fetches data successfully
- [ ] usePublicProfile - Handles errors gracefully
- [ ] useEntitlements - Checks permissions correctly
- [ ] PublicProfile page - Renders all 7 sections
- [ ] MessageButton - Shows for premium businesses only
- [ ] MessageButton - Shows paywall when needed
- [ ] MasonryGallery - Limits free users to 3 photos
- [ ] StickyCTA - Always visible while scrolling

### **Integration Testing**
- [ ] Owner saves data → Visitor sees exact same data
- [ ] Free business → No message button
- [ ] Premium business → Message button visible
- [ ] First message → Always free
- [ ] Second message → Requires subscription
- [ ] Owner reply → Blurred without subscription

### **Performance Testing**
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] Image loading optimized
- [ ] No memory leaks
- [ ] Mobile performance acceptable

### **Security Testing**
- [ ] Unauthenticated users can't access entitlements
- [ ] Visitor can't see other visitor's subscriptions
- [ ] Business owner can't impersonate visitor
- [ ] SQL injection prevented
- [ ] XSS attacks prevented

---

## 🚀 NEXT STEPS AFTER TESTING

Once all tests pass:

1. **Code Review** - Peer review all new code
2. **QA Testing** - Manual testing by QA team
3. **Staging Deployment** - Deploy to staging environment
4. **UAT** - User acceptance testing with real owners/visitors
5. **Production Deployment** - Gradual rollout to production
6. **Monitoring** - Track metrics and errors

---

## 📈 SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Coverage | >80% | Jest coverage report |
| All Tests Passing | 100% | CI/CD pipeline |
| Page Load Time | <2s | Lighthouse/GTmetrix |
| API Response Time | <500ms | Backend logs |
| Zero Critical Bugs | 0 | Bug tracker |

---

**Generated:** November 23, 2025
**Status:** Ready for test execution
