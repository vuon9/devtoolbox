import { THEMES as builtins } from './builtins';
import oneDarkPro from './one-dark-pro';
import dracula from './dracula';
import nord from './nord';
import catppuccinMocha from './catppuccin-mocha';
import solarizedDark from './solarized-dark';
import solarizedLight from './solarized-light';

export const THEME_TOKENS = [
  'background', 'foreground', 'card', 'card-foreground',
  'popover', 'popover-foreground', 'primary', 'primary-foreground',
  'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
  'accent', 'accent-foreground', 'destructive', 'destructive-foreground',
  'border', 'input', 'ring', 'success', 'success-foreground',
  'warning', 'warning-foreground',
  'sidebar-background', 'sidebar-foreground', 'sidebar-accent',
  'titlebar-background', 'scrollbar-thumb', 'scrollbar-track',
];

export const BUILT_IN_THEME_KEYS = ['github-dark', 'github-light'];

export const allThemes = [
  builtins['github-dark'],
  builtins['github-light'],
  oneDarkPro,
  dracula,
  nord,
  catppuccinMocha,
  solarizedDark,
  solarizedLight,
];

export function getThemeByKey(key) {
  if (builtins[key]) return builtins[key];
  return allThemes.find(t => t.name.toLowerCase().replace(/\s+/g, '-') === key);
}

export function resolveTheme(themeMode) {
  if (themeMode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      theme: prefersDark ? builtins['github-dark'] : builtins['github-light'],
      actualType: prefersDark ? 'dark' : 'light',
    };
  }
  const theme = getThemeByKey(themeMode);
  if (theme) return { theme, actualType: theme.type };
  return { theme: builtins['github-dark'], actualType: 'dark' };
}
