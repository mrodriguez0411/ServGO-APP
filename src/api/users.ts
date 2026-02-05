// src/api/users.ts
// Simple stubs for admin review flow. Replace with real HTTP requests when backend is ready.

export type AccountStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'client' | 'provider';
  createdAt: string;
  status: AccountStatus;
  documents?: Array<{
    id: string;
    type: 'id_front' | 'id_back' | 'selfie' | 'certification' | 'other';
    url: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
}

// In-memory mock DB for development only
const mockPending: PendingUser[] = [];

export async function listPending(): Promise<PendingUser[]> {
  // Simulate latency
  await new Promise(r => setTimeout(r, 400));
  return mockPending.filter(u => u.status === 'pending' || u.status === 'in_review');
}

export async function approveUser(id: string): Promise<void> {
  await new Promise(r => setTimeout(r, 400));
  const u = mockPending.find(u => u.id === id);
  if (u) u.status = 'approved';
}

export async function rejectUser(id: string, reason?: string): Promise<void> {
  await new Promise(r => setTimeout(r, 400));
  const u = mockPending.find(u => u.id === id);
  if (u) u.status = 'rejected';
}

export async function notifyAdmin(newUser: PendingUser): Promise<void> {
  await new Promise(r => setTimeout(r, 200));
  // In real life: push/email/notification center
  console.log('[notifyAdmin] Nuevo usuario pendiente:', newUser);
}

// Helper for local usage: add a pending user (e.g., from RegisterScreen submit)
export async function addPendingUser(u: PendingUser): Promise<void> {
  await new Promise(r => setTimeout(r, 100));
  mockPending.unshift(u);
}
