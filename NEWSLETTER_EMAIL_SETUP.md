# Newsletter Email Service Setup Guide

## Overview
The newsletter system uses **Nodemailer** for email delivery with support for multiple SMTP providers (Gmail, SendGrid, Outlook, etc.). Emails are sent in batches with rate limiting to ensure reliable delivery.

---

## Quick Setup (Gmail)

### 1. Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/security)
2. Enable **2-Step Verification**

### 2. Generate App Password
1. Visit [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Other (Custom name)**
3. Name it "SalonHub Newsletter"
4. Copy the 16-character password

### 3. Update .env File
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Your app password
FRONTEND_URL=http://localhost:3000
```

### 4. Test Connection
```bash
cd backend
npm start
```

Look for: `✅ Email service is ready to send emails`

---

## Alternative Email Providers

### SendGrid (Recommended for Production)

**Pros:** High deliverability, 100 free emails/day, detailed analytics

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

**Setup Steps:**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create API Key (Settings → API Keys)
3. Verify sender email address
4. Update .env with API key

---

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

---

### AWS SES (Production Scale)

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-smtp-username
SMTP_PASSWORD=your-aws-smtp-password
```

---

## Email Service Features

### 1. HTML Email Templates
Two professionally designed templates:
- **Visitor Newsletter**: Purple gradient header (Hair Tips)
- **Owner Newsletter**: Pink gradient header (Business Growth)

Both include:
- Responsive design
- Mobile-friendly layout
- One-click unsubscribe links
- Professional styling

### 2. Batch Email Sending
- **Batch Size**: 50 emails per batch
- **Delay**: 1 second between batches
- **Progress Tracking**: Real-time console updates
- **Error Recovery**: Failed emails logged with error details

### 3. Unsubscribe System
- **Token-based**: Secure unsubscribe links with SHA-256 hash
- **No Auth Required**: Public unsubscribe route
- **Beautiful UI**: Branded unsubscribe confirmation page

---

## Testing the System

### 1. Send Test Email

**From Admin Panel:**
1. Navigate to **Newsletters → Create Visitor Newsletter**
2. Fill in subject, preheader, content
3. Click **Send Test Email**
4. Enter your email address
5. Check your inbox

**Via API:**
```bash
curl -X POST http://localhost:5000/api/admin/newsletters/campaigns/CAMPAIGN_ID/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-email@example.com"}'
```

### 2. Send Campaign

**From Admin Panel:**
1. Create campaign (draft)
2. Click **Send Now** or **Schedule**
3. Monitor console for progress:
   ```
   📧 Sending batch 1/4 (50 emails)
   📊 Campaign Progress: 25% (50/200)
   📧 Sending batch 2/4 (50 emails)
   📊 Campaign Progress: 50% (100/200)
   ...
   ✅ Campaign sent: 195 successful, 5 failed
   ```

---

## API Endpoints

### Send Test Email
```http
POST /api/admin/newsletters/campaigns/:id/test
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "testEmail": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent to test@example.com",
  "messageId": "<unique-id@gmail.com>"
}
```

---

### Send Campaign Now
```http
POST /api/admin/newsletters/campaigns/:id/send
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "campaign": {
    "_id": "...",
    "status": "SENDING",
    "stats": {
      "totalRecipients": 200
    }
  }
}
```

---

### Schedule Campaign
```http
POST /api/admin/newsletters/campaigns/:id/send
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "scheduledAt": "2025-11-20T10:00:00Z"
}
```

---

### Public Unsubscribe (No Auth)
```http
GET /api/public/unsubscribe?userId={id}&token={hash}&type=visitor
```

Returns beautiful HTML page confirming unsubscription.

---

## Email Rate Limits

### Gmail (Free)
- **Limit**: 500 emails/day
- **Burst**: 50 emails/batch safe
- **Use Case**: Development, small deployments

### SendGrid (Free Tier)
- **Limit**: 100 emails/day
- **Paid**: Up to millions/month
- **Use Case**: Production

### AWS SES
- **Limit**: 200 emails/day (sandbox), unlimited (production)
- **Cost**: $0.10 per 1,000 emails
- **Use Case**: High-volume production

---

## Troubleshooting

### "Email service verification failed"

**Gmail:**
- ✅ Check 2FA is enabled
- ✅ Use App Password, not regular password
- ✅ Remove spaces from App Password in .env

**SendGrid:**
- ✅ Verify sender email address
- ✅ Check API key has "Mail Send" permissions

**Firewall:**
- ✅ Port 587 must be open
- ✅ Some networks block SMTP

---

### "Authentication failed"

```env
# Wrong ❌
SMTP_PASSWORD=my regular password

# Correct ✅
SMTP_PASSWORD=abcd efgh ijkl mnop  # Gmail App Password
```

---

### "Connection timeout"

Try alternative port:
```env
SMTP_PORT=465
```

Or use different provider (SendGrid often more reliable).

---

## Production Checklist

- [ ] Use SendGrid or AWS SES (not Gmail)
- [ ] Verify sender domain for better deliverability
- [ ] Set up SPF and DKIM records
- [ ] Monitor bounce rates
- [ ] Implement double opt-in (optional)
- [ ] Add unsubscribe link to all emails ✅ (already done)
- [ ] Log all email sends for audit trail
- [ ] Set up email analytics (open rates, clicks)

---

## Email Templates

### Template Structure
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>/* Inline CSS for email clients */</style>
</head>
<body>
  <div class="header">Brand + Subject</div>
  <div class="content">{Your HTML Content}</div>
  <div class="footer">
    <a href="{unsubscribe_url}">Unsubscribe</a>
  </div>
</body>
</html>
```

### Customizing Templates

Edit `backend/services/emailService.js`:

```javascript
// Change header color
.header { background: linear-gradient(135deg, #YOUR_COLOR_1, #YOUR_COLOR_2); }

// Change font
body { font-family: 'Your Font', sans-serif; }

// Add logo
<div class="header">
  <img src="https://your-domain.com/logo.png" alt="Logo">
  <h1>Your Newsletter</h1>
</div>
```

---

## Monitoring & Analytics

### Console Logs
The system logs all email activity:

```
✅ Email service is ready to send emails
📧 Sending batch 1/4 (50 emails)
📊 Campaign Progress: 25% (50/200)
✅ Campaign sent: 195 successful, 5 failed
```

### Database Stats
Campaign stats stored in `NewsletterCampaign` model:

```javascript
stats: {
  totalRecipients: 200,
  sentCount: 195,
  failedCount: 5,
  openRate: 0,      // Future: Track opens
  clickRate: 0      // Future: Track clicks
}
```

### Failed Emails
First 10 errors logged in `campaign.errorLog`:

```json
[
  { "email": "invalid@example.com", "error": "Invalid recipient" },
  { "email": "bounce@example.com", "error": "Mailbox full" }
]
```

---

## Security Best Practices

1. **Never commit .env file** ✅
2. **Use App Passwords, not regular passwords** ✅
3. **Validate email addresses before sending** ✅
4. **Rate limit API endpoints** (TODO)
5. **Use secure unsubscribe tokens** ✅
6. **HTTPS only in production** (Frontend)
7. **Sanitize user HTML input** (TODO: Add sanitizer)

---

## Next Steps

1. **Set up email provider** (Gmail/SendGrid)
2. **Test send test email**
3. **Create sample campaign**
4. **Send to test subscribers**
5. **Monitor delivery rates**
6. **Adjust batch size if needed**

---

## Support

**Email not sending?**
1. Check console for error messages
2. Verify SMTP credentials
3. Test with different email provider
4. Check firewall/network settings

**Need help?**
- Refer to this guide
- Check provider documentation
- Review email service logs

---

## Related Files

- `backend/services/emailService.js` - Email service implementation
- `backend/services/adminNewsletterService.js` - Campaign management
- `backend/routes/publicRoutes.js` - Public unsubscribe route
- `backend/.env.example` - Configuration template
