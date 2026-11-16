import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider, type Theme as NavTheme } from 'expo-router';
import { themes, type ThemeTokens } from './theme';
import { useSettings } from '../features/settings/store';

export function resolveTheme(mode: string, system: string | null | undefined): 'light' | 'dark' {
  if (mode === 'light' || mode === 'dark') return mode;
  return system === 'dark' ? 'dark' : 'light';
}

// expo-router는 NavigationContainer를 내부 관리 — react-navigation 테마는 ThemeProvider로 주입
export function toNavTheme(p: ThemeTokens, mode: 'light' | 'dark'): NavTheme {
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: p.accent,
      background: p.bg,
      card: p.card,
      text: p.text,
      border: p.muted,
      notification: p.accent,
    },
  };
}

const ThemeCtx = createContext<ThemeTokens & { mode: 'light' | 'dark' }>({
  ...themes.light,
  mode: 'light',
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeMode = useSettings((s) => s.themeMode);
  const system = useColorScheme();
  const mode = resolveTheme(themeMode, system);
  const palette = themes[mode];
  return (
    <ThemeCtx.Provider value={{ ...palette, mode }}>
      <NavThemeProvider value={toNavTheme(palette, mode)}>{children}</NavThemeProvider>
    </ThemeCtx.Provider>
  );
}

export function useTheme(): ThemeTokens & { mode: 'light' | 'dark' } {
  return useContext(ThemeCtx);
}
