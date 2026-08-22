import http from 'http';
import https from 'https';

// jest-expo 환경의 전역 fetch는 실제 네트워크를 수행하지 않고 빈 응답을 반환 —
// 통합 테스트에서 Aria2Connection.fetchImpl 으로 주입할 node http 기반 구현
// (connection은 항상 string url로만 호출 — 캐스트는 단위 테스트 fetchImpl 주입과 동일 패턴)
function nodeFetchImpl(url: string, init: RequestInit): Promise<Response> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const body = init.body !== undefined && init.body !== null ? String(init.body) : undefined;
    // Content-Length 필수 — 없으면 node가 chunked 전송을 쓰고 aria2 RPC가 파싱 거부 (-32700)
    const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
    if (body !== undefined && headers['Content-Length'] === undefined) {
      headers['Content-Length'] = String(Buffer.byteLength(body));
    }
    const req = mod.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: `${u.pathname}${u.search}`,
        method: init.method ?? 'GET',
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          resolve({ text: () => Promise.resolve(Buffer.concat(chunks).toString('utf8')) } as unknown as Response);
        });
      },
    );
    req.on('error', reject);
    if (body !== undefined) req.write(body);
    req.end();
  }) as unknown as Promise<Response>;
}

export const nodeFetch = nodeFetchImpl as unknown as typeof fetch;
