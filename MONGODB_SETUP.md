# MongoDB Setup Guide

## 🐛 Error Fixed

The error you saw:
```
MongoDB connection error: The `uri` parameter to `openUri()` must be a string, got "undefined"
```

This was because the `.env` file was missing in the backend directory.

**✅ FIXED:** I've created the `.env` file with MongoDB configuration.

---

## 🚀 Quick Fix - Choose ONE Option

### Option 1: Use Local MongoDB (Recommended for Development)

#### Step 1: Install MongoDB (if not installed)

**Windows:**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer (choose "Complete" installation)
3. MongoDB will install as a Windows Service and start automatically

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Step 2: Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh --version

# Or try to connect
mongosh
```

If MongoDB is running, you'll see a connection message.

#### Step 3: Start Your Backend

```bash
cd zip-directory/backend
npm start
```

You should see:
```
✓ MongoDB connected
✓ Server running on http://localhost:5000
```

---

### Option 2: Use MongoDB Atlas (Cloud Database)

If you don't want to install MongoDB locally, use MongoDB Atlas (free tier):

#### Step 1: Create Free MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free
3. Create a new cluster (choose Free tier M0)
4. Wait 3-5 minutes for cluster to deploy

#### Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
   ```

#### Step 3: Update .env File

Edit `backend/.env` and replace the MONGO_URI:

```env
# Comment out local MongoDB:
# MONGO_URI=mongodb://localhost:27017/salonhub

# Add your Atlas connection string:
MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/salonhub?retryWrites=true&w=majority
```

**Important:** Replace `your_username` and `your_password` with your actual credentials!

#### Step 4: Whitelist Your IP

1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (for development)
4. Click "Confirm"

#### Step 5: Start Your Backend

```bash
cd zip-directory/backend
npm start
```

---

## 🧪 Test MongoDB Connection

Once MongoDB is running and backend is started, test the connection:

```bash
# Test backend is working
curl http://localhost:5000/api/test

# Should return:
{"success":true,"message":"SalonHub API is working"}
```

---

## 🐛 Troubleshooting

### Error: "Connection refused" or "ECONNREFUSED"

**MongoDB is not running.**

**Windows:**
```bash
# Check if MongoDB service is running
net start | findstr MongoDB

# If not running, start it:
net start MongoDB
```

**macOS:**
```bash
# Start MongoDB
brew services start mongodb-community

# Check status
brew services list
```

**Linux:**
```bash
# Start MongoDB
sudo systemctl start mongodb

# Check status
sudo systemctl status mongodb
```

---

### Error: "Authentication failed"

**For MongoDB Atlas:** Your username/password is incorrect in the connection string.

**Solution:**
1. Go to MongoDB Atlas → Database Access
2. Reset the password for your user
3. Update the `.env` file with the new password

---

### Error: "Network timeout"

**For MongoDB Atlas:** Your IP is not whitelisted.

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Add your current IP address
3. Or choose "Allow Access from Anywhere" (0.0.0.0/0)

---

### Error: "Database not found"

**This is normal!** MongoDB will create the database automatically when you first insert data.

---

## ✅ Verification Checklist

After fixing, verify everything works:

- [ ] MongoDB is running (local or Atlas)
- [ ] `.env` file exists in `backend/` directory
- [ ] `MONGO_URI` in `.env` is correct
- [ ] Backend starts without errors
- [ ] See "MongoDB connected" in console
- [ ] Can access `http://localhost:5000/api/test`

---

## 📝 Quick Commands Reference

### Start Everything

```bash
# Terminal 1 - Start MongoDB (if using local)
# Windows: Already running as service
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongodb

# Terminal 2 - Start Backend
cd zip-directory/backend
npm start

# Terminal 3 - Start Frontend
cd zip-directory/frontend
npm start
```

### Check Logs

```bash
# Backend logs
cd zip-directory/backend
npm start

# Look for:
# ✓ MongoDB connected  (good)
# ✗ MongoDB connection error  (bad - follow troubleshooting)
```

---

## 🎉 You're All Set!

Once you see "MongoDB connected" in your backend console, everything is working!

Your backend will now:
- ✅ Connect to MongoDB
- ✅ Serve API endpoints
- ✅ Cache news articles
- ✅ Handle search requests

**Ready to use your enhanced Visitor Home!** 🚀

---

## 💡 Pro Tips

### For Development
- Use **local MongoDB** - Faster and no internet needed
- Use **MongoDB Compass** - Visual database manager: https://www.mongodb.com/products/compass

### For Production
- Use **MongoDB Atlas** - Automatic backups, scaling, security
- Set strong `JWT_SECRET` in `.env`
- Limit `WEB_ORIGIN` to your actual domain

---

Need more help? Check these resources:
- MongoDB Installation: https://docs.mongodb.com/manual/installation/
- MongoDB Atlas Tutorial: https://docs.atlas.mongodb.com/getting-started/
- Node.js + MongoDB: https://www.mongodb.com/languages/mongodb-with-nodejs

**Happy coding!** ✨
