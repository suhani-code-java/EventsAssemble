# 🐳 Docker Setup Guide

## Prerequisites

- ✅ Docker Desktop installed (https://www.docker.com/products/docker-desktop)
- ✅ Docker daemon running

## Quick Start (2 Commands)

### 1. Start Everything with Docker
```bash
cd /Users/suhanichoudhary/Desktop/connect-fixed-5

# Production mode (recommended)
docker-compose up

# OR development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up
```

### 2. Access the App
```
http://localhost:3000
```

That's it! Both MongoDB and the app start automatically.

---

## What Runs in Docker?

### Production Mode (`docker-compose.yml`)
- ✅ MongoDB container (port 27017)
- ✅ Next.js app container (port 3000)
- ✅ Auto-restart if crashes
- ✅ Optimized for speed

### Development Mode (`docker-compose.dev.yml`)
- ✅ MongoDB container (port 27017)
- ✅ Next.js app with hot reload (port 3000)
- ✅ Live code changes without restart
- ✅ Better for development

---

## Commands

### Start Services
```bash
# Production
docker-compose up

# Development (with hot reload)
docker-compose -f docker-compose.dev.yml up

# Detached mode (runs in background)
docker-compose up -d
```

### Stop Services
```bash
# Stop running containers
docker-compose down

# Stop and remove volumes (delete database)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mongodb
```

### Rebuild Images
```bash
# If you change code
docker-compose build

# Then restart
docker-compose up
```

---

## File Structure

```
connect-fixed-5/
├── Dockerfile           # Production build
├── Dockerfile.dev       # Development build with hot reload
├── docker-compose.yml   # Production orchestration
├── docker-compose.dev.yml # Development orchestration
└── .dockerignore       # Exclude files from Docker
```

---

## Testing

### 1. Check MongoDB
```bash
# Inside app container, test connection
curl http://localhost:3000/api/health

# Should return:
# {"status":"ok","message":"MongoDB connection successful"}
```

### 2. Login & Test Features
```
1. Go to http://localhost:3000
2. Login: admin@echopod.com / admin123
3. Create an event
4. Check it appears in student view
```

---

## Troubleshooting

### Containers Won't Start
```bash
# Clean up everything
docker-compose down -v

# Rebuild
docker-compose build --no-cache

# Start fresh
docker-compose up
```

### Port Already in Use
```bash
# If port 3000 or 27017 is in use, kill the process:
lsof -i :3000
kill -9 <PID>

lsof -i :27017
kill -9 <PID>
```

### View Running Containers
```bash
docker ps

# Stop specific container
docker stop <container-name>

# Remove container
docker rm <container-name>
```

### Check Logs
```bash
# Full logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Last 50 lines
docker-compose logs --tail=50
```

---

## Performance Notes

- **First run**: Takes 2-3 minutes to build and start
- **Subsequent runs**: Instant (few seconds)
- **Hot reload**: Changes reflect in ~2-3 seconds in dev mode
- **Database persists**: Data saved in Docker volumes between restarts

---

## Next Steps

✅ Run: `docker-compose up`  
✅ Visit: http://localhost:3000  
✅ Login & test all features  
✅ Everything runs in Docker containers  

**No MongoDB, Node, npm needed on your computer!** 🎉
