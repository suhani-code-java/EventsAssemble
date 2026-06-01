import { mockEvents, mockNotifications, mockRegistrations, mockUsers, type MockEvent, type MockNotification, type MockRegistration, type MockUser } from './mock-data';

// In-memory fallback store for runtime when MongoDB is unavailable.
// Data is process-local and resets on server restart.
interface RuntimeStore {
  events: MockEvent[];
  registrations: MockRegistration[];
  users: MockUser[];
  notifications: MockNotification[];
}

const globalRef = globalThis as typeof globalThis & { __echopodStore?: RuntimeStore };

function cloneEvent(e: MockEvent): MockEvent {
  return {
    ...e,
    qna: [...e.qna],
    reviews: [...e.reviews],
    winners: [...e.winners],
    skills: [...e.skills],
  };
}

function cloneRegistration(r: MockRegistration): MockRegistration {
  return { ...r };
}

function cloneNotification(notification: MockNotification): MockNotification {
  return { ...notification };
}

function createInitialStore(): RuntimeStore {
  return {
    events: mockEvents.map(cloneEvent),
    registrations: mockRegistrations.map(cloneRegistration),
    users: mockUsers.map(u => ({ ...u })),
    notifications: mockNotifications.map(cloneNotification),
  };
}

export function getRuntimeStore(): RuntimeStore {
  if (!globalRef.__echopodStore) {
    globalRef.__echopodStore = createInitialStore();
    return globalRef.__echopodStore;
  }

  // Ensure backwards-compat when the store existed before users were added
  const store = globalRef.__echopodStore;
  if (!('users' in store) || !Array.isArray((store as any).users)) {
    (store as any).users = mockUsers.map(u => ({ ...u }));
  }

  return store;
}

export function listRuntimeEvents(): MockEvent[] {
  return getRuntimeStore().events;
}

export function addRuntimeEvent(event: MockEvent): void {
  getRuntimeStore().events.unshift(event);
}

export function findRuntimeEventById(id: string): MockEvent | null {
  return getRuntimeStore().events.find((e) => e._id === id) || null;
}

export function updateRuntimeEvent(id: string, updates: Partial<MockEvent>): MockEvent | null {
  const store = getRuntimeStore();
  const idx = store.events.findIndex((e) => e._id === id);
  if (idx === -1) return null;
  store.events[idx] = { ...store.events[idx], ...updates };
  return store.events[idx];
}

export function deleteRuntimeEvent(id: string): boolean {
  const store = getRuntimeStore();
  const before = store.events.length;
  store.events = store.events.filter((e) => e._id !== id);
  store.registrations = store.registrations.filter((r) => r.eventId !== id);
  return store.events.length !== before;
}

export function listRuntimeRegistrations(filter?: { userId?: string; eventId?: string }): MockRegistration[] {
  const store = getRuntimeStore();
  return store.registrations.filter((r) => {
    if (filter?.userId && r.userId !== filter.userId) return false;
    if (filter?.eventId && r.eventId !== filter.eventId) return false;
    return true;
  });
}

export function findRuntimeRegistration(userId: string, eventId: string): MockRegistration | null {
  return getRuntimeStore().registrations.find((r) => r.userId === userId && r.eventId === eventId) || null;
}

export function updateRuntimeRegistration(userId: string, eventId: string, updates: Partial<MockRegistration>): MockRegistration | null {
  const store = getRuntimeStore();
  const idx = store.registrations.findIndex((r) => r.userId === userId && r.eventId === eventId);
  if (idx === -1) return null;
  store.registrations[idx] = { ...store.registrations[idx], ...updates };
  return store.registrations[idx];
}

/** Add a registration to the runtime store (server-side fallback) */
export function addRuntimeRegistration(reg: MockRegistration): MockRegistration {
  const store = getRuntimeStore();
  // avoid duplicate
  const exists = store.registrations.some(r => r.userId === reg.userId && r.eventId === reg.eventId);
  if (!exists) {
    store.registrations.unshift({ ...reg });
    // increment event registeredCount if present
    const ev = store.events.find(e => e._id === reg.eventId);
    if (ev) {
      ev.registeredCount = (ev.registeredCount || 0) + 1;
    }
  }
  return reg;
}

export function listRuntimeNotifications(filter?: { userId?: string; eventId?: string }): MockNotification[] {
  const store = getRuntimeStore();
  return store.notifications.filter((notification) => {
    if (filter?.userId && notification.userId !== filter.userId) return false;
    if (filter?.eventId && notification.eventId !== filter.eventId) return false;
    return true;
  });
}

export function addRuntimeNotification(notification: MockNotification): MockNotification {
  const store = getRuntimeStore();
  store.notifications.unshift({ ...notification });
  return notification;
}

export function updateRuntimeNotification(notificationId: string, updates: Partial<MockNotification>): MockNotification | null {
  const store = getRuntimeStore();
  const idx = store.notifications.findIndex((notification) => notification._id === notificationId);
  if (idx === -1) return null;
  store.notifications[idx] = { ...store.notifications[idx], ...updates };
  return store.notifications[idx];
}

/** Users (server runtime demo users) */
export function listRuntimeUsers(): MockUser[] {
  return getRuntimeStore().users;
}

export function findRuntimeUserByEmail(email: string): MockUser | null {
  const store = getRuntimeStore();
  return store.users.find(u => u.email === email) || null;
}

export function addRuntimeUser(user: MockUser): MockUser {
  const store = getRuntimeStore();
  const exists = store.users.some(u => u.email === user.email);
  if (!exists) {
    store.users.push({ ...user });
  }
  return user;
}
