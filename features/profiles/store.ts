import { create } from 'zustand';

export interface Profile {
  id: string;
  name: string;
  scheme: 'http' | 'https';
  host: string;
  port: number;
  secret: string;
}

// 비동기 필수 — SecureStore(Keychain/Keystore)가 동기 API를 제공하지 않음
export interface ProfileStorage {
  load(): Promise<{ profiles: Profile[]; activeId: string | null }>;
  save(state: { profiles: Profile[]; activeId: string | null }): Promise<void>;
  deleteSecrets(ids: string[]): Promise<void>; // 프로필 삭제 시 Keychain 잔여 자격 정리
}

interface ProfilesState {
  profiles: Profile[];
  activeId: string | null;
  hydrated: boolean;
  storage: ProfileStorage | null;
  hydrate(storage: ProfileStorage): Promise<void>;
  persist(profiles: Profile[], activeId: string | null): void;
  addProfile(p: Profile): void;
  updateProfile(id: string, patch: Partial<Profile>): void;
  removeProfile(id: string): void;
  setActive(id: string): void;
}

export const useProfiles = create<ProfilesState>((set, get) => ({
  profiles: [],
  activeId: null,
  hydrated: false,
  storage: null,
  async hydrate(storage) {
    const { profiles, activeId } = await storage.load();
    set({ profiles, activeId, hydrated: true, storage });
  },
  persist(profiles: Profile[], activeId: string | null) {
    // fire-and-forget — 저장 실패는 경고만 (UI 차단 안 함)
    get().storage?.save({ profiles, activeId }).catch((e) => console.warn('profile save failed', e));
  },
  addProfile(p) {
    const { profiles, activeId } = get();
    const nextProfiles = [...profiles, p];
    const nextActive = activeId ?? p.id;
    get().persist(nextProfiles, nextActive);
    set({ profiles: nextProfiles, activeId: nextActive });
  },
  updateProfile(id, patch) {
    const { profiles, activeId } = get();
    const nextProfiles = profiles.map((p) => (p.id === id ? { ...p, ...patch } : p));
    get().persist(nextProfiles, activeId);
    set({ profiles: nextProfiles });
  },
  removeProfile(id) {
    const { profiles, activeId, storage } = get();
    const nextProfiles = profiles.filter((p) => p.id !== id);
    const nextActive = activeId === id ? (nextProfiles[0]?.id ?? null) : activeId;
    get().persist(nextProfiles, nextActive);
    // Keychain/Keystore의 secret도 정리 — 잔여 자격 방지
    storage?.deleteSecrets([id]).catch((e) => console.warn('secret delete failed', e));
    set({ profiles: nextProfiles, activeId: nextActive });
  },
  setActive(id) {
    const { profiles } = get();
    get().persist(profiles, id);
    set({ activeId: id });
  },
}));

export function getActiveProfile(state: ProfilesState): Profile | null {
  return state.profiles.find((p) => p.id === state.activeId) ?? null;
}
