import React, { useEffect, useRef, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { carbonCodeMirrorExtension } from './carbonCodeMirrorTheme';
import ToolCopyButton from './ToolCopyButton';

/**
 * Maps language names to CodeMirror language modules
 */
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

/**
 * Loads a CodeMirror language extension dynamically
 */
async function loadLanguageExtension(language) {
  const loader = languageLoaders[language.toLowerCase()];
  if (!loader) {
    console.warn(`Language "${language}" not supported for syntax highlighting`);
    return null;
  }
  try {
    return await loader();
  } catch (err) {
    console.warn(`Failed to load language "${language}":`, err);
    return null;
  }
}

/**
 * Read-only code display with syntax highlighting
 * Uses CodeMirror 6 for consistent theming with CodeEditor
 *
 * @param {string} code - The code to display
 * @param {string} language - Programming language for syntax highlighting
 * @param {boolean} [copyable=true] - Show copy button
 * @param {boolean} [showLineNumbers=false] - Show line numbers
 * @param {string} [className] - Optional CSS class
 * @param {string} [label] - Optional label text (replaces label prop pattern)
 */
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

  // Keep refs in sync
  useEffect(() => {
    codeRef.current = code;
    languageRef.current = language;
    showLineNumbersRef.current = showLineNumbers;
  });

  // Initialize CodeMirror editor - runs once on mount
  useEffect(() => {
    if (!containerRef.current || viewRef.current) return;

    let isCancelled = false;

    const initEditor = async () => {
      if (!codeRef.current) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(false);

        // Load language support
        const langExtension = await loadLanguageExtension(languageRef.current);
        if (isCancelled) return;

        const extensions = [
          ...carbonCodeMirrorExtension,
          EditorView.editable.of(false),
          EditorState.readOnly.of(true),
        ];

        if (langExtension) {
          extensions.push(langExtension);
        }

        if (showLineNumbersRef.current) {
          const { lineNumbers } = await import('@codemirror/view');
          extensions.push(lineNumbers());
        }

        const state = EditorState.create({
          doc: codeRef.current,
          extensions,
        });

        const view = new EditorView({
          state,
          parent: containerRef.current,
        });

        if (!isCancelled) {
          viewRef.current = view;
          setIsLoading(false);
        } else {
          view.destroy();
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to initialize code highlighting:', err);
          setLoadError(true);
          setIsLoading(false);
        }
      }
    };

    initEditor();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  // Update content when code changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (code !== currentContent) {
      const transaction = view.state.update({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: code,
        },
      });
      view.dispatch(transaction);
    }
  }, [code]);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '60px',
    border: '1px solid var(--cds-border-strong)',
    backgroundColor: 'var(--cds-field)',
    position: 'relative',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid var(--cds-border-subtle)',
    backgroundColor: 'var(--cds-layer)',
    minHeight: '40px',
  };

  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: '0.32px',
    color: 'var(--cds-text-secondary)',
  };

  const editorContainerStyle = {
    flex: 1,
    overflow: 'auto',
    position: 'relative',
    minHeight: 0,
  };

  // Fallback plain text display on error
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
              color: 'var(--cds-text-primary)',
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
