import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/ThemeContext';
import { useTranslation } from '../../shared/i18n';

export default function TabsLayout() {
  const theme = useTheme();
  const t = useTranslation();
  return (
    <Tabs screenOptions={({ route }) => ({
      tabBarInactiveTintColor: theme.muted,
      tabBarIcon: ({ color, size, focused }) => {
        const icons = { index: 'download', add: 'add-circle', settings: 'settings' } as Record<string, string>;
        return <Ionicons name={`${icons[route.name ?? 'index']}${focused ? '' : '-outline'}` as never} size={size} color={color} />;
      },
    })}>
      <Tabs.Screen name="index" options={{ title: t('tab_downloads') }} />
      <Tabs.Screen name="add" options={{ title: t('tab_add') }} />
      <Tabs.Screen name="settings" options={{ title: t('tab_settings') }} />
    </Tabs>
  );
}
