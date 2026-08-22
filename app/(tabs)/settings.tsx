import { Text, View } from 'react-native';
import { ConnChip } from '../../shared/ConnChip';
import { t } from '../../shared/i18n';
import { theme } from '../../shared/theme';

// Task 10에서 실구현으로 교체되는 플레이스홀더
export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingTop: 20, backgroundColor: theme.bg }}>
      <ConnChip />
      <Text style={{ marginTop: 12, color: theme.muted }}>{t('settings_profiles')}</Text>
    </View>
  );
}
