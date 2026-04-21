import { API_BASE } from '@/constants/app';
import type { CheckinRecord } from '@/types/checkin';
import type { RecoveryPlan } from '@/types/recovery-plan';
import type { CrisisPlan } from '@/types/crisis-plan';
import type { Milestone } from '@/types/milestone';
const API_URL = import.meta.env.VITE_API_BASE_URL || API_BASE;

async function fetchJson<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    const message = json?.message || response.statusText || 'Request failed.';
    if (response.status === 401) {
      // Handle session expiration
      localStorage.removeItem('newera-recovery-auth');
      window.location.href = '/'; // Redirect to landing
      throw new Error('Session expired');
    }
    throw new Error(message);
  }

  return response.json();
}

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { firstName: string; lastName: string; email: string; password: string };

import type { AuthUser } from '@/types/auth';

export async function login(payload: LoginPayload) {
  return fetchJson<{ tokens?: { accessToken: string; refreshToken: string }; user?: AuthUser; requiresTwoFactor?: boolean; twoFactorToken?: string }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify(payload) },
  );
}

export async function register(payload: RegisterPayload) {
  return fetchJson<{ tokens: { accessToken: string; refreshToken: string }; user: AuthUser }>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify(payload) },
  );
}

// Password Recovery
export async function forgotPassword(payload: { email: string }) {
  return fetchJson<{ message: string }>(
    '/auth/forgot-password',
    { method: 'POST', body: JSON.stringify(payload) },
  );
}

export async function resetPassword(payload: { token: string; password: string }) {
  return fetchJson<{ message: string }>(
    '/auth/reset-password',
    { method: 'POST', body: JSON.stringify(payload) },
  );
}

// 2FA
export async function setupTwoFactor(token: string, payload: { method: 'email' | 'sms' }) {
  return fetchJson<{ sessionToken: string; message: string }>(
    '/auth/2fa/setup',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

export async function verifyTwoFactorSetup(token: string, payload: { token: string; code: string }) {
  return fetchJson<{ message: string; twoFactorEnabled: boolean }>(
    '/auth/2fa/verify-setup',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

export async function verifyTwoFactorLogin(payload: { twoFactorToken: string; code: string }) {
  return fetchJson<{ tokens: { accessToken: string; refreshToken: string }; user: AuthUser; twoFactorEnabled: boolean }>(
    '/auth/2fa/verify',
    { method: 'POST', body: JSON.stringify(payload) },
  );
}

export async function disableTwoFactor(token: string, payload: { password: string }) {
  return fetchJson<{ message: string; twoFactorEnabled: boolean }>(
    '/auth/2fa/disable',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

export async function getTwoFactorStatus(token: string) {
  return fetchJson<{ requiresTwoFactor: boolean }>(
    '/auth/2fa/status',
    { method: 'GET' },
    token,
  );
}

export async function getMe(token: string) {
  return fetchJson<AuthUser>('/users/me', { method: 'GET' }, token);
}

export async function getCheckins(token: string) {
  return fetchJson<CheckinRecord[]>('/checkins/mine', { method: 'GET' }, token);
}

export async function createCheckin(token: string, payload: Partial<CheckinRecord>) {
  return fetchJson<CheckinRecord>('/checkins', { method: 'POST', body: JSON.stringify(payload) }, token);
}

export async function getRecoveryPlan(token: string) {
  return fetchJson<RecoveryPlan>('/recovery-plan/mine', { method: 'GET' }, token);
}

export async function saveRecoveryPlan(token: string, payload: RecoveryPlan) {
  return fetchJson<RecoveryPlan>('/recovery-plan', { method: 'PUT', body: JSON.stringify(payload) }, token);
}

export async function getCrisisPlan(token: string) {
  return fetchJson<CrisisPlan>('/crisis-plan/mine', { method: 'GET' }, token);
}

export async function saveCrisisPlan(token: string, payload: CrisisPlan) {
  return fetchJson<CrisisPlan>('/crisis-plan', { method: 'PUT', body: JSON.stringify(payload) }, token);
}

export async function getMilestones(token: string) {
  return fetchJson<Milestone[]>('/milestones/mine', { method: 'GET' }, token);
}

export async function createMilestone(token: string, payload: Omit<Milestone, 'id' | 'achievedAt'>) {
  return fetchJson<Milestone>('/milestones', { method: 'POST', body: JSON.stringify(payload) }, token);
}

export async function updateMe(token: string, payload: any) {
  return fetchJson<{ id: string; email: string; profile: any; preferences: any }>('/users/me', { method: 'PATCH', body: JSON.stringify(payload) }, token);
}

export type SupportContact = {
  id: string;
  userId: string;
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  isEmergency: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateSupportContactPayload = {
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  isEmergency?: boolean;
  isPrimary?: boolean;
};

export type UpdateSupportContactPayload = {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  isEmergency?: boolean;
  isPrimary?: boolean;
};

export async function getSupportContacts(token: string) {
  return fetchJson<SupportContact[]>('/support-contacts', { method: 'GET' }, token);
}

export async function createSupportContact(token: string, payload: CreateSupportContactPayload) {
  return fetchJson<SupportContact>('/support-contacts', { method: 'POST', body: JSON.stringify(payload) }, token);
}

export async function updateSupportContact(token: string, id: string, payload: UpdateSupportContactPayload) {
  return fetchJson<SupportContact>(`/support-contacts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token);
}

export async function deleteSupportContact(token: string, id: string) {
  return fetchJson<void>(`/support-contacts/${id}`, { method: 'DELETE' }, token);
}
