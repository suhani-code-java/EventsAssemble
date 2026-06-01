# ✅ Event Management App - COMPLETE GUIDE

## 🚀 Quick Start (3 Steps)

### Step 1️⃣: Start MongoDB
You need MongoDB running locally.

**Option A: Using Homebrew (macOS)**
```bash
brew services start mongodb-community
```

**Option B: Using Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option C: If MongoDB already installed**
```bash
mongod
```

### Step 2️⃣: Verify MongoDB is Running
```bash
# Test connection
curl http://localhost:27017

# You should see something like:
# It looks like you are trying to access MongoDB over HTTP on the native driver port.
```

### Step 3️⃣: Run the Application
```bash
cd /Users/suhanichoudhary/Desktop/connect-fixed-5
npm run dev
```

The app will start on **http://localhost:3000** (or find the next available port)

---

## 🧪 Test Event Creation

### 1. Login
- Go to http://localhost:3000/login
- Email: `admin@echopod.com`
- Password: `admin123`
- Click Login

### 2. Create an Event
- Click **"Organizer"** in the menu
- Click **"New Event"** button
- Fill in ALL fields:
  - **Title**: "My First Event"
  - **Description**: "This is a test event"
  - **Category**: "Hackathon"
  - **Date**: Pick any future date
  - **Time**: Pick any time
  - **Location**: "Main Hall"
  - **Capacity**: 100
  - **Skills** (optional): "JavaScript, React"
- Click **"Create Event"**
- 🎉 You should see success message and event appears in the list

### 3. View Events
- Click **"Manage Events"** to see all your created events
- Click **"Browse Events"** (Student view) to see all events

---

## 🔍 Debug Information

### Check if MongoDB is Connected
Visit: **http://localhost:3000/api/health**

You should see:
```json
{
  "status": "ok",
  "message": "MongoDB connection successful",
  "timestamp": "2026-05-31T..."
}
```

If not, MongoDB is not running!

### Check Console Logs
Open Browser DevTools (F12):
- **Console tab**: Client-side errors
- **Network tab**: API requests

Server logs will show in the terminal where you ran `npm run dev`

---

## ✅ What's Fixed

| Issue | Fix |
|-------|-----|
| Dashboard loading slowly | ✅ Removed auto-refresh |
| Events not being created | ✅ Better validation & error messages |
| Form fields not working | ✅ Improved field handling |
| No clarity on what's happening | ✅ Added console logging |
| Organizer events not showing | ✅ Fixed filtering & display |

---

## 📱 Features Working

✅ **Create Events** - Fill in details and save to MongoDB  
✅ **View Events** - See all events created  
✅ **Organizer Dashboard** - Quick overview  
✅ **Student Browse** - View all events  
✅ **Error Messages** - Clear feedback  
✅ **Admin Panel** - Manage users and events  

---

## ❌ If MongoDB Won't Start

### macOS with Homebrew
```bash
# Check if MongoDB is running
brew services list

# If stuck, restart:
brew services restart mongodb-community

# Or check logs:
brew services log mongodb-community
```

### Docker
```bash
# Check if container is running
docker ps | grep mongodb

# If not, start it:
docker start mongodb

# Or create new one:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Check Port 27017
```bash
# Is something using the port?
lsof -i :27017

# Kill if needed:
kill -9 <PID>
```

---

## 📞 Common Issues

### "MongoDB connection failed"
→ Make sure MongoDB is running on localhost:27017

### "Event creation failed"
→ Check all fields are filled
→ Look at browser console (F12) for error details
→ Check server logs in terminal

### "No events showing"
→ Did you create any events? Check network tab in DevTools
→ Is the event created but not appearing? Refresh the page

### "Slow dashboard loading"
→ This is fixed! Should load instantly now
→ If still slow, check server logs for errors

---

## 🎯 Admin Access

**Login as Admin:**
- Email: `admin@echopod.com`
- Password: `admin123`
- Go to `/admin` to manage platform

---

**Ready to test? Start with Step 1! 🚀**
