import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Aria2Connection } from './connection';
import { Aria2 } from './methods';
import type { ConnState } from './types';
import { useProfiles, getActiveProfile } from '../../features/profiles/store';
import { createProfileStorage } from '../../features/profiles/storage';
import { useSettings } from '../../features/settings/store';
import { ensurePermission, notifyComplete } from '../notifications/notifications';
// import만으로 background.ts의 TaskManager.defineTask가 등록됨
import { mmkvSeen, registerBackgroundTask } from '../notifications/background';
import { downloadName } from '../../shared/format';

interface Ctx {
  conn: Aria2Connection | null;
  state: ConnState;
  profile: ReturnType<typeof getActiveProfile>;
}

const ConnectionCtx = createContext<Ctx>({ conn: null, state: 'disconnected', profile: null });

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const storage = useMemo(() => createProfileStorage(), []);
  const hydrated = useProfiles((s) => s.hydrated);
  const [, force] = useState(0);
  useEffect(() => {
    if (!hydrated) {
      useProfiles.getState()
        .hydrate(storage)
        .then(() => force((n) => n + 1))
        // storage 손상 시 앱 진입이 멈추지 않게 — 빈 상태로 계속
        .catch((e) => console.warn('profile hydrate failed', e));
    }
  }, [hydrated, storage]);

  const profile = useProfiles(getActiveProfile);
  const [conn, setConn] = useState<Aria2Connection | null>(null);
  const [state, setState] = useState<ConnState>('disconnected');
  const qc = useQueryClient();
  const connRef = useRef<Aria2Connection | null>(null);

  // 연결 key — id뿐 아니라 접속 정보·secret 변경 시에도 재연결
  const connKey = profile
    ? `${profile.id}|${profile.scheme}://${profile.host}:${profile.port}|${profile.secret}`
    : '';

  useEffect(() => {
    connRef.current?.stop();
    if (!profile) { setConn(null); setState('disconnected'); return; }
    const c = new Aria2Connection({
      url: `${profile.scheme}://${profile.host}:${profile.port}`,
      secret: profile.secret,
    });
    connRef.current = c;
    setConn(c);
    const offState = c.onStateChange(setState);
    // aria2 이벤트 → 캐시 무효화 + foreground 완료 즉시 알림
    const offNotif = c.onNotification(async (e) => {
      qc.invalidateQueries({ queryKey: ['downloads'] });
      qc.invalidateQueries({ queryKey: ['globalStat'] });
      if ((e.name === 'onDownloadComplete' || e.name === 'onBtDownloadComplete')
          && useSettings.getState().notifyOnComplete) {
        const info = await Aria2.tellStatus(c, e.gid).catch(() => null);
        const seen = new Set(mmkvSeen.load());
        if (!seen.has(e.gid)) {
          // 권한 회수·네이티브 오류 시 unhandled rejection 방지 (T11 이월)
          await notifyComplete(info ? downloadName(info) : e.gid, e.gid).catch(() => undefined);
          seen.add(e.gid);
          mmkvSeen.save([...seen].slice(-300));
        }
      }
    });
    c.start();
    // NetInfo: 네트워크 복구 시 백오프 무시 즉시 재연결
    const netSub = NetInfo.addEventListener((n) => {
      if (n.isConnected) c.reconnectNow();
    });
    return () => { offState(); offNotif(); netSub(); c.stop(); };
  }, [connKey, qc]);

  // 앱 시작 1회 — 설정 hydrate, 알림 권한, background task 등록, 알림 탭 라우팅
  useEffect(() => {
    useSettings.getState().hydrate();
    // 기본값 true지만 권한이 없으면 알림 불가 — 시작 시 1회 요청하고 거부 시 기능 off
    ensurePermission().then((granted) => {
      if (!granted && useSettings.getState().notifyOnComplete) useSettings.getState().setNotify(false);
    }).catch(() => undefined); // 권한 API 거부·오류 시 unhandled 방지 (T11 이월)
    registerBackgroundTask().catch(() => undefined);
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const gid = (resp.notification.request.content.data as { gid?: string } | undefined)?.gid;
      if (typeof gid === 'string') router.push(`/modal/${gid}`);
    });
    return () => sub.remove();
  }, []);

  return <ConnectionCtx.Provider value={{ conn, state, profile }}>{children}</ConnectionCtx.Provider>;
}

export function useConnection(): Ctx {
  return useContext(ConnectionCtx);
}
