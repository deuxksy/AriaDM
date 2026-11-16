import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as LegacyFS from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { Aria2, type AddOptions } from '../../core/rpc/methods';
import { useConnection } from '../../core/rpc/ConnectionContext';
import { bytesToBase64 } from '../../shared/base64';
import { t } from '../../shared/i18n';
import { useTheme } from '../../shared/ThemeContext';

export function AddForm() {
  const theme = useTheme();
  const { conn, profile } = useConnection();
  const [uri, setUri] = useState('');
  const [dir, setDir] = useState('');
  const [out, setOut] = useState('');
  const [split, setSplit] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  // aria2 option 값은 전부 string — 여기서 한 곳에서 변환
  function buildOptions(): AddOptions | undefined {
    const o: AddOptions = {};
    if (dir.trim()) o.dir = dir.trim();
    if (out.trim()) o.out = out.trim();
    if (split.trim() && Number(split) > 0) o.split = String(Math.floor(Number(split)));
    return Object.keys(o).length ? o : undefined;
  }

  async function submitUri() {
    const u = uri.trim();
    if (!conn || busy || !(u.startsWith('http://') || u.startsWith('https://') || u.startsWith('magnet:'))) return;
    setBusy(true);
    try {
      await Aria2.addUri(conn, [u], buildOptions());
      Alert.alert('AriaDM', t('added', { n: 1 }));
      setUri('');
      router.push('/');
    } catch (e) {
      Alert.alert('AriaDM', `${t('add_failed')}: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function pickTorrent() {
    if (!conn || busy) return;
    // '*/*' — iOS UTI 변환·Android octet-stream으로 .torrent가 걸러지는 문제 회피, 확장자로 직접 검증
    const picked = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (picked.canceled || !picked.assets[0]) return;
    if (!picked.assets[0].name?.toLowerCase().endsWith('.torrent')) {
      Alert.alert('AriaDM', t('add_failed'));
      return;
    }
    setBusy(true);
    try {
      // 1차: legacy API base64 read — Android content:// URI 처리 겸 네이티브 인코딩
      let b64: string;
      try {
        b64 = await LegacyFS.readAsStringAsync(picked.assets[0].uri, {
          encoding: LegacyFS.EncodingType.Base64,
        });
      } catch {
        // 2차: legacy 미지원 시 new File API + 자체 base64 인코딩
        const f = new (await import('expo-file-system')).File(picked.assets[0].uri);
        b64 = bytesToBase64(await f.bytes());
      }
      await Aria2.addTorrent(conn, b64, buildOptions());
      Alert.alert('AriaDM', t('added', { n: 1 }));
      router.push('/');
    } catch (e) {
      Alert.alert('AriaDM', `${t('add_failed')}: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  if (!profile) return <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 40 }}>{t('empty_no_profile')}</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, padding: 16, gap: 12 }}>
      <TextInput
        value={uri}
        onChangeText={setUri}
        placeholder={t('add_uri_placeholder')}
        placeholderTextColor={theme.muted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        style={{ backgroundColor: theme.card, borderRadius: theme.radius, padding: 14, color: theme.text }}
      />
      <TextInput
        value={dir}
        onChangeText={setDir}
        placeholder={t('add_dir_placeholder')}
        placeholderTextColor={theme.muted}
        autoCapitalize="none"
        autoCorrect={false}
        style={{ backgroundColor: theme.card, borderRadius: theme.radius, padding: 14, color: theme.text }}
      />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TextInput
          value={out}
          onChangeText={setOut}
          placeholder={t('add_out_placeholder')}
        placeholderTextColor={theme.muted}
          autoCapitalize="none"
          autoCorrect={false}
          style={{ flex: 1, backgroundColor: theme.card, borderRadius: theme.radius, padding: 14, color: theme.text }}
        />
        <TextInput
          value={split}
          onChangeText={setSplit}
          placeholder={t('add_split_placeholder')}
        placeholderTextColor={theme.muted}
          keyboardType="number-pad"
          style={{ flex: 1, backgroundColor: theme.card, borderRadius: theme.radius, padding: 14, color: theme.text }}
        />
      </View>
      <TouchableOpacity onPress={submitUri} disabled={busy}
        style={{ backgroundColor: theme.accent, borderRadius: theme.radius, padding: 16, alignItems: 'center', opacity: busy ? 0.5 : 1 }}>
        {busy ? <ActivityIndicator color={theme.onAccent} /> : <Text style={{ color: theme.onAccent, fontWeight: '600' }}>{t('add_submit')}</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={pickTorrent} disabled={busy}
        style={{ borderRadius: theme.radius, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.accent }}>
        <Text style={{ color: theme.accent }}>{t('add_pick_torrent')}</Text>
      </TouchableOpacity>
    </View>
  );
}
