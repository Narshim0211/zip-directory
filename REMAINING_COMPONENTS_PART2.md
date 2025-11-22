# Remaining Frontend Components - Part 2

Continuation of component code...

---

## File 4: StripeConnectCard.css
**Path**: `frontend/src/components/StripeConnectCard.css`

```css
/* Stripe Connect Card Component Styles */

.stripe-connect-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.stripe-connect-card--loading {
  text-align: center;
  padding: 48px 32px;
  color: #64748b;
}

.stripe-connect-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.stripe-connect-card__header h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.stripe-connect-card__subtitle {
  margin: 0;
  font-size: 15px;
  color: #64748b;
}

.stripe-connect-card__status {
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.stripe-connect-card__status--connected {
  background: #dcfce7;
  color: #16a34a;
}

.stripe-connect-card__status--disconnected {
  background: #f1f5f9;
  color: #64748b;
}

.stripe-connect-card__content {
  margin-bottom: 0;
}

.stripe-connect-card__benefits h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.stripe-connect-card__benefits ul {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  display: grid;
  gap: 12px;
}

.stripe-connect-card__benefits li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.benefit-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  font-size: 20px;
}

.stripe-connect-card__benefits strong {
  display: block;
  margin-bottom: 4px;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.stripe-connect-card__benefits p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.stripe-connect-card__commission {
  padding: 16px;
  background: #fef3c7;
  border-radius: 8px;
  margin-bottom: 24px;
}

.stripe-connect-card__commission p {
  margin: 0;
  font-size: 14px;
  color: #78350f;
}

.stripe-connect-card__cta {
  width: 100%;
  padding: 16px 32px;
  background: linear-gradient(135deg, #635BFF 0%, #8B85FF 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stripe-connect-card__cta:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(99, 91, 255, 0.3);
}

.stripe-connect-card__cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stripe-connect-card__note {
  margin-top: 12px;
  font-size: 13px;
  color: #64748b;
  text-align: center;
}

.stripe-connect-card__connected {
  padding: 24px;
  background: #f0fdf4;
  border-radius: 12px;
  border: 2px solid #86efac;
  margin-bottom: 16px;
}

.stripe-status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stripe-status-item {
  padding: 16px;
  background: white;
  border-radius: 8px;
  text-align: center;
}

.stripe-status-label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.stripe-status-value {
  display: block;
  font-size: 15px;
  font-weight: 700;
}

.stripe-status-value.enabled {
  color: #16a34a;
}

.stripe-status-value.disabled {
  color: #eab308;
}

.stripe-connect-card__warning {
  padding: 16px;
  background: #fef3c7;
  border: 2px solid #eab308;
  border-radius: 12px;
  margin-bottom: 16px;
}

.stripe-connect-card__warning p {
  margin: 0 0 12px 0;
  color: #78350f;
  font-size: 14px;
}

.stripe-connect-card__success {
  padding: 16px;
  background: #dcfce7;
  border-radius: 12px;
  margin-bottom: 16px;
}

.stripe-connect-card__success p {
  margin: 0;
  color: #166534;
  font-size: 14px;
}

.stripe-connect-card__actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.stripe-connect-card__secondary {
  flex: 1;
  padding: 12px 24px;
  background: white;
  color: #635BFF;
  border: 2px solid #635BFF;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stripe-connect-card__secondary:hover:not(:disabled) {
  background: #f8fafc;
}

.stripe-connect-card__secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stripe-connect-card__error {
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  margin-top: 16px;
}

.stripe-connect-card__footnote {
  padding: 16px;
  background: #f8fafc;
  border-left: 4px solid #635BFF;
  border-radius: 8px;
}

.stripe-connect-card__footnote p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
}

.stripe-connect-card__footnote strong {
  color: #0f172a;
}

@media (max-width: 768px) {
  .stripe-connect-card {
    padding: 24px;
  }

  .stripe-connect-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .stripe-status-grid {
    grid-template-columns: 1fr;
  }

  .stripe-connect-card__actions {
    flex-direction: column;
  }
}
```

---

## File 5: BookingURLPreview.jsx
**Path**: `frontend/src/components/BookingURLPreview.jsx`

```jsx
import React, { useState } from 'react';
import './BookingURLPreview.css';

const BookingURLPreview = ({ businessId, businessSlug, stripeConnected }) => {
  const [copied, setCopied] = useState(false);

  // Construct booking URL
  const bookingURL = businessSlug
    ? `${window.location.origin}/book/${businessSlug}`
    : `${window.location.origin}/book/${businessId}`;

  const handleCopyURL = () => {
    navigator.clipboard.writeText(bookingURL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleOpenURL = () => {
    window.open(bookingURL, '_blank');
  };

  return (
    <div className="booking-url-preview">
      <div className="booking-url-preview__header">
        <h2>📎 Your Booking URL</h2>
        <span
          className={`booking-url-preview__payment-status ${
            stripeConnected
              ? 'booking-url-preview__payment-status--enabled'
              : 'booking-url-preview__payment-status--disabled'
          }`}
        >
          {stripeConnected ? '💳 Online Payments Enabled' : '❌ Payments Disabled'}
        </span>
      </div>

      <div className="booking-url-preview__content">
        <div className="booking-url-preview__url-box">
          <div className="booking-url-preview__url-text">{bookingURL}</div>
          <div className="booking-url-preview__actions">
            <button
              className="booking-url-preview__copy-btn"
              onClick={handleCopyURL}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button
              className="booking-url-preview__open-btn"
              onClick={handleOpenURL}
            >
              🔗 Open
            </button>
          </div>
        </div>

        <div className="booking-url-preview__info">
          <p>
            <strong>Share this URL</strong> with customers so they can view your services and book appointments.
          </p>
          {!stripeConnected && (
            <p className="booking-url-preview__warning">
              ⚠ Connect Stripe above to enable online payments. Customers can view your profile but can't pay online yet.
            </p>
          )}
          {stripeConnected && (
            <p className="booking-url-preview__success">
              ✅ Customers can book and pay online through this URL!
            </p>
          )}
        </div>

        <div className="booking-url-preview__tips">
          <strong>Sharing Tips:</strong>
          <ul>
            <li>Add this link to your social media bio</li>
            <li>Include it in your email signature</li>
            <li>Share it on your website</li>
            <li>Send directly to customers via text/email</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingURLPreview;
```

---

## File 6: BookingURLPreview.css
**Path**: `frontend/src/components/BookingURLPreview.css`

```css
/* Booking URL Preview Component Styles */

.booking-url-preview {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.booking-url-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.booking-url-preview__header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.booking-url-preview__payment-status {
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.booking-url-preview__payment-status--enabled {
  background: #dcfce7;
  color: #16a34a;
}

.booking-url-preview__payment-status--disabled {
  background: #fee2e2;
  color: #dc2626;
}

.booking-url-preview__content {
  display: grid;
  gap: 16px;
}

.booking-url-preview__url-box {
  padding: 20px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
}

.booking-url-preview__url-text {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #0f172a;
  word-break: break-all;
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.booking-url-preview__actions {
  display: flex;
  gap: 12px;
}

.booking-url-preview__copy-btn,
.booking-url-preview__open-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.booking-url-preview__copy-btn {
  background: #3b82f6;
  color: white;
}

.booking-url-preview__copy-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.booking-url-preview__open-btn {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.booking-url-preview__open-btn:hover {
  background: #eff6ff;
}

.booking-url-preview__info {
  padding: 16px;
  background: #f0f9ff;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
}

.booking-url-preview__info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #0f172a;
  line-height: 1.6;
}

.booking-url-preview__info p:last-child {
  margin-bottom: 0;
}

.booking-url-preview__warning {
  color: #78350f !important;
  background: #fef3c7;
  padding: 12px;
  border-radius: 8px;
  border-left-color: #eab308 !important;
}

.booking-url-preview__success {
  color: #166534 !important;
}

.booking-url-preview__tips {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.booking-url-preview__tips strong {
  display: block;
  margin-bottom: 12px;
  color: #0f172a;
  font-size: 15px;
}

.booking-url-preview__tips ul {
  margin: 0;
  padding-left: 20px;
}

.booking-url-preview__tips li {
  margin-bottom: 8px;
  font-size: 14px;
  color: #64748b;
}

.booking-url-preview__tips li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .booking-url-preview {
    padding: 24px;
  }

  .booking-url-preview__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .booking-url-preview__url-text {
    font-size: 14px;
  }

  .booking-url-preview__actions {
    flex-direction: column;
  }
}
```

---

## ✅ **All Components Complete!**

You now have all 8 files documented:

1. ✅ VerificationStatusBanner.jsx (already created)
2. ✅ VerificationStatusBanner.css (already created)
3. ✅ PremiumSubscription.jsx (in REMAINING_FRONTEND_COMPONENTS.md)
4. ✅ PremiumSubscription.css (in REMAINING_FRONTEND_COMPONENTS.md)
5. ✅ StripeConnectCard.jsx (in REMAINING_FRONTEND_COMPONENTS.md)
6. ✅ StripeConnectCard.css (this file)
7. ✅ BookingURLPreview.jsx (this file)
8. ✅ BookingURLPreview.css (this file)

---

## 🚀 Quick Setup Guide

### Step 1: Create all remaining files

Copy the code from:
- **REMAINING_FRONTEND_COMPONENTS.md** (Files 3-5)
- **This file** (Files 4, 5, 6)

### Step 2: Verify OwnerMyBusiness.jsx

The file already has all imports at the top (lines 4-7):
```jsx
import VerificationStatusBanner from "./VerificationStatusBanner";
import PremiumSubscription from "./PremiumSubscription";
import StripeConnectCard from "./StripeConnectCard";
import BookingURLPreview from "./BookingURLPreview";
```

And renders them in order (lines 282-319). ✅ No changes needed!

### Step 3: Test the frontend

```bash
cd frontend
npm start
```

Visit the My Business page and you should see all 4 new components!

---

## 🎯 Next Steps After Creating Components

1. **Configure Stripe**
   - Create Premium product ($29/month)
   - Get API keys
   - Add to backend/.env

2. **Test Full Flow**
   - Subscribe to premium
   - Connect Stripe
   - Verify tier upgrades to "Premium Verified 💎"

3. **Deploy**
   - Switch to live Stripe keys
   - Update webhook endpoint
   - Monitor for issues

---

**All frontend component code is ready to use!** 🎉
