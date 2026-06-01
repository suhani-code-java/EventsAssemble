import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/echopod';

console.log('📡 MongoDB Connection URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@'));

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastFailureAt: number | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null, lastFailureAt: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  // Avoid repeated slow retries when MongoDB is down.
  if (cached.lastFailureAt && Date.now() - cached.lastFailureAt < 300000) {
    throw new Error('MongoDB temporarily unavailable; retrying soon');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 500,
      connectTimeoutMS: 500,
      socketTimeoutMS: 1000,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Connected Successfully');
        cached.lastFailureAt = null;
        return mongoose;
      })
      .catch((error) => {
        cached.lastFailureAt = Date.now();
        console.error('❌ MongoDB Connection Failed:', error.message);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
