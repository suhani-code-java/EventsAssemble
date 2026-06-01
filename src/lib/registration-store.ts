// Client-side registration store — acts as a "database" for demo mode
// Persists to localStorage so data survives navigation and shows in organizer dashboard

import { MockRegistration, mockRegistrations } from './mock-data';

const STORAGE_KEY = 'echopod_registrations';

/** Load all registrations (seed + user-created) from localStorage */
export function loadRegistrations(): MockRegistration[] {
  if (typeof window === 'undefined') return mockRegistrations;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: MockRegistration[] = JSON.parse(stored);
      // Merge: seed data first, then any new ones not in seed
      const seedIds = new Set(mockRegistrations.map(r => r._id));
      const extra = parsed.filter(r => !seedIds.has(r._id));
      return [...mockRegistrations, ...extra];
    }
  } catch {
    // ignore
  }
  return mockRegistrations;
}

/** Save a new registration to localStorage */
export function saveRegistration(reg: MockRegistration): void {
  if (typeof window === 'undefined') return;
  try {
    const current = loadRegistrations();
    // Avoid duplicates
    const exists = current.some(r => r.userId === reg.userId && r.eventId === reg.eventId);
    if (exists) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing: MockRegistration[] = stored ? JSON.parse(stored) : [];
    const alreadyStored = existing.some(r => r.userId === reg.userId && r.eventId === reg.eventId);
    if (!alreadyStored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, reg]));
    }
  } catch {
    // ignore
  }
}

/** Check if user is registered for an event */
export function isRegistered(userId: string, eventId: string): boolean {
  const all = loadRegistrations();
  return all.some(r => r.userId === userId && r.eventId === eventId);
}

/** Get all event IDs that a specific user is registered for */
export function getUserRegisteredEventIds(userId: string): string[] {
  return loadRegistrations()
    .filter(r => r.userId === userId)
    .map(r => r.eventId);
}

/** Get all registrations for a specific event (for organizer dashboard) */
export function getEventRegistrations(eventId: string): MockRegistration[] {
  return loadRegistrations().filter(r => r.eventId === eventId);
}

/** Create a new registration object */
export function createRegistration(userId: string, eventId: string): MockRegistration {
  return {
    _id: `reg_${userId}_${eventId}_${Date.now()}`,
    userId,
    eventId,
    status: 'registered',
    registeredAt: new Date().toISOString(),
    attended: false,
  };
}
