import { diagnose } from '../features/profiles/diagnose';

const CFG = { scheme: 'http' as const, host: 'h', port: 6800, secret: 's' };

function fake(body: unknown, status = 200): typeof fetch {
  return (() => Promise.resolve(new Response(JSON.stringify(body), { status }))) as unknown as typeof fetch;
}

test('성공 — 버전 반환', async () => {
  const r = await diagnose(CFG, fake({ jsonrpc: '2.0', id: 1, result: { version: '1.36.0' } }));
  expect(r).toEqual({ ok: true, version: '1.36.0' });
});

test('RPC code 1 — auth 실패 분류', async () => {
  const r = await diagnose(CFG, fake({ jsonrpc: '2.0', id: 1, error: { code: 1, message: 'Unauthorized' } }));
  expect(r).toEqual({ ok: false, kind: 'auth' });
});

test('fetch 예외 — unreachable 분류', async () => {
  const failing = (() => Promise.reject(new TypeError('Network request failed'))) as unknown as typeof fetch;
  const r = await diagnose(CFG, failing);
  expect(r).toEqual({ ok: false, kind: 'unreachable' });
});
