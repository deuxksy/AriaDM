import { Aria2 } from '../rpc/methods';
import { computeNewCompletions } from './diff';
import { downloadName } from '../../shared/format';

export interface SeenStore {
  load(): string[];
  save(gids: string[]): void;
}

// background task와 단위 테스트가 공유하는 핵심 로직.
// 첫 실행(seen 비어 있음)은 baseline 초기화 — 기존 완료 전부를 알림 없이 seen으로 등록 (알림 폭주 방지).
// 한계: tellStopped(0, 200) 창은 최근 200건 — 200 초과 신규 완료는 다음 주기에 걸릴 수 있음 (seen 상한 300과 정합)
export async function runCompletionCheck(
  conn: Parameters<typeof Aria2.tellStopped>[0],
  seenStore: SeenStore,
  notify: (name: string) => Promise<void>,
): Promise<number> {
  const stopped = await Aria2.tellStopped(conn, 0, 200);
  const loaded = seenStore.load();
  const seen = new Set(loaded);
  if (loaded.length === 0) {
    // baseline — 현재 완료 전부 기록, 알림 없음
    seenStore.save(stopped.filter((d) => d.status === 'complete').map((d) => d.gid));
    return 0;
  }
  const fresh = computeNewCompletions(seen, stopped);
  for (const gid of fresh) {
    const info = await Aria2.tellStatus(conn, gid).catch(() => null);
    await notify(info ? downloadName(info) : gid);
    seen.add(gid);
  }
  seenStore.save([...seen].slice(-300));
  return fresh.length;
}
