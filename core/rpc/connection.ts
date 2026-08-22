import { parseMessage, RpcError, buildRequest } from './jsonrpc';
import type { Aria2Event, Aria2EventName, ConnState } from './types';

export interface WSLike {
  send(data: string): void;
  close(): void;
  onopen: (() => void) | null;
  onmessage: ((ev: { data: unknown }) => void) | null;
  onclose: (() => void) | null;
  onerror: ((ev: unknown) => void) | null;
}

export interface ConnectionConfig {
  url: string; // http(s)://host:port
  secret: string;
}

export interface ConnectionOptions {
  httpOnly?: boolean;
  wsFactory?: (url: string) => WSLike;
  fetchImpl?: typeof fetch;
  wsMaxFailures?: number; // 기본 3 — 연속 실패 시 degraded 전환
  degradeRetryMs?: number; // 기본 60_000 — degraded에서 WS 재시도 주기
  backoffBaseMs?: number; // 기본 1000 — 재연결 백오프 기준(× 실패 횟수)
  callTimeoutMs?: number;  // 기본 8000
}

const NOTIFICATIONS: Record<string, Aria2EventName> = {
  'aria2.onDownloadStart': 'onDownloadStart',
  'aria2.onDownloadComplete': 'onDownloadComplete',
  'aria2.onDownloadError': 'onDownloadError',
  'aria2.onBtDownloadComplete': 'onBtDownloadComplete',
};

export class Aria2Connection {
  private ws: WSLike | null = null;
  private state: ConnState = 'disconnected';
  private nextId = 1;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  private notifCbs = new Set<(e: Aria2Event) => void>();
  private stateCbs = new Set<(s: ConnState) => void>();
  private failureCount = 0;
  private wsFailures = 0;
  private stopped = true;
  private degradeTimer: ReturnType<typeof setTimeout> | null = null;
  private backoffTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly o: Required<Pick<ConnectionOptions, 'wsMaxFailures' | 'degradeRetryMs' | 'backoffBaseMs' | 'callTimeoutMs'>>;

  constructor(
    private config: ConnectionConfig,
    options: ConnectionOptions = {},
  ) {
    this.o = {
      wsMaxFailures: options.wsMaxFailures ?? 3,
      degradeRetryMs: options.degradeRetryMs ?? 60_000,
      backoffBaseMs: options.backoffBaseMs ?? 1000, // 테스트에서 1로 주입해 백오프 압축
      callTimeoutMs: options.callTimeoutMs ?? 8000,
    };
    this.httpOnly = options.httpOnly ?? false;
    this.wsFactory = options.wsFactory ?? ((url) => new WebSocket(url) as unknown as WSLike);
    this.fetchImpl = options.fetchImpl ?? ((u, i) => fetch(u, i));
  }

  private httpOnly: boolean;
  private wsFactory: (url: string) => WSLike;
  private fetchImpl: typeof fetch;

  private get wsUrl(): string {
    const u = this.config.url.replace(/^http/, 'ws'); // http→ws, https→wss
    return `${u}/jsonrpc`;
  }

  private tokenParams(params: unknown[] = []): unknown[] {
    return [`token:${this.config.secret}`, ...params];
  }

  private setState(s: ConnState): void {
    if (this.state === s) return;
    this.state = s;
    for (const cb of this.stateCbs) cb(s);
  }

  start(): void {
    this.stopped = false;
    if (this.httpOnly) { this.setState('degraded'); return; }
    this.connectWs();
  }

  stop(): void {
    this.stopped = true;
    if (this.degradeTimer) clearTimeout(this.degradeTimer);
    if (this.backoffTimer) clearTimeout(this.backoffTimer);
    this.ws?.close();
    this.ws = null;
    for (const [, p] of this.pending) { clearTimeout(p.timer); p.reject(new Error('connection stopped')); }
    this.pending.clear();
    this.setState('disconnected');
  }

  getState(): ConnState { return this.state; }

  private connectWs(): void {
    if (this.stopped) return;
    this.setState('connecting');
    const ws = this.wsFactory(this.wsUrl);
    this.ws = ws;
    ws.onopen = () => {
      this.wsFailures = 0;
      this.setState('connected');
    };
    ws.onmessage = (ev) => {
      if (typeof ev.data !== 'string') return;
      const m = parseMessage(ev.data);
      if (m.kind === 'notification') {
        const name = NOTIFICATIONS[m.method];
        if (!name) return;
        const gid = (m.params[0] as { gid?: string })?.gid ?? '';
        for (const cb of this.notifCbs) cb({ name, gid });
      } else if (m.kind === 'response') {
        const p = this.pending.get(m.id);
        if (!p) return;
        clearTimeout(p.timer);
        this.pending.delete(m.id);
        if (m.error) p.reject(new RpcError(m.error.code, m.error.message));
        else p.resolve(m.result);
      }
    };
    ws.onerror = () => { /* onclose가 뒤따름 — 거기서 처리 */ };
    ws.onclose = () => {
      if (this.ws !== ws) return; // 이미 교체/폐기된 소켓 — 무시
      this.ws = null;
      // 끊김 시 pending WS 요청 즉시 실패 처리 (timeout 대기 없음)
      for (const [, p] of this.pending) { clearTimeout(p.timer); p.reject(new Error('connection lost')); }
      this.pending.clear();
      if (this.stopped) return;
      this.wsFailures++;
      if (this.wsFailures >= this.o.wsMaxFailures) {
        this.setState('degraded');
        this.degradeTimer = setTimeout(() => {
          if (this.state === 'degraded' && !this.stopped) this.connectWs();
        }, this.o.degradeRetryMs);
      } else {
        this.backoffTimer = setTimeout(() => this.connectWs(), this.o.backoffBaseMs * this.wsFailures); // backoff
      }
    };
  }

  // 백오프/실패 카운트 무시하고 즉시 재시도 — NetInfo 네트워크 복구 트리거용
  // close 순서 주의: 먼저 this.ws를 null로 만들고 close해야 onclose 가드가
  // 동기 close(FakeWs 등)에서도 백오프 재예약을 발동시키지 않는다
  reconnectNow(): void {
    if (this.stopped) return;
    if (this.degradeTimer) clearTimeout(this.degradeTimer);
    this.wsFailures = 0;
    const old = this.ws;
    this.ws = null;
    old?.close();
    if (this.httpOnly) return;
    this.connectWs();
  }

  call<T = unknown>(method: string, params?: unknown[]): Promise<T> {
    if (this.stopped) return Promise.reject(new Error('connection stopped'));
    if (this.ws && this.state === 'connected') return this.callWs<T>(method, params);
    return this.callHttp<T>(method, params);
  }

  private callWs<T>(method: string, params?: unknown[]): Promise<T> {
    const id = this.nextId++;
    const body = buildRequest(id, method, this.tokenParams(params));
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`rpc timeout: ${method}`));
      }, this.o.callTimeoutMs);
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer });
      this.ws?.send(body);
    });
  }

  private async callHttp<T>(method: string, params?: unknown[]): Promise<T> {
    const id = this.nextId++;
    const body = buildRequest(id, method, this.tokenParams(params));
    // fetch 자체 timeout 없음 — callTimeoutMs로 경쟁시켜 hang 방지
    let raceTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      const res = await Promise.race([
        this.fetchImpl(`${this.config.url}/jsonrpc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        }),
        new Promise<never>((_, reject) => {
          raceTimer = setTimeout(() => reject(new Error(`rpc timeout: ${method}`)), this.o.callTimeoutMs);
        }),
      ]);
      const m = parseMessage(await res.text());
      if (m.kind !== 'response') throw new Error('invalid rpc response');
      if (m.error) throw new RpcError(m.error.code, m.error.message);
      return m.result as T;
    } finally {
      if (raceTimer !== undefined) clearTimeout(raceTimer); // 경쟁에서 진 타이머 정리 — 호출마다 타이머 누수 방지
    }
  }

  onNotification(cb: (e: Aria2Event) => void): () => void {
    this.notifCbs.add(cb);
    return () => this.notifCbs.delete(cb);
  }

  onStateChange(cb: (s: ConnState) => void): () => void {
    this.stateCbs.add(cb);
    return () => this.stateCbs.delete(cb);
  }
}
