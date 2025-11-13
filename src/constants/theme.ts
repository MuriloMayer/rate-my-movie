export const colors = {
  primary: '#E50914',    
  primaryDark: '#B20710',
  secondary: '#564D4D',
  background: '#141414',
  surface: '#1F1F1F',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  error: '#CF6679',
  success: '#4CAF50',
  warning: '#FF9800',
  border: '#2F2F2F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: 'normal' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
};