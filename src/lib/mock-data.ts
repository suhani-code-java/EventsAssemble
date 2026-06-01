// Demo/mock data store for hackathon demo mode
// This allows the app to work without a MongoDB connection

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'organizer' | 'admin';
  password: string;
  skills: string[];
  interests: string[];
  points: number;
  badges: string[];
  rollNumber?: string;
  avatar?: string;
}

export interface MockEvent {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registeredCount: number;
  organizer: string;
  organizerName: string;
  skills: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  image?: string;
  qna: { id: string; question: string; answer: string; author: string; date: string }[];
  reviews: { id: string; userId: string; userName: string; rating: number; comment: string; date: string }[];
  winners: { position: number; userId: string; userName: string }[];
}

export interface MockRegistration {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  rollNumber?: string;
  eventId: string;
  status: 'registered' | 'attended' | 'cancelled';
  registeredAt: string;
  attended: boolean;
}

export interface MockNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'event' | 'reminder' | 'badge' | 'system';
  read: boolean;
  createdAt: string;
}

// ---- SEED DATA ----

export const mockUsers: MockUser[] = [
  {
    _id: 'admin-1',
    name: 'Admin',
    email: 'admin@echopod.com',
    role: 'admin',
    password: 'admin123',
    skills: ['Administration', 'System Management'],
    interests: ['Platform Management'],
    points: 0,
    badges: [],
  },
];

export const mockEvents: MockEvent[] = [];

export const mockRegistrations: MockRegistration[] = [];

export const mockNotifications: MockNotification[] = [
  { _id: 'n1', userId: 'u1', title: '🎉 Registration Confirmed', message: 'You are registered for HackSphere 2026!', type: 'event', read: false, createdAt: '2026-04-08T10:30:00Z' },
  { _id: 'n2', userId: 'u1', title: '⏰ Event Reminder', message: 'Web Dev Bootcamp starts in 4 days!', type: 'reminder', read: false, createdAt: '2026-04-11T08:00:00Z' },
  { _id: 'n3', userId: 'u1', title: '🏆 New Badge Earned!', message: 'You earned the "Tech Enthusiast" badge!', type: 'badge', read: true, createdAt: '2026-04-07T15:00:00Z' },
  { _id: 'n4', userId: 'u1', title: '📢 New Event Alert', message: 'Cloud Computing Masterclass is now open for registration', type: 'system', read: true, createdAt: '2026-04-06T12:00:00Z' },
];

export const mockBadges = [  { id: 'b5', name: 'Star Organizer', description: 'Organized 5+ events', icon: '🎯', pointsRequired: 800 },
  { id: 'b6', name: 'Community Builder', description: 'Referred 10+ users', icon: '🤝', pointsRequired: 1000 },
  { id: 'b7', name: 'Design Wizard', description: 'Won a design competition', icon: '🎨', pointsRequired: 400 },
  { id: 'b8', name: 'Data Guru', description: 'Completed a data science event', icon: '📊', pointsRequired: 600 },
  { id: 'b9', name: 'Research Pioneer', description: 'Published a paper from event work', icon: '🔬', pointsRequired: 700 },
];

// Registration trend data for analytics
export const mockRegistrationTrend = [
  { date: 'Apr 1', registrations: 12 },
  { date: 'Apr 2', registrations: 19 },
  { date: 'Apr 3', registrations: 25 },
  { date: 'Apr 4', registrations: 31 },
  { date: 'Apr 5', registrations: 28 },
  { date: 'Apr 6', registrations: 45 },
  { date: 'Apr 7', registrations: 52 },
  { date: 'Apr 8', registrations: 68 },
  { date: 'Apr 9', registrations: 74 },
  { date: 'Apr 10', registrations: 89 },
  { date: 'Apr 11', registrations: 95 },
];

// Category distribution for charts
export const mockCategoryData = [
  { name: 'Hackathon', value: 35 },
  { name: 'Workshop', value: 28 },
  { name: 'Bootcamp', value: 18 },
  { name: 'Competition', value: 12 },
  { name: 'Masterclass', value: 7 },
];

// Leaderboard data
export const mockLeaderboard = [
  { rank: 1, userId: 'u2', name: 'Riya Bansal', points: 1200, badges: 2 },
  { rank: 2, userId: 'u1', name: 'Suhani Choudhary', points: 850, badges: 3 },
  { rank: 3, userId: 'u5', name: 'Priya Singh', points: 780, badges: 2 },
  { rank: 4, userId: 'u3', name: 'Aditya Sharma', points: 620, badges: 1 },
  { rank: 5, userId: 'u4', name: 'Gagan Mehta', points: 430, badges: 1 },
];
