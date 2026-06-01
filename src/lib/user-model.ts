import mongoose, { Schema, type Model } from 'mongoose';

export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'organizer' | 'admin';
  skills: string[];
  interests: string[];
  points: number;
  badges: string[];
  rollNumber?: string;
  avatar?: string;
  createdAt?: string;
}

const UserSchema = new Schema<UserRecord>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'organizer', 'admin'],
      default: 'student',
    },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    points: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    rollNumber: { type: String },
    avatar: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Add indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export const UserModel = (mongoose.models.User as Model<UserRecord>) || mongoose.model<UserRecord>('User', UserSchema);

export async function seedAdminUserIfNotExists() {
  const existingAdmin = await UserModel.findOne({ role: 'admin' });

  if (!existingAdmin) {
    await UserModel.create({
      _id: 'admin-1',
      name: 'Admin',
      email: 'admin@echopod.com',
      password: 'admin123',
      role: 'admin',
      skills: ['Administration', 'System Management'],
      interests: ['Platform Management'],
      points: 0,
      badges: [],
    });
  }
}
