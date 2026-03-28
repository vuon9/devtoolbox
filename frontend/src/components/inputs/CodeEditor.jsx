import React, { useEffect, useRef, useState } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap } from '@codemirror/commands';
import { carbonCodeMirrorExtension } from './carbonCodeMirrorTheme';
import { createSQLKeywordHighlighter } from './sqlHighlighter';

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
 * Editable code editor with syntax highlighting
 * Falls back to plain textarea when highlighting is disabled
 *
 * @param {string} value - Editor content
 * @param {function} onChange - Callback when content changes: (value) => void
 * @param {string} language - Programming language for syntax highlighting
 * @param {boolean} highlight - Whether to show syntax highlighting
 * @param {boolean} [readOnly=false] - Read-only mode
 * @param {string} [placeholder] - Placeholder text
 * @param {string} [label] - Label for the field
 * @param {boolean} [showLineNumbers=false] - Show line numbers
 * @param {string} [className] - Optional CSS class
 * @param {object} [style] - Optional inline styles
 */
export default function CodeEditor({
  value = '',
  onChange,
  language,
  highlight = true,
  readOnly = false,
  placeholder,
  label,
  showLineNumbers = false,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const languageRef = useRef(language);
  const readOnlyRef = useRef(readOnly);
  const showLineNumbersRef = useRef(showLineNumbers);

  // Keep refs in sync
  useEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
    languageRef.current = language;
    readOnlyRef.current = readOnly;
    showLineNumbersRef.current = showLineNumbers;
  });

  // Initialize CodeMirror editor - runs once when highlight becomes true
  useEffect(() => {
    if (!highlight || !containerRef.current || viewRef.current) return;

    let isCancelled = false;

    const initEditor = async () => {
      try {
        setIsLoading(true);
        setLoadError(false);

        // Load language support
        const langExtension = await loadLanguageExtension(languageRef.current);
        if (isCancelled) return;

        const extensions = [
          ...carbonCodeMirrorExtension,
          keymap.of(defaultKeymap),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && onChangeRef.current) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ];

        if (readOnlyRef.current) {
          extensions.push(EditorState.readOnly.of(true));
          extensions.push(EditorView.editable.of(false));
        }

        if (langExtension) {
          extensions.push(langExtension);
        }

        // Add SQL keyword categorization if language is SQL
        if (languageRef.current?.toLowerCase() === 'sql') {
          extensions.push(createSQLKeywordHighlighter());
        }

        if (showLineNumbersRef.current) {
          extensions.push(lineNumbers());
        }

        const state = EditorState.create({
          doc: valueRef.current,
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
          console.error('Failed to initialize code editor:', err);
          setLoadError(true);
          setIsLoading(false);
        }
      }
    };

    initEditor();

    return () => {
      isCancelled = true;
    };
  }, [highlight]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  // Destroy when highlight becomes false
  useEffect(() => {
    if (!highlight && viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }
  }, [highlight]);

  // Update content when value prop changes (but NOT during initial render)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (value !== currentContent) {
      const transaction = view.state.update({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
      });
      view.dispatch(transaction);
    }
  }, [value]);

  // Common container style for both highlighted and fallback modes
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '120px',
    border: '1px solid #27272a',
    backgroundColor: '#18181b',
    borderRadius: '8px',
    overflow: 'hidden',
    ...style,
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#71717a',
    padding: '8px 12px',
    borderBottom: '1px solid #27272a',
    backgroundColor: '#1c1917',
    flexShrink: 0,
  };

  // Fallback to plain textarea when highlighting is disabled or failed to load
  if (!highlight || loadError) {
    return (
      <div className={className} style={containerStyle}>
        {label && <div style={labelStyle}>{label}</div>}
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            padding: '12px',
            fontFamily: "'IBM Plex Mono', 'Menlo', 'Monaco', monospace",
            fontSize: '14px',
            lineHeight: 1.5,
            backgroundColor: 'transparent',
            border: 'none',
            color: '#f4f4f5',
            resize: 'none',
            outline: 'none',
          }}
        />
      </div>
    );
  }

  const editorContainerStyle = {
    flex: 1,
    overflow: 'auto',
    position: 'relative',
    minHeight: 0,
  };

  return (
    <div className={className} style={containerStyle}>
      {label && <div style={labelStyle}>{label}</div>}
      <div style={editorContainerStyle} ref={containerRef} />
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#71717a',
            fontSize: '14px',
          }}
        >
          Loading editor...
        </div>
      )}
    </div>
  );
}
