import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Aria2 } from '../../core/rpc/methods';
import { useConnection } from '../../core/rpc/ConnectionContext';

export type ListKind = 'active' | 'waiting' | 'stopped';

// 폴링 주기 — WS 연결이면 이벤트가 갱신을 담당하므로 여유 있게, degraded면 빠르게
export function useDownloads(kind: ListKind, limit = 100) {
  const { conn, state } = useConnection();
  return useQuery({
    queryKey: ['downloads', kind, limit],
    enabled: !!conn,
    refetchInterval: state === 'connected' ? 3000 : 2000,
    queryFn: async () => {
      if (!conn) return [];
      if (kind === 'active') return Aria2.tellActive(conn);
      if (kind === 'waiting') return Aria2.tellWaiting(conn, 0, limit);
      return Aria2.tellStopped(conn, 0, limit);
    },
  });
}

export function useGlobalStat() {
  const { conn } = useConnection();
  return useQuery({
    queryKey: ['globalStat'],
    enabled: !!conn,
    refetchInterval: 1000,
    queryFn: () => (conn ? Aria2.getGlobalStat(conn) : null),
  });
}

export function useControl() {
  const { conn } = useConnection();
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['downloads'] });
  return {
    pause: useMutation({ mutationFn: (gid: string) => Aria2.pause(conn!, gid), onSuccess: inv }),
    resume: useMutation({ mutationFn: (gid: string) => Aria2.unpause(conn!, gid), onSuccess: inv }),
    remove: useMutation({ mutationFn: (gid: string) => Aria2.remove(conn!, gid), onSuccess: inv }),
    deleteRecord: useMutation({ mutationFn: (gid: string) => Aria2.removeDownloadResult(conn!, gid), onSuccess: inv }),
  };
}
