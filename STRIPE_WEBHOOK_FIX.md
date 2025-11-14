# Stripe Webhook Setup - Step by Step Guide

## 🎯 Issue Identified

Your webhook code is **perfect**, but it's not receiving events from Stripe because:
1. The webhook secret is a placeholder: `whsec_your_webhook_secret`
2. The webhook endpoint is not registered in Stripe Dashboard

---

## ✅ **Step 1: Get Your Webhook Secret from Stripe Dashboard**

### Instructions:

1. **Go to Stripe Dashboard**
   - Test Mode: https://dashboard.stripe.com/test/webhooks
   - Live Mode: https://dashboard.stripe.com/webhooks

2. **Click "Add endpoint"**

3. **Enter your endpoint URL:**
   ```
   http://localhost:5000/webhooks/stripe
   ```
   (For production, use your actual domain)

4. **Select events to listen to:**
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.updated` (optional)
   - ✅ `customer.subscription.deleted` (optional)

5. **Click "Add endpoint"**

6. **Copy the Signing Secret:**
   - It will look like: `whsec_abc123xyz...`
   - This is what you need!

---

## ✅ **Step 2: Update Your .env File**

Replace the placeholder with your real webhook secret:

```env
STRIPE_WEBHOOK_SECRET=whsec_<YOUR_ACTUAL_SECRET_HERE>
```

**⚠️ Important:** Restart your backend server after updating .env!

```powershell
# Stop the server (Ctrl+C)
# Then restart it
cd backend
npm run dev
```

---

## ✅ **Step 3: Test the Webhook Locally**

### Option A: Use Stripe CLI (Recommended)

1. **Install Stripe CLI:**
   ```powershell
   # Download from: https://stripe.com/docs/stripe-cli
   # Or use scoop:
   scoop install stripe
   ```

2. **Login to Stripe:**
   ```powershell
   stripe login
   ```

3. **Forward webhooks to your local server:**
   ```powershell
   stripe listen --forward-to localhost:5000/webhooks/stripe
   ```

4. **Trigger a test event:**
   ```powershell
   stripe trigger checkout.session.completed
   ```

5. **Check your server logs** - You should see:
   ```
   Stripe webhook: user subscriptionStatus updated to active
   ```

### Option B: Test with Real Checkout (Your Current Method)

1. Go to your app: http://localhost:3000/visitor/toolkit
2. Click on "AI Style Advisor" (Premium feature)
3. Complete checkout with test card: `4242 4242 4242 4242`
4. After payment, Stripe will send webhook to your endpoint
5. Check your backend logs for webhook processing

---

## ✅ **Step 4: Verify Database Update**

After webhook fires, check that your user was updated:

```javascript
// In MongoDB Compass or via API
db.users.findOne({ email: "your-test-email@example.com" })

// Should see:
{
  subscriptionStatus: "active",
  subscriptionPlan: "premium",
  stripeCustomerId: "cus_...",
  stripeSubscriptionId: "sub_...",
  subscriptionExpiresAt: <30 days from now>
}
```

---

## 🔧 **Quick Fix Script (If You Want to Test Without Webhook)**

If you want to manually activate your subscription for testing:

```javascript
// backend/scripts/activateTestUser.js
const mongoose = require('mongoose');
const User = require('../models/User');

async function activateUser(email) {
  await mongoose.connect(process.env.MONGO_URI);
  
  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found');
    return;
  }
  
  user.subscriptionStatus = 'active';
  user.subscriptionPlan = 'premium';
  user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await user.save();
  
  console.log('User activated:', user.email);
  process.exit(0);
}

activateUser(process.argv[2]);
```

**Run it:**
```powershell
node backend/scripts/activateTestUser.js "your-email@example.com"
```

---

## 🧪 **Testing Checklist**

After setting up the webhook:

- [ ] Webhook secret updated in .env
- [ ] Backend server restarted
- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] Test payment completed
- [ ] Backend logs show webhook received
- [ ] User database updated with subscriptionStatus="active"
- [ ] Frontend shows premium features unlocked
- [ ] No more redirect loop to Stripe

---

## 🔍 **Debugging Tips**

### If webhook still doesn't work:

1. **Check backend logs:**
   ```javascript
   // Your webhook controller already has logging
   logger.error("Stripe webhook signature invalid", { message: err.message });
   ```

2. **Verify webhook URL is reachable:**
   ```powershell
   curl -X POST http://localhost:5000/webhooks/stripe
   ```
   Should return: `Webhook Error: ...` (signature validation error is expected)

3. **Check Stripe Dashboard → Webhooks → Your endpoint**
   - View recent webhook attempts
   - See success/failure status
   - View request/response details

4. **Common issues:**
   - ❌ Firewall blocking incoming webhooks
   - ❌ Wrong port (5000 vs 3000)
   - ❌ Backend not running when webhook fires
   - ❌ Wrong webhook secret (test vs live mode mismatch)

---

## 🚀 **Production Deployment**

When deploying to production:

1. **Update webhook URL in Stripe Dashboard:**
   ```
   https://your-domain.com/webhooks/stripe
   ```

2. **Add production webhook secret to your hosting platform:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_<production_secret>
   ```

3. **Test with real payment** (or use Stripe CLI)

4. **Monitor webhook deliveries** in Stripe Dashboard

---

## ✅ **Summary**

Your code is **already correct**! You just need to:

1. Get real webhook secret from Stripe Dashboard
2. Update .env file
3. Restart backend
4. Test a payment

That's it! The redirect loop will be fixed. 🎉

---

**Next Steps:**
1. Follow Step 1 above to get your webhook secret
2. Let me know when you have it, and I'll help you test it
3. If you encounter any errors, share the backend logs

Ready to proceed? 🚀
