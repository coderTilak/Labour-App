export const Colors = {
  primary: '#0F766E',
  primaryLight: '#CCFBF1',
  secondary: '#2563EB',
  accent: '#F59E0B',
  success: '#16A34A',
  warning: '#F97316',
  error: '#DC2626',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  placeholder: '#9CA3AF',
  disabled: '#D1D5DB',
  
  // Overlay colors
  overlay: 'rgba(15, 23, 42, 0.4)',
  shadow: '#0F172A',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  cards: 20,
  buttons: 14,
  input: 14,
  full: 9999,
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Typography = {
  fontFamily: 'Inter',
  
  displayLarge: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  displayMedium: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  headline: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  bodyMedium: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  bodySmall: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  
  // Custom font weights to map when fonts load
  weights: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  }
};
