import { Platform } from 'react-native';

// 네이티브 감성 — iOS 시스템 그레이/블루, Android Material 3 톤
export const theme = Platform.select({
  ios: { bg: '#F2F2F7', card: '#FFFFFF', accent: '#007AFF', text: '#000000', muted: '#8E8E93', radius: 12 },
  android: { bg: '#F8F9FA', card: '#FFFFFF', accent: '#6750A4', text: '#1D1B20', muted: '#79747E', radius: 16 },
  default: { bg: '#F8F9FA', card: '#FFFFFF', accent: '#007AFF', text: '#000000', muted: '#8E8E93', radius: 12 },
});
