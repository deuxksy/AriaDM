import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { Aria2Connection } from './connection';
import type { ConnState } from './types';
import { useProfiles, getActiveProfile } from '../../features/profiles/store';
import { createProfileStorage } from '../../features/profiles/storage';

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
    // aria2 이벤트 → 캐시 무효화로 실시간 갱신
    const offNotif = c.onNotification(() => {
      qc.invalidateQueries({ queryKey: ['downloads'] });
      qc.invalidateQueries({ queryKey: ['globalStat'] });
    });
    c.start();
    // NetInfo: 네트워크 복구 시 백오프 무시 즉시 재연결
    const netSub = NetInfo.addEventListener((n) => {
      if (n.isConnected) c.reconnectNow();
    });
    return () => { offState(); offNotif(); netSub(); c.stop(); };
  }, [connKey, qc]);

  return <ConnectionCtx.Provider value={{ conn, state, profile }}>{children}</ConnectionCtx.Provider>;
}

export function useConnection(): Ctx {
  return useContext(ConnectionCtx);
}
