// react-native-mmkv v4(Nitro) — MMKV 클래스 대신 createMMKV 팩토리로 인스턴스 생성
import { createMMKV } from 'react-native-mmkv';
import * as SecureStore from 'expo-secure-store';
import type { Profile, ProfileStorage } from './store';

const mmkv = createMMKV({ id: 'ariadm-profiles' });

// 프로필별 개별 key — 단일 JSON 항목의 크기 제한·부분 실패 회피
const secretKey = (id: string) => `profile-secret-${id}`;

// secret은 SecureStore(getItemAsync/setItemAsync — 동기 API 없음), 나머지는 MMKV.
// 저장 순서: secret 먼저 → metadata 나중 (부분 실패 시 고아 metadata 최소화)
export function createProfileStorage(): ProfileStorage {
  return {
    async load() {
      const raw = mmkv.getString('state');
      if (!raw) return { profiles: [], activeId: null };
      const parsed = JSON.parse(raw) as { profiles: Omit<Profile, 'secret'>[]; activeId: string | null };
      const profiles: Profile[] = [];
      for (const p of parsed.profiles) {
        const secret = await SecureStore.getItemAsync(secretKey(p.id)).catch(() => undefined);
        profiles.push({ ...p, secret: secret ?? '' });
      }
      return { profiles, activeId: parsed.activeId };
    },
    async save({ profiles, activeId }) {
      const lean: Omit<Profile, 'secret'>[] = [];
      for (const { secret, ...rest } of profiles) {
        if (secret) await SecureStore.setItemAsync(secretKey(rest.id), secret);
        lean.push(rest);
      }
      mmkv.set('state', JSON.stringify({ profiles: lean, activeId }));
    },
    async deleteSecrets(ids) {
      for (const id of ids) {
        await SecureStore.deleteItemAsync(secretKey(id)).catch(() => undefined);
      }
    },
  };
}
