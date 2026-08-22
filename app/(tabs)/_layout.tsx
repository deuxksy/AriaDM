import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../shared/theme';
import { t } from '../../shared/i18n';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={({ route }) => ({
      tabBarActiveTintColor: theme.accent,
      headerStyle: { backgroundColor: theme.card },
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
