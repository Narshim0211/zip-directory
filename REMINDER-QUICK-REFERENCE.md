# 🎯 Reminder System - Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. **Add API Keys to .env**
```bash
SENDGRID_API_KEY=SG.your_key_here
SENDER_EMAIL=noreply@yourdomain.com
TWILIO_SID=ACxxxxxxxxxx
TWILIO_TOKEN=your_token
TWILIO_PHONE=+1234567890
```

### 2. **Restart Backend**
```bash
cd backend
npm start
```

### 3. **Test It**
```bash
cd ..
.\test-reminder-system.ps1
```

---

## 📊 Architecture Overview

```
User creates task with reminder
         ↓
MongoDB saves: { reminder: { time: "14:30", email, phone, sent: false } }
         ↓
Cron runs every minute
         ↓
Finds tasks where time == current time && sent == false
         ↓
Sends Email (SendGrid) + SMS (Twilio)
         ↓
Marks: sent = true, logs to ReminderLog
         ↓
User receives notification! 🎉
```

---

## 🔧 Key Files

| File | Purpose |
|------|---------|
| `backend/services/reminderScheduler.js` | Cron job (runs every minute) |
| `backend/shared/utils/sendReminder.js` | Email/SMS sender |
| `backend/shared/models/ReminderLog.js` | Tracks delivery history |
| `backend/routes/reminderRoutes.js` | API endpoints |
| `backend/shared/timeTaskSchema.js` | Task schema with reminder fields |

---

## 📡 API Endpoints

### **POST** `/api/reminders/test`
Manually trigger reminder check (testing)

### **GET** `/api/reminders/history?userId=xxx`
Get reminder delivery history

### **GET** `/api/reminders/stats?userId=xxx&days=30`
Get delivery statistics

### **GET** `/api/reminders/pending?userId=xxx`
List all pending reminders

### **POST** `/api/reminders/:taskId/retry`
Retry failed reminder

---

## 🧪 Testing Workflow

### **Quick Test (2 minutes)**

1. Get current time: Run `Get-Date -Format "HH:mm"`
2. Create task with reminder time = current time + 2 minutes
3. Add your email/phone
4. Save task
5. Watch backend console logs
6. Check email/SMS inbox

### **Example:**
- Current time: `14:28`
- Set reminder: `14:30`
- Save task
- At `14:30`, check backend logs for:
  ```
  🔍 Checking reminders at 14:30...
  📬 Found 1 reminder(s) to send
  ✅ Reminder sent successfully
  ```

---

## 🔍 Debugging Checklist

### ❌ **No logs showing?**
- Backend not running
- MongoDB not connected
- Scheduler didn't start (check console for "✅ Reminder scheduler started")

### ❌ **Logs show but no email?**
- `SENDGRID_API_KEY` missing or invalid
- `SENDER_EMAIL` not verified in SendGrid
- Check spam folder
- View `reminderLogs` collection for error

### ❌ **No SMS?**
- `TWILIO_SID`/`TWILIO_TOKEN`/`TWILIO_PHONE` missing
- Phone number needs country code (+1...)
- Twilio account out of credits

### ❌ **Reminder sent twice?**
- Check `reminder.sent` field
- Should be `true` after first send
- Bug if still `false` after delivery

---

## 📋 Database Schema

### **Task Document**
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  title: "Team Meeting",
  taskDate: ISODate("2025-11-15"),
  reminder: {
    time: "14:30",              // HH:MM (24h)
    email: "user@example.com",
    phone: "+1234567890",
    sent: false,                // Prevents duplicates
    sentAt: null,
    lastAttemptAt: ISODate("..."),
    failureReason: null
  }
}
```

### **ReminderLog Document**
```javascript
{
  _id: ObjectId("..."),
  taskId: ObjectId("..."),
  userId: ObjectId("..."),
  taskTitle: "Team Meeting",
  reminderTime: "14:30",
  emailSent: true,
  emailRecipient: "user@example.com",
  smsSent: true,
  smsRecipient: "+1234567890",
  status: "success",
  attemptedAt: ISODate("..."),
  sentAt: ISODate("...")
}
```

---

## 🎨 Email Template Preview

**Subject:** ⏰ Reminder: Team Meeting

**Body:**
```
Hi there!

This is your reminder for:

📌 Team Meeting
⏰ Scheduled for: 11/15/2025 at 14:30

Details: Discuss project timeline

Stay organized!

— SalonHub Time Manager
```

---

## 📱 SMS Template Preview

```
⏰ Reminder: Team Meeting
📅 11/15/2025 at 14:30

— SalonHub
```

---

## 🔐 Environment Variables

| Variable | Required? | Purpose | Example |
|----------|-----------|---------|---------|
| `SENDGRID_API_KEY` | Yes (email) | SendGrid API key | `SG.abc123...` |
| `SENDER_EMAIL` | Yes (email) | Verified sender | `noreply@domain.com` |
| `TWILIO_SID` | Yes (SMS) | Twilio Account SID | `ACxxxxxxxx` |
| `TWILIO_TOKEN` | Yes (SMS) | Twilio Auth Token | `abc123...` |
| `TWILIO_PHONE` | Yes (SMS) | Twilio phone number | `+1234567890` |

---

## 🚀 Production Considerations

### **Scaling**
- For 1000+ users: Use BullMQ + Redis queue
- For microservices: Separate reminder service
- For cloud: AWS EventBridge or Google Cloud Scheduler

### **Reliability**
- Add retry logic (3 attempts with exponential backoff)
- Monitor delivery rates
- Alert on high failure rates

### **Cost Management**
- SendGrid: 100 emails/day free, then $15/mo
- Twilio: ~$0.0075 per SMS
- Consider webhook notifications as free alternative

### **User Experience**
- Add "Test Reminder" button (sends immediately)
- Show delivery status in UI
- Allow snooze/reschedule
- Notification preferences (quiet hours)

---

## 📚 Resources

### **SendGrid**
- Dashboard: https://app.sendgrid.com
- API Docs: https://docs.sendgrid.com
- Verify sender: Settings → Sender Authentication

### **Twilio**
- Console: https://console.twilio.com
- API Docs: https://www.twilio.com/docs
- Get phone: Phone Numbers → Buy a Number

### **Cron Syntax**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

**Examples:**
- `* * * * *` - Every minute
- `*/5 * * * *` - Every 5 minutes
- `0 9 * * *` - Every day at 9:00 AM
- `0 9 * * 1` - Every Monday at 9:00 AM

---

## 💡 Pro Tips

1. **Time Zone**: Server time might differ from user's local time
2. **24-Hour Format**: Always use `HH:MM` (e.g., `14:30` not `2:30 PM`)
3. **Testing**: Use current time + 1-2 minutes for quick tests
4. **Monitoring**: Check `reminderLogs` collection daily
5. **Backup**: Keep SendGrid AND Twilio for redundancy

---

## 🎉 Success Indicators

**✅ Everything working when:**
1. Backend logs: `"✅ Reminder scheduler started successfully"`
2. Cron logs every minute: `"🔍 Checking reminders at HH:MM..."`
3. At reminder time: `"📬 Found X reminder(s) to send"`
4. After send: `"✅ Reminder sent successfully"`
5. Email/SMS received within 1-2 minutes
6. MongoDB: `reminder.sent = true`
7. ReminderLog: New entry with `status: "success"`

---

**Need help? Check `REMINDER-SYSTEM-COMPLETE.md` for full documentation.**
