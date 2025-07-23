export const COLORS = {
  primary: '#FE7359',
  background: '#121E28',
  card: '#1E293B',
  textPrimary: '#FFFFFF',
  textSecondary: '#CBD5E1',
  border: '#334155',
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;

export const APP_CONFIG = {
  name: 'SafeBank',
  version: '1.0.0',
  storageKeys: {
    theme: '@safebank:theme',
    user: '@safebank:user',
    biometric: '@safebank:biometric',
  },
} as const;

export const ERROR_MESSAGES = {
  auth: {
    invalidCredentials: 'Invalid email or password',
    emailAlreadyInUse: 'This email is already in use',
    weakPassword: 'Password must be at least 6 characters',
    userNotFound: 'User not found',
  },
  network: {
    offline: 'You are offline',
    timeout: 'Connection timeout',
    generic: 'Connection error',
  },
  biometric: {
    notAvailable: 'Biometrics not available',
    notEnrolled: 'No biometrics enrolled',
    cancelled: 'Authentication cancelled',
  },
} as const; 