import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DownloadInfo } from '../../core/rpc/types';
import { downloadName, formatBytes, formatEta, formatSpeed, progressPercent } from '../../shared/format';
import { theme } from '../../shared/theme';

export function DownloadRow({
  info,
  onPauseResume,
  onOpen,
}: {
  info: DownloadInfo;
  onPauseResume: (gid: string, paused: boolean) => void;
  onOpen: (gid: string) => void;
}) {
  const total = Number(info.totalLength);
  const done = Number(info.completedLength);
  const speed = Number(info.downloadSpeed);
  const pct = progressPercent(done, total);
  const paused = info.status === 'paused';
  const eta = speed > 0 ? (total - done) / speed : 0;
  return (
    <TouchableOpacity onPress={() => onOpen(info.gid)} onLongPress={() => onPauseResume(info.gid, paused)}
      style={{ backgroundColor: theme.card, borderRadius: theme.radius, padding: 12, marginHorizontal: 12, marginVertical: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 15, color: theme.text }}>{downloadName(info)}</Text>
          <Text style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>
            {info.status === 'active'
              ? `${formatSpeed(speed)} · ${formatEta(eta)} 남음`
              : info.status === 'error'
                ? `오류 ${info.errorCode}: ${info.errorMessage}`
                : `${formatBytes(done)} / ${formatBytes(total)}`}
          </Text>
        </View>
        {(info.status === 'active' || info.status === 'paused') && (
          <TouchableOpacity hitSlop={10} onPress={() => onPauseResume(info.gid, paused)}>
            <Ionicons name={paused ? 'play' : 'pause'} size={22} color={theme.accent} />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ height: 4, backgroundColor: theme.muted + '33', borderRadius: 2, marginTop: 8 }}>
        <View style={{ height: 4, width: `${pct}%`, backgroundColor: info.status === 'error' ? '#FF3B30' : theme.accent, borderRadius: 2 }} />
      </View>
    </TouchableOpacity>
  );
}
