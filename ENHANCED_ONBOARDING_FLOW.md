# Enhanced Onboarding Flow - Free vs Premium Selection

## Overview

This enhanced flow gives business owners a clear choice between **Free Listing** and **Premium Listing** right at the start, before they fill in any business details.

---

## User Flow

### **Step 1: Plan Selection (New)**
When a business owner first visits "My Business" page:
- They see a **split-screen choice**: Free on the left, Premium on the right
- Each option shows what's included
- They click to select their path
- The rest of the form appears below their selection

### **Step 2: Free Listing Path**
If they choose **Free**:
- Fill in basic business info (name, address, etc.)
- Upload photos
- Complete basic verification steps
- Get "Unverified" badge → upgrade to "Basic Verified" once steps complete
- Can upgrade to Premium later from their dashboard

### **Step 3: Premium Listing Path**
If they choose **Premium**:
- Fill in business info (same as free)
- **Plus**: Immediate prompt to subscribe ($29/month)
- **Plus**: Prompt to connect Stripe for payments
- Get "Premium Verified" badge once all steps complete
- Enjoy top placement, premium badge, and payment processing

---

## Component Architecture

### **New Component: PlanSelectionCard**

**Purpose**: Show Free vs Premium choice at the top of My Business page (for new users only)

**File**: `frontend/src/components/PlanSelectionCard.jsx`

```jsx
import React from 'react';
import './PlanSelectionCard.css';

const PlanSelectionCard = ({ onSelectPlan, currentPlan }) => {
  return (
    <div className="plan-selection">
      <div className="plan-selection__header">
        <h2>Choose Your Listing Type</h2>
        <p>Select how you want to appear in the directory</p>
      </div>

      <div className="plan-selection__cards">
        {/* FREE LISTING CARD */}
        <div
          className={`plan-card ${currentPlan === 'free' ? 'plan-card--selected' : ''}`}
          onClick={() => onSelectPlan('free')}
        >
          <div className="plan-card__badge plan-card__badge--free">Free</div>
          <h3>Free Listing</h3>
          <div className="plan-card__price">
            <span className="plan-card__amount">$0</span>
            <span className="plan-card__period">/month</span>
          </div>

          <div className="plan-card__features">
            <div className="plan-card__feature">
              <span className="plan-card__check">✓</span>
              <span>Basic directory listing</span>
            </div>
            <div className="plan-card__feature">
              <span className="plan-card__check">✓</span>
              <span>Business profile page</span>
            </div>
            <div className="plan-card__feature">
              <span className="plan-card__check">✓</span>
              <span>Upload photos</span>
            </div>
            <div className="plan-card__feature">
              <span className="plan-card__check">✓</span>
              <span>Customer reviews</span>
            </div>
            <div className="plan-card__feature plan-card__feature--disabled">
              <span className="plan-card__cross">✗</span>
              <span>Top search placement</span>
            </div>
            <div className="plan-card__feature plan-card__feature--disabled">
              <span className="plan-card__cross">✗</span>
              <span>Premium badge</span>
            </div>
            <div className="plan-card__feature plan-card__feature--disabled">
              <span className="plan-card__cross">✗</span>
              <span>Online payments</span>
            </div>
          </div>

          <button
            className={`plan-card__button ${
              currentPlan === 'free' ? 'plan-card__button--selected' : ''
            }`}
          >
            {currentPlan === 'free' ? '✓ Selected' : 'Choose Free'}
          </button>

          <p className="plan-card__note">
            Perfect for getting started. Upgrade to Premium anytime.
          </p>
        </div>

        {/* PREMIUM LISTING CARD */}
        <div
          className={`plan-card plan-card--premium ${
            currentPlan === 'premium' ? 'plan-card--selected' : ''
          }`}
          onClick={() => onSelectPlan('premium')}
        >
          <div className="plan-card__badge plan-card__badge--premium">Recommended</div>
          <h3>Premium Listing</h3>
          <div className="plan-card__price">
            <span className="plan-card__amount">$29</span>
            <span className="plan-card__period">/month</span>
          </div>

          <div className="plan-card__features">
            <div className="plan-card__feature">
              <span className="plan-card__check plan-card__check--premium">✓</span>
              <span><strong>Everything in Free, plus:</strong></span>
            </div>
            <div className="plan-card__feature">
              <span className="plan-card__check plan-card__check--premium">✓</span>
              <span>🔝 Top search placement</span>
            </div>
            <div className="plan-card__feature">
              <span className="plan-card__check plan-card__check--premium">✓</span>
              <span>💎 Premium verified badge</span>
            </div>
            <div className="plan-card__feature">
              <span className="plan-card__check plan-card__check--premium">✓</span>
              <span>💳 Accept online payments</span>
            </div>
            <div className="plan-card__feature">
              <span className="plan-card__check plan-card__check--premium">✓</span>
              <span>📊 Advanced analytics</span>
            </div>
            <div className="plan-card__feature">
              <span className="plan-card__check plan-card__check--premium">✓</span>
              <span>⚡ Priority support</span>
            </div>
            <div className="plan-card__feature">
              <span className="plan-card__check plan-card__check--premium">✓</span>
              <span>🎯 Featured in promotions</span>
            </div>
          </div>

          <button
            className={`plan-card__button plan-card__button--premium ${
              currentPlan === 'premium' ? 'plan-card__button--selected' : ''
            }`}
          >
            {currentPlan === 'premium' ? '✓ Selected' : 'Choose Premium'}
          </button>

          <p className="plan-card__note">
            <strong>Get 3x more bookings.</strong> Cancel anytime.
          </p>
        </div>
      </div>

      {currentPlan && (
        <div className="plan-selection__confirmation">
          <p>
            ✓ You selected <strong>{currentPlan === 'free' ? 'Free Listing' : 'Premium Listing'}</strong>.
            Continue below to set up your business profile.
          </p>
        </div>
      )}
    </div>
  );
};

export default PlanSelectionCard;
```

---

## Styling

**File**: `frontend/src/components/PlanSelectionCard.css`

```css
/* Plan Selection Component Styles */

.plan-selection {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 32px;
}

.plan-selection__header {
  text-align: center;
  margin-bottom: 32px;
}

.plan-selection__header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.plan-selection__header p {
  margin: 0;
  font-size: 16px;
  color: #64748b;
}

.plan-selection__cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.plan-card {
  position: relative;
  padding: 32px 24px;
  background: #f8fafc;
  border: 3px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.plan-card--premium {
  background: linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%);
  border-color: #E91E63;
}

.plan-card--selected {
  border-color: #3b82f6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
  transform: translateY(-4px);
}

.plan-card--premium.plan-card--selected {
  border-color: #E91E63;
  box-shadow: 0 8px 24px rgba(233, 30, 99, 0.3);
}

.plan-card__badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-card__badge--free {
  background: #e2e8f0;
  color: #64748b;
}

.plan-card__badge--premium {
  background: linear-gradient(135deg, #E91E63 0%, #F06292 100%);
  color: white;
}

.plan-card h3 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.plan-card__price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 24px;
}

.plan-card__amount {
  font-size: 48px;
  font-weight: 700;
  color: #0f172a;
}

.plan-card--premium .plan-card__amount {
  color: #E91E63;
}

.plan-card__period {
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
}

.plan-card__features {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
  min-height: 280px;
}

.plan-card__feature {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: #0f172a;
}

.plan-card__feature--disabled {
  color: #94a3b8;
}

.plan-card__check {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;
}

.plan-card__check--premium {
  background: linear-gradient(135deg, #E91E63 0%, #F06292 100%);
  color: white;
}

.plan-card__cross {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #94a3b8;
  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;
}

.plan-card__button {
  width: 100%;
  padding: 16px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.plan-card__button:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.plan-card__button--premium {
  background: linear-gradient(135deg, #E91E63 0%, #F06292 100%);
}

.plan-card__button--premium:hover {
  background: linear-gradient(135deg, #C2185B 0%, #E91E63 100%);
}

.plan-card__button--selected {
  background: #16a34a;
}

.plan-card__button--selected:hover {
  background: #15803d;
}

.plan-card__note {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  text-align: center;
}

.plan-card--premium .plan-card__note strong {
  color: #E91E63;
}

.plan-selection__confirmation {
  padding: 16px 24px;
  background: #dcfce7;
  border: 2px solid #86efac;
  border-radius: 12px;
  text-align: center;
}

.plan-selection__confirmation p {
  margin: 0;
  font-size: 16px;
  color: #166534;
}

.plan-selection__confirmation strong {
  color: #15803d;
}

@media (max-width: 1024px) {
  .plan-selection__cards {
    grid-template-columns: 1fr;
  }

  .plan-card__features {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .plan-selection {
    padding: 24px 16px;
  }

  .plan-card {
    padding: 24px 16px;
  }

  .plan-card__amount {
    font-size: 36px;
  }
}
```

---

## Updated OwnerMyBusiness Integration

**Modify**: `frontend/src/components/OwnerMyBusiness.jsx`

**Add these changes:**

### 1. Import the new component (at top)
```jsx
import PlanSelectionCard from "./PlanSelectionCard";
```

### 2. Add state for selected plan (in component)
```jsx
const [selectedPlan, setSelectedPlan] = useState(null);
const [hasExistingBusiness, setHasExistingBusiness] = useState(false);
```

### 3. Update loadBusiness to check if business exists
```jsx
const loadBusiness = async () => {
  try {
    const { data } = await ownerApi.get("/business");
    if (data && data._id) {
      setHasExistingBusiness(true); // They already have a business
      setBusinessId(data._id);
      setBusinessSlug(data.slug || data.bookingSlug);
      setStripeConnected(data.verificationSteps?.stripeConnected || false);
      // ... rest of existing code
    } else {
      setHasExistingBusiness(false); // New user
    }
  } catch (error) {
    console.error("Failed to load business", error);
    setHasExistingBusiness(false); // Treat error as new user
  }
};
```

### 4. Add handler for plan selection
```jsx
const handlePlanSelection = (plan) => {
  setSelectedPlan(plan);

  // Scroll down to business form
  setTimeout(() => {
    const formElement = document.querySelector('.owner-business-page__card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};
```

### 5. Update JSX to show plan selection for new users

Replace the existing return statement structure with:

```jsx
return (
  <section className="owner-business-page">
    <header className="owner-business-page__header">
      <h1>My Business + Social Feed</h1>
      <p>Keep your listing polished and publish engaging content in one place.</p>
    </header>

    {/* Business Status Banner */}
    {businessStatus && (
      <div style={{/* existing status banner code */}}>
        {/* ... existing code ... */}
      </div>
    )}

    {/* PLAN SELECTION - Show only for NEW users */}
    {!hasExistingBusiness && !selectedPlan && (
      <PlanSelectionCard
        onSelectPlan={handlePlanSelection}
        currentPlan={selectedPlan}
      />
    )}

    {/* Show this confirmation if they selected a plan */}
    {!hasExistingBusiness && selectedPlan && (
      <div style={{
        padding: '16px 24px',
        marginBottom: '24px',
        background: '#dcfce7',
        border: '2px solid #86efac',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '16px', color: '#166534' }}>
          ✓ You selected <strong>{selectedPlan === 'free' ? 'Free Listing' : 'Premium Listing'}</strong>.
          {selectedPlan === 'premium' && ' After saving your business info, you\'ll be prompted to subscribe and connect Stripe.'}
        </p>
      </div>
    )}

    {/* ONLY show the rest if they've selected a plan OR already have a business */}
    {(hasExistingBusiness || selectedPlan) && (
      <>
        {/* Enhanced 3-Tier Verification Status Banner */}
        {businessId && (
          <div style={{ marginBottom: '32px' }}>
            <VerificationStatusBanner businessId={businessId} />
          </div>
        )}

        {/* Verification Progress Checklist */}
        {businessId && (
          <div style={{ marginBottom: '32px' }}>
            <VerificationProgress businessId={businessId} />
          </div>
        )}

        {/* Premium Subscription Card - Show if they chose premium OR already have a business */}
        {businessId && (selectedPlan === 'premium' || hasExistingBusiness) && (
          <div style={{ marginBottom: '32px' }}>
            <PremiumSubscription businessId={businessId} />
          </div>
        )}

        {/* Stripe Connect Card - Show if they chose premium OR already have a business */}
        {businessId && (selectedPlan === 'premium' || hasExistingBusiness) && (
          <div style={{ marginBottom: '32px' }}>
            <StripeConnectCard businessId={businessId} />
          </div>
        )}

        {/* Booking URL Preview */}
        {businessId && (
          <div style={{ marginBottom: '32px' }}>
            <BookingURLPreview
              businessId={businessId}
              businessSlug={businessSlug}
              stripeConnected={stripeConnected}
            />
          </div>
        )}

        {/* Rest of existing content (business form, gallery, posts, etc.) */}
        {/* ... all existing code below this ... */}
      </>
    )}
  </section>
);
```

---

## Flow Logic Summary

### For **New Users** (no existing business):
1. Land on My Business page
2. See **PlanSelectionCard** with Free vs Premium choice
3. Click to select a plan
4. Plan selection confirmed, scroll down to business form
5. Fill in business details
6. Submit form (creates business in database with `hasExistingBusiness = true`)
7. **If Free**: See basic verification steps only
8. **If Premium**: See premium subscription + Stripe connect cards immediately

### For **Existing Users** (already have a business):
1. Land on My Business page
2. **Skip** plan selection (already chosen)
3. See all existing components:
   - Verification status banner
   - Verification progress
   - Premium subscription card (can upgrade anytime)
   - Stripe connect card
   - Booking URL
   - Business form
   - Gallery, posts, feed

---

## Benefits of This Approach

✅ **Clear Choice**: Users explicitly choose their path upfront
✅ **No Confusion**: Free vs Premium is crystal clear from the start
✅ **Smooth Upgrade Path**: Free users can upgrade to Premium anytime
✅ **Better Onboarding**: New users aren't overwhelmed with options
✅ **Existing Users Unaffected**: No change to their current experience
✅ **Visual Appeal**: Side-by-side comparison makes Premium value obvious

---

## Next Steps

1. **Create PlanSelectionCard.jsx** (copy code above)
2. **Create PlanSelectionCard.css** (copy CSS above)
3. **Update OwnerMyBusiness.jsx** with the changes shown
4. **Test the flow**:
   - Create a new business owner account
   - Verify plan selection appears
   - Choose Free → verify correct components show
   - Choose Premium → verify premium components show
   - Login as existing user → verify no plan selection appears

---

**This creates a clear, professional onboarding experience that guides users to the right plan for their needs!** 🎉
