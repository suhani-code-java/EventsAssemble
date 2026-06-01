import mongoose, { Schema, type Model } from 'mongoose';
import { mockRegistrations, type MockRegistration } from './mock-data';

export type RegistrationRecord = MockRegistration;

const RegistrationSchema = new Schema<RegistrationRecord>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String },
    userEmail: { type: String },
    rollNumber: { type: String },
    eventId: { type: String, required: true },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      required: true,
    },
    registeredAt: { type: String, required: true },
    attended: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Add indexes for faster queries
RegistrationSchema.index({ userId: 1 });
RegistrationSchema.index({ eventId: 1 });
RegistrationSchema.index({ registeredAt: -1 });
RegistrationSchema.index({ userId: 1, eventId: 1 });

export const RegistrationModel = (mongoose.models.Registration as Model<RegistrationRecord>) || mongoose.model<RegistrationRecord>('Registration', RegistrationSchema);

export async function seedRegistrationsIfEmpty() {
  const existingCount = await RegistrationModel.countDocuments();

  if (existingCount === 0) {
    await RegistrationModel.insertMany(mockRegistrations);
  }
}