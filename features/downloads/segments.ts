import type { Aria2Status } from '../../core/rpc/types';
import type { ListKind } from './queries';

// 화면 세그먼트 4종 — stopped 쿼리 하나를 complete/failed가 공유하므로
// 세그먼트 → 쿼리 종류 매핑과 상태 필터는 순수 함수로 분리해 단위 테스트 대상으로 둔다
export type SegmentKey = 'active' | 'waiting' | 'complete' | 'failed';

export interface SegmentDef {
  key: SegmentKey;
  label: string; // i18n 키
  match: (s: Aria2Status) => boolean;
}

export const SEGMENTS: SegmentDef[] = [
  { key: 'active', label: 'seg_active', match: (s) => s === 'active' },
  { key: 'waiting', label: 'seg_waiting', match: (s) => s === 'waiting' || s === 'paused' },
  { key: 'complete', label: 'seg_complete', match: (s) => s === 'complete' },
  { key: 'failed', label: 'seg_failed', match: (s) => s === 'error' || s === 'removed' },
];

export const SEG_TO_KIND: Record<SegmentKey, ListKind> = {
  active: 'active', waiting: 'waiting', complete: 'stopped', failed: 'stopped',
};

export function filterBySegment<T extends { status: Aria2Status }>(items: T[], seg: SegmentKey): T[] {
  const def = SEGMENTS.find((s) => s.key === seg)!;
  return items.filter((d) => def.match(d.status));
}
