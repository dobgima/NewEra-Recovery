export type UserProfile = {
  firstName?: string;
  lastName?: string;
  displayName?: string | null;
  zipCode?: string | null;
  sobrietyDate?: string | null;
  phone?: string | null;
  timezone?: string | null;
  avatarUrl?: string | null;
  insuranceProvider?: string | null;
};

export type RecoveryPreferences = {
  primaryModality?: string | null;
  secondaryModality?: string | null;
  wantsReminders?: boolean;
  wantsPeerSupport?: boolean;
  dailyCheckinHour?: number | null;
  timezone?: string | null;
  notificationPrefs?: any;
  reminderPrefs?: any;
  theme?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  profile?: UserProfile | null;
  preferences?: RecoveryPreferences | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthState = AuthTokens & {
  user: AuthUser;
};
