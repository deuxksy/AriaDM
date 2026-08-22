import { Aria2Connection } from '../core/rpc/connection';
import { FakeWs, FailingWs } from './helpers/fakeWs';

const CFG = { url: 'http://h:6800', secret: 's' };

// 요청 id를 파싱해 동일 id의 JSON-RPC envelope으로 응답하는 HTTP mock
function httpOk(result: unknown): typeof fetch {
  return ((_url: string, init?: RequestInit) => {
    const req = JSON.parse(String(init?.body ?? '{}')) as { id: number };
    return Promise.resolve(new Response(
      JSON.stringify({ jsonrpc: '2.0', id: req.id, result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ));
  }) as unknown as typeof fetch;
}

function httpErr(code: number, message: string): typeof fetch {
  return ((_url: string, init?: RequestInit) => {
    const req = JSON.parse(String(init?.body ?? '{}')) as { id: number };
    return Promise.resolve(new Response(
      JSON.stringify({ jsonrpc: '2.0', id: req.id, error: { code, message } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ));
  }) as unknown as typeof fetch;
}

test('WS 연결 후 call 응답 매칭', async () => {
  const ws = new FakeWs();
  const c = new Aria2Connection(CFG, { wsFactory: () => ws, fetchImpl: httpOk(null) });
  c.start();
  ws.open();
  const p = c.call('aria2.getVersion', ['token:s']);
  await new Promise((r) => setTimeout(r, 0)); // send 완료 대기
  const req = JSON.parse(ws.sent[0]);
  ws.message(JSON.stringify({ jsonrpc: '2.0', id: req.id, result: { version: '1.36.0' } }));
  await expect(p).resolves.toEqual({ version: '1.36.0' });
});

test('notification 이벤트 콜백', () => {
  const ws = new FakeWs();
  const c = new Aria2Connection(CFG, { wsFactory: () => ws, fetchImpl: httpOk(null) });
  const events: string[] = [];
  c.onNotification((e) => events.push(e.name));
  c.start();
  ws.open();
  ws.message('{"jsonrpc":"2.0","method":"aria2.onDownloadComplete","params":[{"gid":"g1"}]}');
  expect(events).toEqual(['onDownloadComplete']);
});

test('WS 3회 연속 실패 → degraded → HTTP call', async () => {
  let attempts = 0;
  const c = new Aria2Connection(CFG, {
    wsFactory: () => { attempts++; return new FailingWs(); },
    fetchImpl: httpOk('1.36.0'),
    wsMaxFailures: 3,
    backoffBaseMs: 1, // 백오프 압축 — 50ms 안에 3회 실패 도달
    degradeRetryMs: 3_600_000, // 테스트 중 재시도 없음
  });
  const states: string[] = [];
  c.onStateChange((s) => states.push(s));
  c.start();
  await new Promise((r) => setTimeout(r, 50));
  expect(attempts).toBe(3);
  expect(c.getState()).toBe('degraded');
  await expect(c.call('aria2.getVersion', ['token:s'])).resolves.toBe('1.36.0');
  expect(states).toContain('degraded');
  c.stop(); // 1시간 degradeTimer 정리 — jest 종료 방지
});

test('WS 끊김 시 pending 요청 즉시 reject', async () => {
  const ws = new FakeWs();
  const c = new Aria2Connection(CFG, { wsFactory: () => ws, fetchImpl: httpOk(null) });
  c.start();
  ws.open();
  const p = c.call('aria2.getVersion');
  p.catch(() => undefined); // unhandled 방지
  ws.close(); // 연결 끊김
  await expect(p).rejects.toThrow('connection lost');
  c.stop(); // 백오프 재연결 타이머 정리 — jest 종료 방지
});

test('httpOnly 모드 — 즉시 degraded', async () => {
  const c = new Aria2Connection(CFG, { httpOnly: true, fetchImpl: httpOk('ok') });
  c.start();
  expect(c.getState()).toBe('degraded');
  await expect(c.call('aria2.getVersion')).resolves.toBe('ok');
});

test('HTTP 에러 응답 → RpcError reject', async () => {
  const c = new Aria2Connection(CFG, { httpOnly: true, fetchImpl: httpErr(1, 'Unauthorized') });
  c.start();
  await expect(c.call('aria2.getVersion')).rejects.toMatchObject({ code: 1 });
});

test('reconnectNow — 백오프 무시 즉시 WS 재시도', () => {
  const sockets: FakeWs[] = [];
  const c = new Aria2Connection(CFG, {
    wsFactory: () => { const w = new FakeWs(); sockets.push(w); return w; },
    fetchImpl: httpOk(null),
  });
  c.start();
  sockets[0].open();
  expect(c.getState()).toBe('connected');
  c.reconnectNow(); // NetInfo 네트워크 복구 시 호출
  sockets[1].open();
  expect(sockets.length).toBe(2);
  expect(c.getState()).toBe('connected');
});

test('백오프 대기 중 reconnectNow — 타이머 해제로 소켓 이중 생성 방지', async () => {
  const sockets: FakeWs[] = [];
  const c = new Aria2Connection(CFG, {
    wsFactory: () => { const w = new FakeWs(); sockets.push(w); return w; },
    fetchImpl: httpOk(null),
    backoffBaseMs: 20, // 백오프 대기 타이머가 테스트 내에 만료되도록
  });
  c.start();          // sockets[0]
  sockets[0].close(); // 실패 1회 → 20ms 백오프 예약
  c.reconnectNow();   // 즉시 재시도 → sockets[1]
  await new Promise((r) => setTimeout(r, 60)); // 백오프 시간 경과
  // 예약된 백오프 타이머가 재발동하면 sockets[2]가 추가 생성됨
  expect(sockets.length).toBe(2);
  c.stop();
});

test('stop 후 상태 disconnected', () => {
  const ws = new FakeWs();
  const c = new Aria2Connection(CFG, { wsFactory: () => ws, fetchImpl: httpOk(null) });
  c.start();
  ws.open();
  c.stop();
  expect(c.getState()).toBe('disconnected');
});
