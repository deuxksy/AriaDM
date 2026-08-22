import * as Notifications from 'expo-notifications';
import { t } from '../../shared/i18n';

Notifications.setNotificationHandler({
  // SDK 57 기준 옵션 키 — shouldShowAlert은 deprecated
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function ensurePermission(): Promise<boolean> {
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function notifyComplete(name: string, gid?: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    // data.gid — 알림 탭 시 상세 화면 라우팅에 사용
    content: { title: t('notify_complete_title'), body: name, data: gid ? { gid } : undefined },
    trigger: null, // 즉시
  });
}
