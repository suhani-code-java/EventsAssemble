import mongoose, { Schema, type Model } from 'mongoose';
import { mockEvents, type MockEvent } from './mock-data';

export type EventRecord = MockEvent;

const QuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: String, required: true },
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: String, required: true },
  },
  { _id: false }
);

const WinnerSchema = new Schema(
  {
    position: { type: Number, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
  },
  { _id: false }
);

const EventSchema = new Schema<EventRecord>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    registeredCount: { type: Number, default: 0 },
    organizer: { type: String, required: true },
    organizerName: { type: String, required: true },
    skills: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
    image: { type: String },
    qna: { type: [QuestionSchema], default: [] },
    reviews: { type: [ReviewSchema], default: [] },
    winners: { type: [WinnerSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Add indexes for faster queries
EventSchema.index({ date: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ organizer: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ date: 1, status: 1 });

export const EventModel = (mongoose.models.Event as Model<EventRecord>) || mongoose.model<EventRecord>('Event', EventSchema);

export async function seedEventsIfEmpty() {
  const existingCount = await EventModel.countDocuments();

  if (existingCount === 0) {
    await EventModel.insertMany(
      mockEvents.map(event => ({
        ...event,
        qna: [...event.qna],
        reviews: [...event.reviews],
        winners: [...event.winners],
      }))
    );
  }
}