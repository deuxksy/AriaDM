import { Stack, useLocalSearchParams } from 'expo-router';
import { Detail } from '../../features/downloads/Detail';
import { useTranslation } from '../../shared/i18n';

export default function DetailModal() {
  const t = useTranslation();
  const { gid } = useLocalSearchParams<{ gid: string }>();
  return (
    <>
      {/* 모달 헤더 타이틀 — t() 키 사용 (T10 이월) */}
      <Stack.Screen options={{ title: t('detail_title') }} />
      <Detail gid={gid} />
    </>
  );
}
