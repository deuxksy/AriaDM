import { useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useDownloads, useGlobalStat, useControl } from './queries';
import { SEGMENTS, SEG_TO_KIND, filterBySegment, type SegmentKey } from './segments';
import { DownloadRow } from './DownloadRow';
import { useConnection } from '../../core/rpc/ConnectionContext';
import { t } from '../../shared/i18n';
import { theme } from '../../shared/theme';
import { formatSpeed } from '../../shared/format';

export function DownloadList() {
  const [seg, setSeg] = useState<SegmentKey>('active');
  const [limit, setLimit] = useState(100); // 스크롤 확장 — heritage waiting 500+ 대응
  const active = useDownloads('active');
  const waiting = useDownloads('waiting', limit);
  const stopped = useDownloads('stopped', limit);
  const stat = useGlobalStat();
  const control = useControl();
  const { profile } = useConnection();
  const router = useRouter();

  const kind = SEG_TO_KIND[seg];
  const src = kind === 'active' ? active.data : kind === 'waiting' ? waiting.data : stopped.data;
  const items = filterBySegment(src ?? [], seg);

  if (!profile) {
    return <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 40 }}>{t('empty_no_profile')}</Text>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flexDirection: 'row', padding: 10, gap: 6 }}>
        <Text style={{ color: theme.muted, flex: 1 }}>
          ↓ {formatSpeed(Number(stat.data?.downloadSpeed ?? 0))}  ↑ {formatSpeed(Number(stat.data?.uploadSpeed ?? 0))}
        </Text>
        {SEGMENTS.map((s) => (
          <Text key={s.key} onPress={() => setSeg(s.key)}
            style={{ color: seg === s.key ? theme.accent : theme.muted, fontWeight: seg === s.key ? '700' : '400' }}>
            {t(s.label)}
          </Text>
        ))}
      </View>
      <FlatList
        data={items}
        keyExtractor={(d) => d.gid}
        // 확장 판단은 세그먼트 필터 전 원본 페이지 기준 — complete/failed는 status로 걸러져
        // items 길이가 실제보다 작아 필터 후 길이로 판단하면 확장이 조기 차단된다 (T8 가드)
        onEndReached={() => { if (kind !== 'active' && (src?.length ?? 0) >= limit) setLimit((l) => l + 100); }}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <DownloadRow
            info={item}
            onOpen={(gid) => router.push(`/modal/${gid}`)}
            // 제어 실패가 무음이 되지 않게 (T8 ruling)
            onPauseResume={(gid, paused) =>
              (paused ? control.resume.mutateAsync(gid) : control.pause.mutateAsync(gid))
                .catch((e: Error) => Alert.alert('AriaDM', `${t('control_failed')}: ${e.message}`))}
          />
        )}
        ListEmptyComponent={<Text style={{ color: theme.muted, textAlign: 'center', marginTop: 40 }}>-</Text>}
      />
    </View>
  );
}
