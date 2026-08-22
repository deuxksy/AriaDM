import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectionProvider } from '../core/rpc/ConnectionContext';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 } },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal/[gid]" options={{ presentation: 'modal', title: '' }} />
          <Stack.Screen name="modal/profile" options={{ presentation: 'modal', title: '' }} />
        </Stack>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}
