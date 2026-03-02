export const colors = {
  // Primary Colors
  primary: {
    main: '#1F2A44',      // Deep Indigo
    light: '#2D3A5C',
    dark: '#151E30',
  },
  
  // Secondary Colors
  secondary: {
    main: '#2563EB',      // Electric Blue
    light: '#3B82F6',
    dark: '#1D4ED8',
  },
  
  // Accent Colors
  accent: {
    main: '#14B8A6',      // Vibrant Teal
    light: '#2DD4BF',
    dark: '#0F766E',
  },
  
  // Neutral Colors
  neutral: {
    light: '#F8FAFC',
    50: '#F1F5F9',
    100: '#E2E8F0',
    200: '#CBD5E1',
    300: '#94A3B8',
    400: '#64748B',
    500: '#475569',
    600: '#334155',
    700: '#1E293B',
    800: '#0F172A',
    dark: '#0F172A',
  },
  
  // Status Colors
  success: {
    main: '#22C55E',
    light: '#4ADE80',
    dark: '#16A34A',
  },
  
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },
  
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },
  
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
  },
  
  // Background Colors
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
    dark: '#0F172A',
  },
  
  // Text Colors
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    disabled: '#94A3B8',
    inverse: '#F8FAFC',
  },
} as const;

export type ColorPalette = typeof colors;
