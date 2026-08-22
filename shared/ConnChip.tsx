import { Text, View } from 'react-native';
import { useConnection } from '../core/rpc/ConnectionContext';
import { t } from './i18n';

export function ConnChip() {
  const { state } = useConnection();
  const color = state === 'connected' ? '#34C759' : state === 'degraded' ? '#FF9500' : '#FF3B30';
  const label = t(`state_${state}` as never);
  return (
    <View style={{ backgroundColor: color + '22', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ color, fontSize: 12 }}>{label}</Text>
    </View>
  );
}
