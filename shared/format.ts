// aria2 응답은 전부 문자열 숫자 — 표시용 변환 유틸
export function formatBytes(n: number): string {
  if (n < 1024) return `${Math.round(n)} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v >= 100 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

export function formatSpeed(bytesPerSec: number): string {
  return `${formatBytes(bytesPerSec)}/s`;
}

export function formatEta(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '-';
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function progressPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.floor((completed / total) * 100));
}

// 표시명 우선순위: 토렌트 이름 > 파일 경로 basename > gid
export function downloadName(info: {
  gid: string;
  files?: { path: string }[];
  bittorrent?: { info?: { name?: string } } | null;
}): string {
  const bt = info.bittorrent?.info?.name;
  if (bt && bt.length > 0) return bt;
  const p = info.files?.[0]?.path;
  if (p) {
    const base = p.split('/').filter(Boolean).pop();
    if (base) return base;
  }
  return info.gid;
}
