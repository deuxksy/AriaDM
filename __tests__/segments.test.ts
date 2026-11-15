import { SEGMENTS, SEG_TO_KIND, filterBySegment } from '../features/downloads/segments';
import type { Aria2Status } from '../core/rpc/types';

const ALL: Aria2Status[] = ['active', 'waiting', 'paused', 'error', 'complete', 'removed'];

function items(statuses: Aria2Status[]) {
  return statuses.map((status, i) => ({ gid: `g${i}`, status }));
}

describe('세그먼트 필터', () => {
  // 'all'은 집계 세그먼트 — 파티션 검증 대상에서 제외
  const FILTERED = SEGMENTS.filter((s) => s.key !== 'all');

  test('필터 세그먼트 4종이 aria2 상태 6종을 누락·중복 없이 커버한다', () => {
    // 세그먼트별 매칭 결과를 합치면 전체 상태 각 1회 등장해야 함
    const counts = new Map<Aria2Status, number>();
    for (const s of ALL) counts.set(s, 0);
    for (const seg of FILTERED) {
      for (const st of ALL) if (seg.match(st)) counts.set(st, (counts.get(st) ?? 0) + 1);
    }
    for (const [st, n] of counts) expect(`${st}=${n}`).toBe(`${st}=1`);
  });

  test("'all' 세그먼트는 첫 번째이고 모든 상태를 매칭한다", () => {
    expect(SEGMENTS[0].key).toBe('all');
    for (const st of ALL) expect(SEGMENTS[0].match(st)).toBe(true);
  });

  test("filterBySegment 'all' — 입력 그대로 전체 반환", () => {
    const src = items(ALL);
    expect(filterBySegment(src, 'all')).toEqual(src);
  });

  test('filterBySegment — waiting은 paused 포함, complete는 complete만', () => {
    const src = items(ALL);
    const waiting = filterBySegment(src, 'waiting').map((d) => d.status);
    expect(waiting).toEqual(['waiting', 'paused']);
    const complete = filterBySegment(src, 'complete').map((d) => d.status);
    expect(complete).toEqual(['complete']);
    const failed = filterBySegment(src, 'failed').map((d) => d.status);
    expect(failed).toEqual(['error', 'removed']);
  });

  test('SEG_TO_KIND — complete/failed는 stopped 쿼리 공유', () => {
    expect(SEG_TO_KIND.active).toBe('active');
    expect(SEG_TO_KIND.waiting).toBe('waiting');
    expect(SEG_TO_KIND.complete).toBe('stopped');
    expect(SEG_TO_KIND.failed).toBe('stopped');
    expect(SEG_TO_KIND.all).toBe('stopped'); // 페이징 확장 판단용 — 실제 조회는 3종 병합
  });
});
