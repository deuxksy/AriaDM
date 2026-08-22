import { Text, View } from 'react-native';
import { ConnChip } from '../../shared/ConnChip';
import { useConnection } from '../../core/rpc/ConnectionContext';
import { t } from '../../shared/i18n';
import { theme } from '../../shared/theme';

export default function DownloadsScreen() {
  const { profile } = useConnection();
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingTop: 20, backgroundColor: theme.bg }}>
      <ConnChip />
      <Text style={{ marginTop: 12, color: theme.muted }}>
        {profile ? profile.name : t('empty_no_profile')}
      </Text>
    </View>
  );
}
