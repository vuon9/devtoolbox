import { THEMES as builtins } from './builtins';
import oneDarkPro from './one-dark-pro.json';
import dracula from './dracula.json';
import nord from './nord.json';
import catppuccinMocha from './catppuccin-mocha.json';
import solarizedDark from './solarized-dark.json';
import solarizedLight from './solarized-light.json';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

const BUNDLED_GALLERY = [
  oneDarkPro, dracula, nord, catppuccinMocha, solarizedDark, solarizedLight,
];

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
  ...BUNDLED_GALLERY,
];

function makeKey(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

async function fetchUserThemes() {
  try {
    const res = await fetch(`${API_BASE}/api/themes-service/list`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.filter(t => t && t.name);
  } catch {
    return [];
  }
}

let userThemesLoaded = false;

export async function loadUserThemes() {
  if (userThemesLoaded) return;
  userThemesLoaded = true;

  const userThemes = await fetchUserThemes();
  const bundledNames = new Set(allThemes.map(t => t.name));

  for (const ut of userThemes) {
    if (!bundledNames.has(ut.name)) {
      allThemes.push(ut);
      bundledNames.add(ut.name);
    }
  }
}

export function getThemeByKey(key) {
  if (builtins[key]) return builtins[key];
  return allThemes.find((t) => makeKey(t.name) === key);
}

export function resolveActualType(themeMode, systemPrefersDark) {
  if (themeMode === 'system') {
    return systemPrefersDark ? 'dark' : 'light';
  }
  return themeMode;
}
