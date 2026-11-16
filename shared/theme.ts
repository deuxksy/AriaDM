import { Platform } from 'react-native';

export type ThemeMode = 'auto' | 'light' | 'dark';
export interface ThemeTokens {
  bg: string;
  card: string;
  accent: string;
  text: string;
  muted: string;
  radius: number;
}

// 네이티브 감성 — iOS 시스템 그레이/블루, Android Material 3 톤. dark는 각 시스템 다크 톤
export const themes: Record<'light' | 'dark', ThemeTokens> = {
  light: Platform.select({
    ios: { bg: '#F2F2F7', card: '#FFFFFF', accent: '#007AFF', text: '#000000', muted: '#8E8E93', radius: 12 },
    android: { bg: '#F8F9FA', card: '#FFFFFF', accent: '#6750A4', text: '#1D1B20', muted: '#79747E', radius: 16 },
    default: { bg: '#F8F9FA', card: '#FFFFFF', accent: '#007AFF', text: '#000000', muted: '#8E8E93', radius: 12 },
  }),
  dark: Platform.select({
    ios: { bg: '#000000', card: '#1C1C1E', accent: '#0A84FF', text: '#FFFFFF', muted: '#8E8E93', radius: 12 },
    android: { bg: '#141218', card: '#1D1B20', accent: '#D0BCFF', text: '#E6E0E9', muted: '#CAC4D0', radius: 16 },
    default: { bg: '#000000', card: '#1C1C1E', accent: '#0A84FF', text: '#FFFFFF', muted: '#8E8E93', radius: 12 },
  }),
};

// 레거시 — 소비자 useTheme 전환 완료 후 제거 예정
export const theme: ThemeTokens = themes.light;
