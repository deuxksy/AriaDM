export type DiagResult = { ok: true; version: string } | { ok: false; kind: 'auth' | 'unreachable' };

// RN fetch는 포트 차단/TLS/네트워크 오류를 구분하지 않음 — unreachable로 통합
export async function diagnose(
  cfg: { scheme: 'http' | 'https'; host: string; port: number; secret: string },
  fetchImpl: typeof fetch = ((u: string, i?: RequestInit) => fetch(u, i)) as typeof fetch,
): Promise<DiagResult> {
  try {
    const res = await fetchImpl(`${cfg.scheme}://${cfg.host}:${cfg.port}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'aria2.getVersion',
        params: [`token:${cfg.secret}`],
      }),
    });
    const body = JSON.parse(await res.text()) as {
      result?: { version?: string };
      error?: { code: number };
    };
    if (body.error) return { ok: false, kind: 'auth' };
    return { ok: true, version: body.result?.version ?? '?' };
  } catch (e) {
    console.warn('[diag]', `${cfg.scheme}://${cfg.host}:${cfg.port}`, e instanceof Error ? `${e.message} ${String((e as Error & { cause?: unknown }).cause ?? '')}` : String(e));
    return { ok: false, kind: 'unreachable' };
  }
}
