export class RpcError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

export function buildRequest(id: number, method: string, params: unknown[] = []): string {
  return JSON.stringify({ jsonrpc: '2.0', id, method, params });
}

export type RpcMessage =
  | { kind: 'response'; id: number; result: unknown; error: { code: number; message: string } | null }
  | { kind: 'notification'; method: string; params: unknown[] }
  | { kind: 'invalid' };

export function parseMessage(raw: string): RpcMessage {
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return { kind: 'invalid' };
  }
  if (typeof v !== 'object' || v === null) return { kind: 'invalid' };
  const o = v as Record<string, unknown>;
  if ('method' in o && typeof o.method === 'string' && !('id' in o)) {
    return { kind: 'notification', method: o.method, params: Array.isArray(o.params) ? o.params : [] };
  }
  if ('id' in o && (typeof o.id === 'number' || typeof o.id === 'string')) {
    const err = o.error as { code: number; message: string } | undefined;
    return { kind: 'response', id: Number(o.id), result: o.result, error: err ?? null };
  }
  return { kind: 'invalid' };
}
