import { View } from 'react-native';
import { DownloadList } from '../../features/downloads/DownloadList';
import { ConnChip } from '../../shared/ConnChip';

export default function DownloadsScreen() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: 'flex-end', paddingTop: 8, paddingRight: 12 }}><ConnChip /></View>
      <DownloadList />
    </View>
  );
}
