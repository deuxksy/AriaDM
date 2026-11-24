import { act, type ReactNode } from 'react';
import { Text } from 'react-native';
import { create, type ReactTestRenderer } from 'react-test-renderer';
import TabsLayout from '../app/(tabs)/_layout';
import { AddForm } from '../features/new-download/AddForm';
import { ProfileForm } from '../features/profiles/ProfileForm';
import { useSettings } from '../features/settings/store';

jest.mock('expo-router', () => {
  const { Text } = require('react-native');
  const Tabs = ({ children }: { children: ReactNode }) => children;
  Tabs.Screen = ({ options }: { options: { title: string } }) => <Text>{options.title}</Text>;
  return { Tabs, useRouter: () => ({}), useLocalSearchParams: () => ({}) };
});
jest.mock('expo-notifications', () => ({ setNotificationHandler: jest.fn() }));

test('설정에서 언어를 바꾸면 탭 제목과 이미 열린 화면도 갱신된다', async () => {
  useSettings.getState().setLang('en');
  let screen!: ReactTestRenderer;
  await act(() => { screen = create(<><TabsLayout /><AddForm /><ProfileForm /></>); });
  const labels = () => screen.root.findAllByType(Text).map((node) => node.props.children);
  const port = () => screen.root.findByProps({ keyboardType: 'number-pad' });
  try {
    expect(labels()).toContain('Downloads');
    await act(() => port().props.onChangeText('6880'));
    for (const [lang, ...expected] of [
      ['ko', '다운로드', '설정에서 서버 프로필을 먼저 추가하세요', '저장', '프로토콜'],
      ['ja', 'ダウンロード', '先に設定でサーバープロファイルを追加してください', '保存', 'プロトコル'],
      ['zh', '下载', '请先在设置中添加服务器配置', '保存', '协议'],
      ['en', 'Downloads', 'Add a server profile in Settings first', 'Save', 'Protocol'],
    ]) {
      await act(() => useSettings.getState().setLang(lang));
      expect(labels()).toEqual(expect.arrayContaining(expected));
    }
    expect(port().props.value).toBe('6880');
  } finally {
    await act(() => screen.unmount());
  }
});
