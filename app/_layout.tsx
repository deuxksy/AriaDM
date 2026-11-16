import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectionProvider } from '../core/rpc/ConnectionContext';
import { ThemeProvider, useTheme } from '../shared/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 } },
});

function ThemedStatusBar() {
  const theme = useTheme();
  return <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />;
}

// 모달 헤더도 테마 연동 — expo-router NavigationContainer 기본값은 라이트 고정
function ThemedStack() {
  const theme = useTheme();
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: theme.card }, headerTintColor: theme.text }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal/[gid]" options={{ presentation: 'modal', title: '' }} />
      <Stack.Screen name="modal/profile" options={{ presentation: 'modal', title: '' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider>
        <ThemeProvider>
          <ThemedStatusBar />
          <ThemedStack />
        </ThemeProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}
