import { colors } from './colors';
import { typography, typographyVariants } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  typographyVariants,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;

export * from './colors';
export * from './typography';
export * from './spacing';
