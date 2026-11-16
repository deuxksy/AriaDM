import { useQuery } from '@tanstack/react-query';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Aria2 } from '../../core/rpc/methods';
import { useConnection } from '../../core/rpc/ConnectionContext';
import { useControl } from './queries';
import { downloadName, formatBytes, formatSpeed } from '../../shared/format';
import { t } from '../../shared/i18n';
import { useTheme } from '../../shared/ThemeContext';

export function Detail({ gid }: { gid: string }) {
  const theme = useTheme();
  const { conn } = useConnection();
  const control = useControl();
  const { data } = useQuery({
    queryKey: ['downloads', 'detail', gid],
    enabled: !!conn,
    refetchInterval: 2000,
    queryFn: () => (conn ? Aria2.tellStatus(conn, gid) : null),
  });
  if (!data) return null;

  // 제어 실패가 무음이 되지 않게 — 취소 가능한 확인 후 실패 시 Alert (T8 ruling)
  const act = (label: string, fn: (g: string) => Promise<unknown>) => {
    Alert.alert(label, '', [
      { text: label, onPress: () => fn(gid).catch((e: Error) => Alert.alert('AriaDM', `${t('control_failed')}: ${e.message}`)) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const rows: [string, string][] = [
    ['GID', data.gid],
    ['Status', data.status],
    ['Path', data.dir],
    ['Size', `${formatBytes(Number(data.completedLength))} / ${formatBytes(Number(data.totalLength))}`],
    ['Speed', formatSpeed(Number(data.downloadSpeed))],
    ['Connections', data.connections],
    ...(data.errorCode !== '0' && data.errorCode ? ([['Error', `${data.errorCode}: ${data.errorMessage}`]] as [string, string][]) : []),
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg, padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 17, fontWeight: '600', color: theme.text }}>{downloadName(data)}</Text>
      {rows.map(([k, v]) => (
        <View key={k} style={{ flexDirection: 'row', gap: 8 }}>
          <Text style={{ color: theme.muted, width: 100 }}>{k}</Text>
          <Text style={{ color: theme.text, flex: 1 }}>{v}</Text>
        </View>
      ))}
      {(data.files ?? []).map((f, i) => (
        <Text key={i} style={{ color: theme.muted, fontSize: 12 }} numberOfLines={1}>{f.path}</Text>
      ))}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
        {data.status === 'active' || data.status === 'waiting' ? (
          <Pressable onPress={() => act(t('action_pause'), control.pause.mutateAsync)}
            style={{ padding: 12, borderRadius: theme.radius, backgroundColor: theme.accent }}>
            <Text style={{ color: '#fff' }}>{t('action_pause')}</Text>
          </Pressable>
        ) : null}
        {data.status === 'paused' ? (
          <Pressable onPress={() => act(t('action_resume'), control.resume.mutateAsync)}
            style={{ padding: 12, borderRadius: theme.radius, backgroundColor: theme.accent }}>
            <Text style={{ color: '#fff' }}>{t('action_resume')}</Text>
          </Pressable>
        ) : null}
        {data.status === 'active' || data.status === 'waiting' || data.status === 'paused' ? (
          <Pressable onPress={() => act(t('action_remove'), control.remove.mutateAsync)}
            style={{ padding: 12, borderRadius: theme.radius, backgroundColor: '#FF3B30' }}>
            <Text style={{ color: '#fff' }}>{t('action_remove')}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => act(t('action_delete_record'), control.deleteRecord.mutateAsync)}
            style={{ padding: 12, borderRadius: theme.radius, borderWidth: 1, borderColor: theme.muted }}>
            <Text style={{ color: theme.text }}>{t('action_delete_record')}</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
