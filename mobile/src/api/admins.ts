// src/api/admins.ts
// Admin "table" abstraction for development. Replace AsyncStorage with real DB in production.

import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_TABLE_KEY = 'servigo_admins';

export interface Admin {
  id: string;
  name: string;
  email: string;
  // WARNING: For demo only. Do NOT store plaintext passwords in production.
  password?: string;
  active: boolean;
  createdAt: string;
}

async function readTable(): Promise<Admin[]> {
  const raw = await AsyncStorage.getItem(ADMIN_TABLE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Admin[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeTable(rows: Admin[]): Promise<void> {
  await AsyncStorage.setItem(ADMIN_TABLE_KEY, JSON.stringify(rows));
}

export async function listAdmins(): Promise<Admin[]> {
  return readTable();
}

export async function isAdminEmail(email: string): Promise<boolean> {
  const rows = await readTable();
  return rows.some(a => a.email.toLowerCase() === email.toLowerCase() && a.active);
}

export async function createAdmin(input: { name: string; email: string; password?: string; active?: boolean }): Promise<{ success: boolean; error?: string; admin?: Admin }> {
  const rows = await readTable();
  const exists = rows.some(a => a.email.toLowerCase() === input.email.toLowerCase());
  if (exists) {
    return { success: false, error: 'El email ya está registrado como admin' };
  }
  const admin: Admin = {
    id: `admin_${Date.now()}`,
    name: input.name,
    email: input.email,
    password: input.password, // DEMO ONLY
    active: input.active ?? true,
    createdAt: new Date().toISOString(),
  };
  rows.push(admin);
  await writeTable(rows);
  return { success: true, admin };
}

export async function deactivateAdmin(id: string): Promise<void> {
  const rows = await readTable();
  const idx = rows.findIndex(a => a.id === id);
  if (idx >= 0) {
    rows[idx].active = false;
    await writeTable(rows);
  }
}

// Optional: development seed
export async function seedDefaultAdmin(name: string, email: string, password?: string): Promise<void> {
  const rows = await readTable();
  const exists = rows.some(a => a.email.toLowerCase() === email.toLowerCase());
  if (!exists) {
    await createAdmin({ name, email, password, active: true });
  }
}
