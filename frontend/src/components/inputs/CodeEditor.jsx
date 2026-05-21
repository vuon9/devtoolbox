import React, { useEffect, useRef, useState } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap } from '@codemirror/commands';
import { useTheme } from '../../context/ThemeContext';
import { createSQLKeywordHighlighter } from './sqlHighlighter';

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

export default function CodeEditor({
  value = '',
  onChange,
  language,
  highlight = true,
  readOnly = false,
  placeholder,
  label,
  dataTestId,
  ariaLabel,
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
  const dataTestIdRef = useRef(dataTestId);
  const ariaLabelRef = useRef(ariaLabel);
  const placeholderRef = useRef(placeholder);
  const labelRef = useRef(label);

  const { editorExtensions } = useTheme();

  useEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
    languageRef.current = language;
    readOnlyRef.current = readOnly;
    showLineNumbersRef.current = showLineNumbers;
    dataTestIdRef.current = dataTestId;
    ariaLabelRef.current = ariaLabel;
    placeholderRef.current = placeholder;
    labelRef.current = label;
  });

  // Destroy existing view on theme change, then re-init
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }
    if (!highlight || !containerRef.current) return;
    let isCancelled = false;
    const initEditor = async () => {
      try {
        setIsLoading(true);
        setLoadError(false);
        const langExtension = await loadLanguageExtension(languageRef.current);
        if (isCancelled) return;

        const extensions = [
          ...editorExtensions,
          keymap.of(defaultKeymap),
          EditorView.contentAttributes.of({
            'aria-label':
              ariaLabelRef.current ||
              labelRef.current ||
              placeholderRef.current ||
              (readOnlyRef.current ? 'Read-only code output' : 'Code editor'),
            ...(dataTestIdRef.current ? { 'data-testid': `${dataTestIdRef.current}-content` } : {}),
            ...(readOnlyRef.current ? { 'aria-readonly': 'true' } : {}),
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && onChangeRef.current)
              onChangeRef.current(update.state.doc.toString());
          }),
        ];
        if (readOnlyRef.current) {
          extensions.push(EditorState.readOnly.of(true));
          extensions.push(EditorView.editable.of(false));
        }
        if (langExtension) extensions.push(langExtension);
        if (languageRef.current?.toLowerCase() === 'sql')
          extensions.push(createSQLKeywordHighlighter());
        if (showLineNumbersRef.current) extensions.push(lineNumbers());

        const state = EditorState.create({ doc: valueRef.current, extensions });
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
  }, [highlight, editorExtensions, dataTestId, ariaLabel, label, placeholder]);

  useEffect(() => {
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    if (!highlight && viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }
  }, [highlight]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentContent = view.state.doc.toString();
    if (value !== currentContent) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
    }
  }, [value]);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '120px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    borderRadius: '8px',
    overflow: 'hidden',
    ...style,
  };
  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--muted-foreground)',
    padding: '8px 12px',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--card)',
    flexShrink: 0,
  };

  if (!highlight || loadError) {
    return (
      <div className={className} style={containerStyle} data-testid={dataTestId}>
        {label && <div style={labelStyle}>{label}</div>}
        <textarea
          data-testid={dataTestId ? `${dataTestId}-content` : undefined}
          aria-label={ariaLabel || label || placeholder || 'Code editor'}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            padding: '12px',
            fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
            fontSize: '14px',
            lineHeight: 1.5,
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--foreground)',
            resize: 'none',
            outline: 'none',
          }}
        />
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle} data-testid={dataTestId}>
      {label && <div style={labelStyle}>{label}</div>}
      <div
        style={{ flex: 1, overflow: 'auto', position: 'relative', minHeight: 0 }}
        ref={containerRef}
      />
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'var(--muted-foreground)',
            fontSize: '14px',
          }}
        >
          Loading editor...
        </div>
      )}
    </div>
  );
}
