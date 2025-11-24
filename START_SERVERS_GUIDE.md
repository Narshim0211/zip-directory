# 🚀 SalonHub - Server Startup Guide

## Current Issue

Your browser shows `ERR_CONNECTION_REFUSED` because:
- ❌ Backend server is NOT running on port 5000
- ❌ Frontend dev server is NOT running on port 3001

**This is NOT a routing issue - the servers are simply offline.**

---

## ✅ Step-by-Step Fix

### Step 1: Start Backend Server

Open a terminal in the project root:

```bash
# Navigate to project root
cd c:\Users\narsh\Desktop\Directory-SalonHub\main-site\zip-directory

# Start backend
npm run dev
# OR
cd backend && npm start
```

**Expected output:**
```
🚀 Server running on http://localhost:5000
✓ MongoDB connected
✓ Redis connected
```

**If you see errors:**
- Check if MongoDB is running
- Check if another service is using port 5000

**Verify backend is running:**
```bash
# Windows PowerShell
netstat -ano | findstr :5000

# Should show something like:
# TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    12345
```

---

### Step 2: Start Frontend Dev Server

Open a **NEW terminal** (keep backend running):

```bash
# Navigate to frontend folder
cd c:\Users\narsh\Desktop\Directory-SalonHub\main-site\zip-directory\frontend

# Start on port 3001 specifically
$env:PORT=3001; npm start

# OR if the above doesn't work:
npm start
# (it will auto-assign port 3000 or 3001)
```

**Expected output:**
```
Compiled successfully!

You can now view salonhub-frontend in the browser.

  Local:            http://localhost:3001
  On Your Network:  http://192.168.x.x:3001
```

**Verify frontend is running:**
```bash
# Windows PowerShell
netstat -ano | findstr :3001

# Should show:
# TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    67890
```

---

### Step 3: Open Correct URL

**IMPORTANT:** Open the URL that the frontend terminal shows you.

If it says `http://localhost:3000`, use that.
If it says `http://localhost:3001`, use that.

**Don't guess the port!**

```
✅ CORRECT:   http://localhost:3001/login  (if terminal says 3001)
❌ WRONG:     http://localhost:3000/login  (if server is on 3001)
```

---

### Step 4: Test Login

Once both servers are running:

1. Open browser to `http://localhost:3001/login`
2. Open DevTools Console (F12)
3. Enter credentials and click Login
4. **Check console for:**

```
✅ GOOD:
🌐 [AXIOS] POST http://localhost:5000/api/auth/login

❌ BAD:
ERR_CONNECTION_REFUSED
```

If you see `ERR_CONNECTION_REFUSED`:
- Backend is not running
- Go back to Step 1

If you see 404:
- Backend is running but route is wrong
- That's when the API routing cleanup matters

---

## 🔍 Quick Diagnostic Commands

### Check what's running on ports:

```powershell
# Check backend port
netstat -ano | findstr :5000

# Check frontend port
netstat -ano | findstr :3001
netstat -ano | findstr :3000

# Check MongoDB
netstat -ano | findstr :27017

# Check Redis
netstat -ano | findstr :6379
```

### Kill a stuck process:

```powershell
# Find the PID from netstat output (last column)
# Then kill it:
taskkill /PID <PID_NUMBER> /F

# Example:
taskkill /PID 12345 /F
```

---

## 🐛 Common Issues

### Issue: "Port already in use"

**Frontend says port 3001 is busy:**
```bash
# Kill whatever is on 3001
netstat -ano | findstr :3001
# Note the PID (last column)
taskkill /PID <PID> /F

# Try again
npm start
```

**Backend says port 5000 is busy:**
```bash
# Kill whatever is on 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Try again
npm run dev
```

---

### Issue: "MongoDB connection failed"

```bash
# Start MongoDB service
net start MongoDB

# OR if using MongoDB Compass:
# Open MongoDB Compass and ensure local connection works
```

---

### Issue: "Cannot find module"

```bash
# Reinstall dependencies
cd backend
npm install

cd ../frontend
npm install
```

---

## ✅ Verification Checklist

Before attempting login, verify:

- [ ] Backend terminal shows: "Server running on http://localhost:5000"
- [ ] Frontend terminal shows: "Compiled successfully"
- [ ] `netstat -ano | findstr :5000` shows LISTENING
- [ ] `netstat -ano | findstr :3001` shows LISTENING (or 3000)
- [ ] Browser URL matches the port shown in frontend terminal
- [ ] MongoDB is running (if backend requires it)

---

## 🎯 After Servers Are Running

**THEN you'll benefit from the API routing cleanup!**

Once both servers are up, the cleanup I just completed ensures:

1. All API calls use the unified axios instance
2. All routes follow `/v1/...` format
3. Every request is logged: `🌐 [AXIOS] ...`
4. Profile pages use correct endpoints
5. No duplicate api clients

---

## 📝 Startup Script (Optional)

Create `start-dev.ps1` in project root:

```powershell
# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait 5 seconds for backend to initialize
Start-Sleep -Seconds 5

# Start frontend
cd frontend
$env:PORT=3001
npm start
```

Then just run:
```powershell
.\start-dev.ps1
```

---

## 🆘 Still Not Working?

**Paste the following command outputs:**

```bash
# 1. Backend startup output
cd backend
npm run dev

# 2. Frontend startup output
cd frontend
npm start

# 3. Port check
netstat -ano | findstr :5000
netstat -ano | findstr :3001
```

Send me those outputs and I'll tell you exactly what's wrong.

---

**Last Updated:** 2025-11-23
