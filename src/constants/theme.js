/**
 * Theme constants
 * Centralized color palette and theme configuration
 */

export const COLORS = {
  // Primary colors
  primary: '#667eea',
  primaryDark: '#5568d3',
  primaryLight: '#7e8ef0',
  
  // Secondary colors
  secondary: '#764ba2',
  secondaryDark: '#5e3c82',
  secondaryLight: '#8e5cb2',
  
  // Accent colors
  accent: '#ff6347',
  accentDark: '#e5533d',
  accentLight: '#ff7a5e',
  
  // Background colors (light mode)
  backgroundLight: '#f5f7fa',
  paperLight: '#ffffff',
  
  // Background colors (dark mode)
  backgroundDark: '#0f0f0f',
  paperDark: '#1e1e1e',
  cardDark: '#2a2a2a',
  
  // Text colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textDisabled: '#999999',
  
  // Status colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  
  // Gradient colors
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
};

export const GRADIENTS = {
  primary: `linear-gradient(135deg, ${COLORS.gradientStart} 0%, ${COLORS.gradientEnd} 100%)`,
  success: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
  warning: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
  error: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
  info: 'linear-gradient(135deg, #2196f3 0%, #03a9f4 100%)',
};

export const SHADOWS = {
  sm: '0 2px 4px rgba(0,0,0,0.1)',
  md: '0 4px 8px rgba(0,0,0,0.15)',
  lg: '0 8px 16px rgba(0,0,0,0.2)',
  xl: '0 12px 24px rgba(0,0,0,0.25)',
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    xxl: '2rem',
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const TRANSITIONS = {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
};

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};
