import type { Aria2Connection } from './connection';
import { DOWNLOAD_KEYS } from './types';
import type { DownloadInfo, GlobalStat } from './types';

export interface AddOptions {
  dir?: string;
  out?: string;
  split?: string; // aria2 option 값은 string — UI에서 String(n) 변환
  'max-download-limit'?: string; // 통합 테스트에서 일시정지 검증용 속도 제한
}

// 컨벤션: 첫 인자는 connection, gid는 마지막
export const Aria2 = {
  async getVersion(c: Aria2Connection): Promise<string> {
    const r = await c.call<{ version: string }>('aria2.getVersion');
    return r.version;
  },
  getGlobalStat(c: Aria2Connection): Promise<GlobalStat> {
    return c.call<GlobalStat>('aria2.getGlobalStat');
  },
  tellActive(c: Aria2Connection): Promise<DownloadInfo[]> {
    return c.call<DownloadInfo[]>('aria2.tellActive', [DOWNLOAD_KEYS]);
  },
  tellWaiting(c: Aria2Connection, offset: number, count: number): Promise<DownloadInfo[]> {
    return c.call<DownloadInfo[]>('aria2.tellWaiting', [offset, count, DOWNLOAD_KEYS]);
  },
  tellStopped(c: Aria2Connection, offset: number, count: number): Promise<DownloadInfo[]> {
    return c.call<DownloadInfo[]>('aria2.tellStopped', [offset, count, DOWNLOAD_KEYS]);
  },
  tellStatus(c: Aria2Connection, gid: string): Promise<DownloadInfo> {
    return c.call<DownloadInfo>('aria2.tellStatus', [gid, DOWNLOAD_KEYS]);
  },
  addUri(c: Aria2Connection, uris: string[], options: AddOptions = {}): Promise<string> {
    return c.call<string>('aria2.addUri', [uris, options]);
  },
  addTorrent(c: Aria2Connection, torrentBase64: string, options: AddOptions = {}): Promise<string> {
    return c.call<string>('aria2.addTorrent', [torrentBase64, [], options]);
  },
  pause(c: Aria2Connection, gid: string): Promise<string> {
    return c.call<string>('aria2.pause', [gid]);
  },
  unpause(c: Aria2Connection, gid: string): Promise<string> {
    return c.call<string>('aria2.unpause', [gid]);
  },
  remove(c: Aria2Connection, gid: string): Promise<string> {
    return c.call<string>('aria2.remove', [gid]);
  },
  removeDownloadResult(c: Aria2Connection, gid: string): Promise<string> {
    return c.call<string>('aria2.removeDownloadResult', [gid]);
  },
};
