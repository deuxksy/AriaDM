import { runCompletionCheck } from '../core/notifications/check';

function fakeConn(stopped: { gid: string; status: string }[]) {
  const calls: string[] = [];
  return {
    calls,
    conn: {
      call: async (method: string) => {
        calls.push(method);
        if (method === 'aria2.tellStopped') return stopped;
        if (method === 'aria2.tellStatus') return { gid: 'b', files: [{ path: '/downloads/b.iso' }] };
        throw new Error('unexpected');
      },
    } as never,
  };
}

test('신규 완료 1건 — 알림 발사 + seen 갱신', async () => {
  const store = { loaded: ['a'], saved: [] as string[][], load: () => ['a'], save: (g: string[]) => { store.saved.push(g); } };
  const notified: string[] = [];
  const { conn } = fakeConn([
    { gid: 'a', status: 'complete' },
    { gid: 'b', status: 'complete' },
  ]);
  const n = await runCompletionCheck(conn as never, store, async (name) => { notified.push(name); });
  expect(n).toBe(1);
  expect(notified).toEqual(['b.iso']);
  expect(store.saved[0]).toEqual(['a', 'b']);
});

test('첫 실행(seen 비어 있음) — baseline 초기화, 알림 없음', async () => {
  const store = { loaded: [] as string[], saved: [] as string[][], load: () => store.loaded, save: (g: string[]) => { store.saved.push(g); } };
  const notified: string[] = [];
  const { conn } = fakeConn([
    { gid: 'a', status: 'complete' },
    { gid: 'b', status: 'complete' },
  ]);
  const n = await runCompletionCheck(conn as never, store, async (name) => { notified.push(name); });
  expect(n).toBe(0);
  expect(notified).toEqual([]);
  expect(store.saved[0]).toEqual(['a', 'b']);
});
