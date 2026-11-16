import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfiles } from '../../features/profiles/store';
import { useSettings } from '../../features/settings/store';
import { ensurePermission } from '../../core/notifications/notifications';
import { isPro } from '../../core/iap/entitlement';
import { availableLangs, t } from '../../shared/i18n';
import { useTheme } from '../../shared/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { profiles, activeId, setActive } = useProfiles();
  const { notifyOnComplete, setNotify, lang, setLang, themeMode, setTheme } = useSettings();
  const theme = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg, padding: 16, gap: 16 }}>
      <Text style={{ fontWeight: '600', color: theme.text }}>{t('settings_profiles')}</Text>
      {profiles.map((p) => (
        <Pressable key={p.id} onPress={() => setActive(p.id)}
          onLongPress={() => Alert.alert(p.name, '', [
            { text: t('profile_edit'), onPress: () => router.push(`/modal/profile?id=${p.id}`) },
            { text: t('profile_delete'), style: 'destructive' as const,
              onPress: () => useProfiles.getState().removeProfile(p.id) },
            { text: 'Cancel', style: 'cancel' as const },
          ])}
          style={{ backgroundColor: theme.card, borderRadius: theme.radius, padding: 14 }}>
          <Text style={{ color: p.id === activeId ? theme.accent : theme.text, fontWeight: p.id === activeId ? '700' : '400' }}>{p.name}</Text>
          <Text style={{ color: theme.muted, fontSize: 12 }}>{p.scheme}://{p.host}:{p.port}</Text>
        </Pressable>
      ))}
      <Pressable onPress={() => router.push('/modal/profile')}
        style={{ padding: 14, borderRadius: theme.radius, borderWidth: 1, borderColor: theme.accent, alignItems: 'center' }}>
        <Text style={{ color: theme.accent }}>+ {t('profile_title')}</Text>
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {/* 권한 API 자체 오류(throw) 시에도 토글은 반영 — 권한 거부면 알림이 안 가는 것으로 사용자가 인지 */}
        <Switch value={notifyOnComplete} onValueChange={async (v) => { if (v) await ensurePermission().catch(() => false); setNotify(v); }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.text }}>{t('settings_notify')}</Text>
          <Text style={{ color: theme.muted, fontSize: 12 }}>{t('settings_notify_note')}</Text>
        </View>
      </View>

      <Text style={{ fontWeight: '600', color: theme.text }}>{t('settings_lang')}</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {availableLangs.map((l) => (
          <Pressable key={l.code} onPress={() => setLang(l.code)}
            style={{ padding: 10, borderRadius: theme.radius, backgroundColor: lang === l.code ? theme.accent : theme.card }}>
            <Text style={{ color: lang === l.code ? '#fff' : theme.text }}>
              {l.code === 'auto' ? t('settings_lang_auto') : l.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ fontWeight: '600', color: theme.text }}>{t('settings_theme')}</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {(['light', 'dark', 'auto'] as const).map((m) => (
          <Pressable key={m} onPress={() => setTheme(m)}
            style={{ padding: 10, borderRadius: theme.radius, backgroundColor: themeMode === m ? theme.accent : theme.card }}>
            <Text style={{ color: themeMode === m ? '#fff' : theme.text }}>{t(`settings_theme_${m}`)}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ color: theme.muted, fontSize: 12 }}>v1 — Free (Pro: {String(isPro())})</Text>
    </ScrollView>
  );
}
