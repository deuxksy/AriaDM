import type { WSLike } from '../../core/rpc/connection';

// 즉시 성공하는 가짜 WebSocket. 응답은 message()로 주입.
export class FakeWs implements WSLike {
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((ev: unknown) => void) | null = null;
  send(data: string): void { this.sent.push(data); }
  close(): void { this.onclose?.(); }
  open(): void { this.onopen?.(); }
  message(raw: string): void { this.onmessage?.({ data: raw }); }
}

// handshake 실패 — onerror 후 반드시 onclose까지 발생 (실제 브라우저/RN 계약)
export class FailingWs implements WSLike {
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((ev: unknown) => void) | null = null;
  send(): void { /* 미사용 */ }
  close(): void { /* 미사용 */ }
  constructor() {
    setTimeout(() => { this.onerror?.(new Error('fail')); this.onclose?.(); }, 0);
  }
}
