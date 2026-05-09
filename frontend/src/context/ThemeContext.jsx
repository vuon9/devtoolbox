import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { SCOPE_TO_TAG } from '../theme/scope-mapping';
import { THEME_TOKENS, resolveTheme, allThemes, BUILT_IN_THEME_KEYS } from '../theme';

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

function buildHighlightStyle(theme) {
  if (!theme?.tokenColors?.length) return null;
  return HighlightStyle.define(
    theme.tokenColors.map(tc => ({
      tag: SCOPE_TO_TAG[tc.scope] || tc.scope,
      color: tc.color,
    }))
  );
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(() => {
    return localStorage.getItem('themeMode') || 'system';
  });

  const setThemeMode = useCallback((mode) => {
    localStorage.setItem('themeMode', mode);
    setThemeModeState(mode);
  }, []);

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolved = useMemo(() => {
    if (themeMode === 'system') {
      return {
        theme: systemPrefersDark ? allThemes[0] : allThemes[1],
        actualType: systemPrefersDark ? 'dark' : 'light',
      };
    }
    return resolveTheme(themeMode);
  }, [themeMode, systemPrefersDark]);

  const { theme } = resolved;

  useEffect(() => {
    const root = document.documentElement;

    if (theme.isBuiltIn) {
      THEME_TOKENS.forEach(token => root.style.removeProperty(`--${token}`));
      if (theme.type === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else {
      root.classList.remove('dark');
      for (const [token, value] of Object.entries(theme.colors)) {
        root.style.setProperty(`--${token}`, value);
      }
    }
  }, [theme]);

  const highlightStyle = useMemo(() => buildHighlightStyle(theme), [theme]);

  const editorExtensions = useMemo(() => {
    if (!highlightStyle) return [];
    return [
      EditorView.theme({
        '&': { backgroundColor: 'var(--background)', color: 'var(--foreground)' },
        '.cm-content': { caretColor: 'var(--foreground)', fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace" },
        '.cm-gutters': { backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)', color: 'var(--muted-foreground)' },
        '.cm-activeLineGutter': { backgroundColor: 'var(--muted)' },
        '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--foreground)' },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'var(--accent)' },
      }),
      syntaxHighlighting(highlightStyle),
    ];
  }, [highlightStyle]);

  const value = useMemo(() => ({
    themeMode,
    setThemeMode,
    theme,
    actualType: resolved.actualType,
    editorExtensions,
    allThemes,
  }), [themeMode, setThemeMode, theme, resolved.actualType, editorExtensions]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
