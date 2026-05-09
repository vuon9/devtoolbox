import React, { useEffect, useRef, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { useTheme } from '../../context/ThemeContext';
import ToolCopyButton from './ToolCopyButton';

const languageLoaders = {
  json: () => import('@codemirror/lang-json').then((m) => m.json()),
  javascript: () => import('@codemirror/lang-javascript').then((m) => m.javascript()),
  typescript: () =>
    import('@codemirror/lang-javascript').then((m) => m.javascript({ typescript: true })),
  html: () => import('@codemirror/lang-html').then((m) => m.html()),
  xml: () => import('@codemirror/lang-xml').then((m) => m.xml()),
  css: () => import('@codemirror/lang-css').then((m) => m.css()),
  sql: () => import('@codemirror/lang-sql').then((m) => m.sql()),
  java: () => import('@codemirror/lang-java').then((m) => m.java()),
  swift: () =>
    import('@codemirror/legacy-modes/mode/swift').then((m) =>
      import('@codemirror/language').then((lang) => lang.StreamLanguage.define(m.swift))
    ),
};

async function loadLanguageExtension(language) {
  const loader = languageLoaders[language?.toLowerCase()];
  if (!loader) return null;
  try {
    return await loader();
  } catch {
    return null;
  }
}

export default function HighlightedCode({
  code,
  language,
  copyable = true,
  showLineNumbers = false,
  className = '',
  label,
}) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const codeRef = useRef(code);
  const languageRef = useRef(language);
  const showLineNumbersRef = useRef(showLineNumbers);

  const { editorExtensions } = useTheme();

  useEffect(() => {
    codeRef.current = code;
    languageRef.current = language;
    showLineNumbersRef.current = showLineNumbers;
  });

  // Destroy and re-create on theme or code change
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }
    if (!containerRef.current || !codeRef.current) return;
    let isCancelled = false;

    const initEditor = async () => {
      try {
        setIsLoading(true);
        setLoadError(false);
        const langExtension = await loadLanguageExtension(languageRef.current);
        if (isCancelled) return;

        const extensions = [
          ...editorExtensions,
          EditorView.editable.of(false),
          EditorState.readOnly.of(true),
        ];
        if (langExtension) extensions.push(langExtension);
        if (showLineNumbersRef.current) {
          const { lineNumbers } = await import('@codemirror/view');
          extensions.push(lineNumbers());
        }

        const state = EditorState.create({ doc: codeRef.current, extensions });
        const view = new EditorView({ state, parent: containerRef.current });
        if (!isCancelled) {
          viewRef.current = view;
          setIsLoading(false);
        } else view.destroy();
      } catch {
        if (!isCancelled) {
          setLoadError(true);
          setIsLoading(false);
        }
      }
    };
    initEditor();
    return () => {
      isCancelled = true;
    };
  }, [editorExtensions]);

  useEffect(() => {
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentContent = view.state.doc.toString();
    if (code !== currentContent) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
    }
  }, [code]);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '60px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    position: 'relative',
  };
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--card)',
    minHeight: '40px',
  };
  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: '0.32px',
    color: 'var(--muted-foreground)',
  };
  const editorContainerStyle = { flex: 1, overflow: 'auto', position: 'relative', minHeight: 0 };

  if (loadError) {
    return (
      <div className={className} style={containerStyle}>
        {(label || copyable) && (
          <div style={headerStyle}>
            {label && <span style={labelStyle}>{label}</span>}
            {copyable && <ToolCopyButton text={code} size="sm" />}
          </div>
        )}
        <div style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
          <pre
            style={{
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              fontSize: '0.875rem',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              color: 'var(--foreground)',
            }}
          >
            {code}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle}>
      {(label || copyable) && (
        <div style={headerStyle}>
          {label && <span style={labelStyle}>{label}</span>}
          {copyable && <ToolCopyButton text={code} size="sm" />}
        </div>
      )}
      <div style={editorContainerStyle} ref={containerRef} />
    </div>
  );
}
