import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
// react-native-mmkv v4(Nitro) — createMMKV 팩토리 사용
import { createMMKV } from 'react-native-mmkv';
import { Aria2Connection } from '../rpc/connection';
import { createProfileStorage } from '../../features/profiles/storage';
import { useProfiles, getActiveProfile } from '../../features/profiles/store';
import { useSettings } from '../../features/settings/store';
import { runCompletionCheck, type SeenStore } from './check';
import { notifyComplete } from './notifications';

export const BG_TASK = 'ariadm-completion-check';

const seenMmkv = createMMKV({ id: 'ariadm-seen' });
export const mmkvSeen: SeenStore = {
  load: () => JSON.parse(seenMmkv.getString('seen') ?? '[]') as string[],
  save: (gids) => seenMmkv.set('seen', JSON.stringify(gids.slice(-300))),
};

// 모듈 최상위 정의 — background headless 기동 시 React 컴포넌트가 마운트되지 않아도
// JS 번들 로드만으로 task가 등록된다. 프로필은 실행 시점에 저장소에서 조회 (closure 캡처 금지).
TaskManager.defineTask(BG_TASK, async () => {
  // headless 기동 시에도 사용자 설정 반영 — settings.hydrate는 MMKV 동기 읽기라 안전
  useSettings.getState().hydrate();
  if (!useSettings.getState().notifyOnComplete) return;
  const profilesState = useProfiles.getState();
  if (!profilesState.hydrated) await profilesState.hydrate(createProfileStorage()); // headless 기동 대비
  const profile = getActiveProfile(useProfiles.getState());
  if (!profile) return;
  const conn = new Aria2Connection(
    { url: `${profile.scheme}://${profile.host}:${profile.port}`, secret: profile.secret },
    { httpOnly: true },
  );
  conn.start();
  try {
    await runCompletionCheck(conn, mmkvSeen, notifyComplete);
  } finally {
    conn.stop();
  }
});

export async function registerBackgroundTask(): Promise<void> {
  if (await TaskManager.isTaskRegisteredAsync(BG_TASK)) return;
  // minimumInterval 단위는 '분' — 15 = 15분 (15*60은 15시간이 됨)
  await BackgroundTask.registerTaskAsync(BG_TASK, { minimumInterval: 15 });
}
