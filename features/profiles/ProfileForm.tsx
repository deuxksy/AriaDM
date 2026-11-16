import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { diagnose } from './diagnose';
import { useProfiles, type Profile } from './store';
import { t } from '../../shared/i18n';
import { useTheme } from '../../shared/ThemeContext';

export function ProfileForm() {
  const theme = useTheme();
  const input = { backgroundColor: theme.card, borderRadius: theme.radius, padding: 14, color: theme.text };
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useProfiles((s) => s.profiles.find((p) => p.id === id));
  const [name, setName] = useState(existing?.name ?? '');
  const [host, setHost] = useState(existing?.host ?? '');
  const [port, setPort] = useState(String(existing?.port ?? 6800));
  const [secret, setSecret] = useState(existing?.secret ?? '');
  const [scheme, setScheme] = useState<'http' | 'https'>(existing?.scheme ?? 'https'); // 기본 https — http는 명시적 선택
  const [testing, setTesting] = useState(false);
  const router = useRouter();
  const { addProfile, updateProfile } = useProfiles.getState();

  async function test() {
    setTesting(true);
    const r = await diagnose({ scheme, host: host.trim(), port: Number(port) || 6800, secret });
    setTesting(false);
    Alert.alert(t('profile_test'),
      r.ok ? t('diag_ok', { v: r.version }) : r.kind === 'auth' ? t('diag_auth') : t('diag_unreachable'));
  }

  function save() {
    if (!host.trim() || !name.trim()) return;
    const p: Profile = { id: existing?.id ?? `p${Date.now()}`, name: name.trim(), scheme, host: host.trim(), port: Number(port) || 6800, secret };
    if (existing) updateProfile(p.id, p);
    else addProfile(p);
    router.back();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg, padding: 16, gap: 12 }}>
      <Text style={{ color: theme.muted }}>{t('profile_name')}</Text>
      <TextInput value={name} onChangeText={setName} style={input} />
      <Text style={{ color: theme.muted }}>{t('profile_host')}</Text>
      <TextInput value={host} onChangeText={setHost} autoCapitalize="none" autoCorrect={false} style={input} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.muted }}>{t('profile_port')}</Text>
          <TextInput value={port} onChangeText={setPort} keyboardType="number-pad" style={input} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.muted }}>Scheme</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            {(['http', 'https'] as const).map((s) => (
              <Pressable key={s} onPress={() => setScheme(s)}
                style={{ padding: 10, borderRadius: theme.radius, backgroundColor: scheme === s ? theme.accent : theme.card }}>
                <Text style={{ color: scheme === s ? '#fff' : theme.text }}>{s}</Text>
              </Pressable>
            ))}
          </View>
          {scheme === 'http' && (
            <Text style={{ color: '#FF9500', fontSize: 12, marginTop: 6 }}>{t('profile_http_warn')}</Text>
          )}
        </View>
      </View>
      <Text style={{ color: theme.muted }}>{t('profile_secret')}</Text>
      <TextInput value={secret} onChangeText={setSecret} autoCapitalize="none" autoCorrect={false} secureTextEntry style={input} />
      {/* 진단 진행 중 중복 탭 방지 (T10 이월) */}
      <Pressable onPress={test} disabled={testing}
        style={{ padding: 16, alignItems: 'center', borderRadius: theme.radius, borderWidth: 1, borderColor: theme.accent, opacity: testing ? 0.6 : 1 }}>
        {testing ? <ActivityIndicator color={theme.accent} /> : <Text style={{ color: theme.accent }}>{t('profile_test')}</Text>}
      </Pressable>
      <Pressable onPress={save} disabled={!host.trim() || !name.trim()}
        style={{ padding: 16, alignItems: 'center', borderRadius: theme.radius, backgroundColor: theme.accent, opacity: !host.trim() || !name.trim() ? 0.5 : 1 }}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>{t('profile_save')}</Text>
      </Pressable>
    </ScrollView>
  );
}
