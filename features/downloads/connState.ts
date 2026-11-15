import type { ConnState } from '../../core/rpc/types';

// DownloadList 상단 배지용 — 색은 고정 hex로 지정 (시스템 다크모드 네이티브 테마와 무관하게)
export const CONN_STATE_META: Record<ConnState, { key: string; color: string }> = {
  connecting: { key: 'conn_connecting', color: '#FF9500' },
  connected: { key: 'conn_connected', color: '#34C759' },
  degraded: { key: 'conn_degraded', color: '#79747E' },
  disconnected: { key: 'conn_disconnected', color: '#FF3B30' },
};
