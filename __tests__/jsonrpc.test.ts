import { buildRequest, parseMessage, RpcError } from '../core/rpc/jsonrpc';

test('buildRequest — secret 토큰 파라미터 포함 직렬화', () => {
  expect(buildRequest(1, 'aria2.getVersion', ['token:s', 'a'])).toBe(
    '{"jsonrpc":"2.0","id":1,"method":"aria2.getVersion","params":["token:s","a"]}',
  );
  expect(buildRequest(2, 'aria2.getGlobalStat', ['token:s'])).toBe(
    '{"jsonrpc":"2.0","id":2,"method":"aria2.getGlobalStat","params":["token:s"]}',
  );
});

test('parseMessage — 성공 응답', () => {
  const m = parseMessage('{"id":1,"jsonrpc":"2.0","result":{"version":"1.36.0"}}');
  expect(m).toEqual({ kind: 'response', id: 1, result: { version: '1.36.0' }, error: null });
});

test('parseMessage — 에러 응답', () => {
  const m = parseMessage('{"id":1,"jsonrpc":"2.0","error":{"code":1,"message":"Unauthorized"}}');
  expect(m.kind).toBe('response');
  if (m.kind === 'response') expect(m.error?.code).toBe(1);
});

test('parseMessage — notification (id 없음)', () => {
  const m = parseMessage('{"jsonrpc":"2.0","method":"aria2.onDownloadComplete","params":[{"gid":"abc"}]}');
  expect(m).toEqual({ kind: 'notification', method: 'aria2.onDownloadComplete', params: [{ gid: 'abc' }] });
});

test('parseMessage — 잘못된 JSON', () => {
  expect(parseMessage('not json').kind).toBe('invalid');
});

test('RpcError 코드 보존', () => {
  const e = new RpcError(1, 'Unauthorized');
  expect(e.code).toBe(1);
  expect(e.message).toBe('Unauthorized');
});
