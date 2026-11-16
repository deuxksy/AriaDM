import { View } from 'react-native';
import { DownloadList } from '../../features/downloads/DownloadList';
import { ConnChip } from '../../shared/ConnChip';
import { useTheme } from '../../shared/ThemeContext';

export default function DownloadsScreen() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ alignItems: 'flex-end', paddingTop: 8, paddingRight: 12 }}><ConnChip /></View>
      <DownloadList />
    </View>
  );
}
