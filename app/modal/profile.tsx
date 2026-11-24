import { Stack } from 'expo-router';
import { ProfileForm } from '../../features/profiles/ProfileForm';
import { useTranslation } from '../../shared/i18n';

export default function ProfileModal() {
  const t = useTranslation();
  return (
    <>
      {/* 모달 헤더 타이틀 — t() 키 사용 (T10 이월) */}
      <Stack.Screen options={{ title: t('profile_title') }} />
      <ProfileForm />
    </>
  );
}
