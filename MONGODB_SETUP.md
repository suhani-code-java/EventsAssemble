# MongoDB Setup - Two Options

## ⚡ QUICK FIX (Recommended) - Use MongoDB Atlas Cloud

### Step 1: Create Free MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Start Free"
3. Sign up with email
4. Create a free cluster (takes 2-3 minutes)
5. Get your connection string

### Step 2: Add Connection String to Your App
1. Create `.env.local` file in the project root:
```bash
touch /Users/suhanichoudhary/Desktop/connect-fixed-5/.env.local
```

2. Add this line (replace with your MongoDB Atlas connection string):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/echopod?retryWrites=true&w=majority
```

3. Save and restart the app

### Step 3: Restart App
```bash
npm run dev
```

---

## Alternative - Install MongoDB Locally

### macOS Users:
```bash
# Option 1: Download from MongoDB website
# https://www.mongodb.com/try/download/community

# Option 2: Using Homebrew (requires M1/M2 specific version)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Verify it's running:
lsof -i :27017
```

### Then run app:
```bash
npm run dev
```

---

## 🆓 FREE MongoDB Atlas Cluster (What I Recommend)

1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Click Create Free Account
3. Create Organization → Create Project → Create Cluster (Free)
4. Click "Connect" → Copy connection string
5. Add to `.env.local`: `MONGODB_URI=<your-connection-string>`
6. Done! App will work immediately

**No credit card needed, 512MB free storage**

---

## If You Already Have MongoDB

Check if it's running:
```bash
lsof -i :27017
```

If yes, just restart the app:
```bash
npm run dev
```

---

## Quick Verification

Once MongoDB is set up, test the connection:
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{"status":"ok","message":"MongoDB connection successful"}
```
