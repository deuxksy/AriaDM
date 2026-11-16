import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../shared/ThemeContext';
import { t } from '../../shared/i18n';

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs screenOptions={({ route }) => ({
      tabBarActiveTintColor: theme.accent,
      tabBarInactiveTintColor: theme.muted,
      tabBarStyle: { backgroundColor: theme.card },
      headerStyle: { backgroundColor: theme.card },
      headerTintColor: theme.text,
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
