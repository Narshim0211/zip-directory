# 🎁 Promotions Feature - Frontend Integration Guide

**Phase 4 - V1 Lean Edition**

This guide provides React components and styles to integrate the Promotions Feature with your frontend.

---

## 📋 Quick Start

### Backend API Endpoints

**Owner Endpoints:**
- `POST /api/owner/promotion` - Create/update promotion
- `GET /api/owner/promotion/:businessId` - Get my promotion
- `DELETE /api/owner/promotion/:businessId` - Deactivate promotion

**Promotion automatically appears in:**
- Search results (`/api/businesses`)
- Business profiles (`/api/businesses/:id`)

---

## 🎨 React Components

### 1. **Promotion Badge** (Search Results)

```jsx
// components/PromotionBadge.jsx
import React from 'react';
import './PromotionBadge.css';

const PromotionBadge = ({ promotion }) => {
  if (!promotion) return null;

  const daysLeft = Math.ceil(
    (new Date(promotion.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="promo-badge">
      <div className="promo-content">
        <span className="promo-icon">🔥</span>
        <div className="promo-text">
          <h4>{promotion.title}</h4>
          <p>{promotion.description}</p>
        </div>
      </div>
      <div className="promo-expiry">
        <span>⏰</span>
        <span>{daysLeft}d left</span>
      </div>
    </div>
  );
};

export default PromotionBadge;
```

**CSS:**
```css
/* PromotionBadge.css */
.promo-badge {
  background: linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%);
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  margin-top: 12px;
  box-shadow: 0 4px 12px rgba(120, 115, 245, 0.3);
  animation: fadeIn 0.3s ease;
}

.promo-content {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.promo-icon {
  font-size: 24px;
  animation: pulse 2s infinite;
}

.promo-text h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.promo-text p {
  margin: 0;
  font-size: 12px;
  opacity: 0.95;
  line-height: 1.4;
}

.promo-expiry {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 12px;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 2. **Promotion Banner** (Profile Hero)

```jsx
// components/PromotionBanner.jsx
import React, { useState, useEffect } from 'react';
import './PromotionBanner.css';

const PromotionBanner = ({ promotion, onBookNow }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!promotion) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(promotion.expiresAt).getTime();
      const distance = expiry - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setTimeLeft(`${days}d ${hours}h`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60);

    return () => clearInterval(interval);
  }, [promotion]);

  if (!promotion) return null;

  return (
    <div className="promo-banner">
      <div className="promo-banner-content">
        <div className="promo-header">
          <span className="limited-badge">LIMITED TIME OFFER</span>
          <span className="countdown">{timeLeft}</span>
        </div>
        <h2 className="promo-banner-title">{promotion.title}</h2>
        <p className="promo-banner-desc">{promotion.description}</p>
        <button className="cta-btn" onClick={onBookNow}>
          Book Now & Save
        </button>
      </div>
      <div className="promo-bg-effect"></div>
    </div>
  );
};

export default PromotionBanner;
```

**CSS:**
```css
/* PromotionBanner.css */
.promo-banner {
  position: relative;
  background: linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(120, 115, 245, 0.4);
}

.promo-banner-content {
  position: relative;
  z-index: 1;
}

.promo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.limited-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.countdown {
  background: rgba(0, 0, 0, 0.2);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.promo-banner-title {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.promo-banner-desc {
  font-size: 16px;
  margin: 0 0 20px 0;
  opacity: 0.95;
  line-height: 1.6;
  max-width: 600px;
}

.cta-btn {
  background: white;
  color: #7873f5;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.promo-bg-effect {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .promo-banner {
    padding: 24px 20px;
  }
  .promo-banner-title {
    font-size: 22px;
  }
  .cta-btn {
    width: 100%;
  }
}
```

### 3. **Create Promotion Form** (Owner Dashboard)

```jsx
// components/owner/CreatePromotionForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './CreatePromotionForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const CreatePromotionForm = ({ businessId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expiryDays: '14'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(
        `${API_URL}/api/owner/promotion`,
        {
          businessId,
          ...formData,
          expiryDays: parseInt(formData.expiryDays)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        onSuccess && onSuccess(res.data.promotion);
        setFormData({ title: '', description: '', expiryDays: '14' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create promotion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="promo-form">
      <h3>Create Promotion</h3>

      {error && <div className="error-msg">{error}</div>}

      <div className="form-group">
        <label>
          Title <span className="char-count">{formData.title.length}/50</span>
        </label>
        <input
          type="text"
          maxLength="50"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., New Clients Get 20% Off!"
          required
        />
      </div>

      <div className="form-group">
        <label>
          Description <span className="char-count">{formData.description.length}/120</span>
        </label>
        <textarea
          maxLength="120"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your promotion..."
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Expires In</label>
        <select
          value={formData.expiryDays}
          onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
        >
          <option value="3">3 days</option>
          <option value="7">7 days</option>
          <option value="14">14 days</option>
          <option value="30">30 days</option>
          <option value="60">60 days</option>
          <option value="90">90 days</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Promotion'}
      </button>
    </form>
  );
};

export default CreatePromotionForm;
```

**CSS:**
```css
/* CreatePromotionForm.css */
.promo-form {
  max-width: 500px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.promo-form h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-weight: 600;
  color: #555;
}

.char-count {
  font-size: 12px;
  color: #999;
  font-weight: 400;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #7873f5;
}

.promo-form button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.promo-form button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.promo-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  background: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}
```

---

## 📡 API Usage Examples

### Get Business with Promotion

```javascript
const fetchBusiness = async (businessId) => {
  const res = await axios.get(`${API_URL}/api/businesses/${businessId}`);

  // Promotion will be in response:
  const promotion = res.data.business.promotion; // or null if none

  if (promotion) {
    console.log('Active promotion:', promotion.title);
  }
};
```

### Display in Search Results

```jsx
const BusinessCard = ({ business }) => {
  return (
    <div className="business-card">
      <img src={business.heroImage} alt={business.name} />
      <h3>{business.name}</h3>
      <p>{business.city}</p>

      {/* Show promotion if exists */}
      <PromotionBadge promotion={business.promotion} />

      <button>View Details</button>
    </div>
  );
};
```

### Display on Profile

```jsx
const BusinessProfile = ({ business }) => {
  return (
    <div className="profile">
      {/* Hero promotion banner */}
      <PromotionBanner
        promotion={business.promotion}
        onBookNow={() => navigate('/book')}
      />

      <h1>{business.name}</h1>
      <p>{business.description}</p>

      {/* Rest of profile */}
    </div>
  );
};
```

---

## ✅ Integration Checklist

- [ ] Promotion badge shows on search results
- [ ] Promotion banner shows on profile
- [ ] Countdown timer updates correctly
- [ ] Owner form validates correctly
- [ ] Title limited to 50 chars
- [ ] Description limited to 120 chars
- [ ] Pink-purple gradient applied
- [ ] Mobile responsive
- [ ] Animations smooth

---

## 🎯 Next Steps

1. **Copy components** to your frontend
2. **Test API connectivity** with backend
3. **Adjust styling** to match your design
4. **Add to your routes**
5. **Test on mobile** devices

---

**Complete Documentation:** See `PHASE4_COMPLETE_SUMMARY.md` for full backend API details.

**Backend Status:** ✅ Running and ready for integration
