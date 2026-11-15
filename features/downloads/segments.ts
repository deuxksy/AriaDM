import type { Aria2Status } from '../../core/rpc/types';
import type { ListKind } from './queries';

// 화면 세그먼트 — 'all'은 3종 쿼리 병합 집계, 나머지 4종은 stopped 쿼리를 complete/failed가 공유
// 세그먼트 → 쿼리 종류 매핑과 상태 필터는 순수 함수로 분리해 단위 테스트 대상으로 둔다
export type SegmentKey = 'all' | 'active' | 'waiting' | 'complete' | 'failed';

export interface SegmentDef {
  key: SegmentKey;
  label: string; // i18n 키
  match: (s: Aria2Status) => boolean;
}

export const SEGMENTS: SegmentDef[] = [
  { key: 'all', label: 'seg_all', match: () => true },
  { key: 'active', label: 'seg_active', match: (s) => s === 'active' },
  { key: 'waiting', label: 'seg_waiting', match: (s) => s === 'waiting' || s === 'paused' },
  { key: 'complete', label: 'seg_complete', match: (s) => s === 'complete' },
  { key: 'failed', label: 'seg_failed', match: (s) => s === 'error' || s === 'removed' },
];

export const SEG_TO_KIND: Record<SegmentKey, ListKind> = {
  all: 'stopped', // 페이징 확장 판단용 — 실제 조회는 DownloadList에서 3종 병합
  active: 'active', waiting: 'waiting', complete: 'stopped', failed: 'stopped',
};

export function filterBySegment<T extends { status: Aria2Status }>(items: T[], seg: SegmentKey): T[] {
  const def = SEGMENTS.find((s) => s.key === seg)!;
  return items.filter((d) => def.match(d.status));
}
