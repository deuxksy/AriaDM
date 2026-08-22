import { useProfiles } from '../features/profiles/store';
import type { ProfileStorage } from '../features/profiles/store';

function memStorage(): ProfileStorage & { dump(): unknown; deleted: string[] } {
  let data: { profiles: never[]; activeId: string | null } | null = null;
  const deleted: string[] = [];
  return {
    load: async () => data ?? { profiles: [], activeId: null },
    save: async (s) => { data = s as never; },
    deleteSecrets: async (ids) => { deleted.push(...ids); },
    dump: () => data,
    deleted,
  };
}

const P1 = { id: 'p1', name: 'heritage', scheme: 'http' as const, host: '100.96.115.19', port: 6800, secret: 'sec1' };

test('hydrate → addProfile → setActive → persistence', async () => {
  const st = memStorage();
  await useProfiles.getState().hydrate(st);
  useProfiles.getState().addProfile(P1);
  useProfiles.getState().setActive('p1');
  await new Promise((r) => setTimeout(r, 0)); // fire-and-forget save flush
  expect(useProfiles.getState().activeId).toBe('p1');
  expect(st.dump()).toMatchObject({ activeId: 'p1' });
  useProfiles.getState().removeProfile('p1');
  expect(useProfiles.getState().profiles).toHaveLength(0);
});
