import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { themes, type ThemeTokens } from './theme';
import { useSettings } from '../features/settings/store';

export function resolveTheme(mode: string, system: string | null | undefined): 'light' | 'dark' {
  if (mode === 'light' || mode === 'dark') return mode;
  return system === 'dark' ? 'dark' : 'light';
}

const ThemeCtx = createContext<ThemeTokens & { mode: 'light' | 'dark' }>({
  ...themes.light,
  mode: 'light',
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeMode = useSettings((s) => s.themeMode);
  const system = useColorScheme();
  const mode = resolveTheme(themeMode, system);
  return <ThemeCtx.Provider value={{ ...themes[mode], mode }}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): ThemeTokens & { mode: 'light' | 'dark' } {
  return useContext(ThemeCtx);
}
