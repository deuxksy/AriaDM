import { createMMKV } from 'react-native-mmkv';
import { useSettings } from '../features/settings/store';

const mmkv = createMMKV({ id: 'test' });

beforeEach(() => { mmkv.remove('settings'); });

test('hydrate — 신규 설치: themeMode auto 폴백', () => {
  useSettings.getState().hydrate();
  expect(useSettings.getState().themeMode).toBe('auto');
});

test('hydrate — 저장된 themeMode dark 복원', () => {
  mmkv.set('settings', JSON.stringify({ notifyOnComplete: false, lang: 'ko', themeMode: 'dark' }));
  useSettings.getState().hydrate();
  expect(useSettings.getState().themeMode).toBe('dark');
});

test('hydrate — 무효 값은 auto 폴백', () => {
  mmkv.set('settings', JSON.stringify({ themeMode: 'blue' }));
  useSettings.getState().hydrate();
  expect(useSettings.getState().themeMode).toBe('auto');
});

test('setTheme — 저장 + lang·notify 보존', () => {
  useSettings.getState().hydrate();
  useSettings.getState().setLang('ko');
  useSettings.getState().setNotify(false);
  useSettings.getState().setTheme('dark');
  expect(useSettings.getState().themeMode).toBe('dark');
  expect(JSON.parse(mmkv.getString('settings')!)).toMatchObject({ themeMode: 'dark', lang: 'ko', notifyOnComplete: false });
});
