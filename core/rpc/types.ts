// aria2 JSON-RPC 응답의 문자열 숫자 그대로 유지 (정밀도 보존)
export type Aria2Status = 'active' | 'waiting' | 'paused' | 'error' | 'complete' | 'removed';

export interface Aria2File {
  path: string;
  length: string;
  completedLength: string;
  selected: string;
}

export interface DownloadInfo {
  gid: string;
  status: Aria2Status;
  totalLength: string;
  completedLength: string;
  downloadSpeed: string;
  uploadSpeed: string;
  connections: string;
  dir: string;
  errorCode: string;
  errorMessage: string;
  files: Aria2File[];
  bittorrent: { info: { name: string } } | null;
}

export interface GlobalStat {
  downloadSpeed: string;
  uploadSpeed: string;
  numActive: string;
  numWaiting: string;
  numStopped: string;
  numStoppedTotal: string;
}

export type Aria2EventName = 'onDownloadStart' | 'onDownloadComplete' | 'onDownloadError' | 'onBtDownloadComplete';

export interface Aria2Event {
  name: Aria2EventName;
  gid: string;
}

export type ConnState = 'connecting' | 'connected' | 'degraded' | 'disconnected';

// tellX 호출 시 서버가 반환할 키 — 누락 키 방지
export const DOWNLOAD_KEYS = [
  'gid', 'status', 'totalLength', 'completedLength', 'downloadSpeed', 'uploadSpeed',
  'connections', 'dir', 'errorCode', 'errorMessage', 'files', 'bittorrent',
];
