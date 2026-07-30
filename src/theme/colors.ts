/**
 * Hermes Mobile 主题系统
 * 从 HermesSkin 语义颜色中提取移动端主题色板
 */

export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F7',
    surfaceElevated: '#FFFFFF',
    primary: '#007AFF',
    primaryLight: '#E9F2FF',
    text: '#1D1D1F',
    textSecondary: '#86868B',
    textTertiary: '#C7C7CC',
    border: '#E5E5EA',
    borderLight: '#F2F2F7',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    tool: '#5856D6',
    thinking: '#AF52DE',
    userBubble: '#007AFF',
    userBubbleText: '#FFFFFF',
    assistantBubble: '#F2F2F7',
    assistantBubbleText: '#1D1D1F',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E5EA',
    tabBarInactive: '#8E8E93',
    overlay: 'rgba(0,0,0,0.4)',
  },
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    primary: '#0A84FF',
    primaryLight: '#1A2A3A',
    text: '#F5F5F7',
    textSecondary: '#98989D',
    textTertiary: '#636366',
    border: '#38383A',
    borderLight: '#2C2C2E',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    tool: '#5E5CE6',
    thinking: '#BF5AF2',
    userBubble: '#0A84FF',
    userBubbleText: '#FFFFFF',
    assistantBubble: '#2C2C2E',
    assistantBubbleText: '#F5F5F7',
    tabBar: '#1C1C1E',
    tabBarBorder: '#38383A',
    tabBarInactive: '#636366',
    overlay: 'rgba(0,0,0,0.6)',
  },
} as const;

/** 主题颜色接口 (非字面量) */
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryLight: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  tool: string;
  thinking: string;
  userBubble: string;
  userBubbleText: string;
  assistantBubble: string;
  assistantBubbleText: string;
  tabBar: string;
  tabBarBorder: string;
  tabBarInactive: string;
  overlay: string;
}
export type ColorScheme = 'light' | 'dark';

export function getColors(scheme: ColorScheme): ThemeColors {
  return scheme === 'dark' ? colors.dark : colors.light;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  small: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 15,
  },
  code: {
    fontSize: 14,
    fontFamily: 'SpaceMono' as const,
    lineHeight: 20,
  },
} as const;

export function resolveColorScheme(raw: string | null | undefined): ColorScheme {
  return raw === 'dark' ? 'dark' : 'light';
}

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;
