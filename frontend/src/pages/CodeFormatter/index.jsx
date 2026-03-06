import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, Column, Button, Select, SelectItem, TextInput, IconButton } from '@carbon/react';
import { Code, TrashCan, Close } from '@carbon/icons-react';
import {
  ToolHeader,
  ToolControls,
  ToolPane,
  ToolSplitPane,
  ToolLayoutToggle,
  CodeEditor,
  EditorToggle,
} from '../../components/ToolUI';
import useLayoutToggle from '../../hooks/useLayoutToggle';
import { Format } from '../../services/api';

const FORMATTERS = [
  {
    id: 'json',
    name: 'JSON',
    supportsFilter: true,
    filterPlaceholder: '.users[] | select(.age > 18) | .name',
    sample: '{"users":[{"name":"John","age":30},{"name":"Jane","age":25}],"count":2}',
  },
  {
    id: 'xml',
    name: 'XML',
    supportsFilter: true,
    filterPlaceholder: '//book[price<30]/title',
    sample:
      '<?xml version="1.0"?>\n<catalog>\n  <book id="bk101">\n    <author>Gambardella, Matthew</author>\n    <title>XML Developer\'s Guide</title>\n    <genre>Computer</genre>\n    <price>44.95</price>\n  </book>\n</catalog>',
  },
  {
    id: 'html',
    name: 'HTML',
    supportsFilter: true,
    filterPlaceholder: 'div.container > h1',
    sample:
      '<!DOCTYPE html>\n<html>\n<body>\n  <div class="container">\n    <h1>Hello World</h1>\n    <p>This is a paragraph.</p>\n  </div>\n</body>\n</html>',
  },
  {
    id: 'sql',
    name: 'SQL',
    supportsFilter: false,
    sample:
      'SELECT u.id, u.name, o.order_date FROM users u JOIN orders o ON u.id = o.user_id WHERE u.active = 1 ORDER BY o.order_date DESC;',
  },
  {
    id: 'css',
    name: 'CSS',
    supportsFilter: false,
    sample:
      '.container { display: flex; flex-direction: column; padding: 1rem; } .container h1 { color: blue; font-size: 2rem; }',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    supportsFilter: false,
    sample:
      'function greet(name) { const message = `Hello, ${name}!`; console.log(message); return message; } greet("World");',
  },
];

const STORAGE_KEY = 'codeFormatterState';

export default function CodeFormatter() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Load persisted state
  const loadPersistedState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  };

  const persisted = loadPersistedState();

  // Check for format preset in URL params
  const urlFormat = searchParams.get('format');
  const validFormats = FORMATTERS.map((f) => f.id);
  const initialFormatType = validFormats.includes(urlFormat)
    ? urlFormat
    : persisted?.formatType || 'json';

  const [formatType, setFormatType] = useState(initialFormatType);
  const [input, setInput] = useState(persisted?.input || '');
  const [output, setOutput] = useState('');
  const [formattedOutput, setFormattedOutput] = useState(''); // Store formatted output for filter source
  const [filter, setFilter] = useState(persisted?.filter || '');
  const [error, setError] = useState(null);
  const [isMinified, setIsMinified] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('codeFormatter-editor-highlight');
      return saved ? JSON.parse(saved) : true; // Default: ON
    } catch {
      return true;
    }
  });

  // React to URL format changes even when already mounted
  useEffect(() => {
    if (urlFormat && validFormats.includes(urlFormat)) {
      setFormatType(urlFormat);
      // Clear URL params after using preset to avoid re-triggering on reload
      setSearchParams({}, { replace: true });
    }
  }, [urlFormat, setSearchParams, validFormats]);

  // Cache for per-language inputs and filters (in memory only)
  const inputCacheRef = useRef({});
  const filterCacheRef = useRef({});
  const prevFormatTypeRef = useRef(formatType);

  const layout = useLayoutToggle({
    toolKey: 'code-formatter-layout',
    defaultDirection: 'horizontal',
    showToggle: true,
    persist: true,
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        formatType,
        input,
        filter,
      })
    );
  }, [formatType, input, filter]);

  // Handle format type changes - cache current input/filter and restore cached for new type
  useEffect(() => {
    const prevType = prevFormatTypeRef.current;

    if (formatType !== prevType) {
      // Save current input and filter to cache for previous type
      inputCacheRef.current[prevType] = input;
      filterCacheRef.current[prevType] = filter;

      // Load cached input and filter for new type, or empty string if not cached
      const cachedInput = inputCacheRef.current[formatType];
      const cachedFilter = filterCacheRef.current[formatType];
      setInput(cachedInput !== undefined ? cachedInput : '');
      setFilter(cachedFilter !== undefined ? cachedFilter : '');

      // Clear output when switching languages
      setOutput('');
      setFormattedOutput('');
      setError(null);

      // Update ref
      prevFormatTypeRef.current = formatType;
    }
  }, [formatType]);

  const currentFormatter = FORMATTERS.find((f) => f.id === formatType);

  const format = useCallback(async () => {
    if (!input.trim()) {
      setOutput('');
      setFormattedOutput('');
      setError(null);
      return;
    }

    try {
      const result = await Format({
        input,
        formatType,
        filter: '',
        minify: false,
      });

      if (result.error) {
        setError(result.error);
        setOutput('');
        setFormattedOutput('');
      } else {
        setFormattedOutput(result.output);
        setOutput(result.output);
        setError(null);
        setIsMinified(false);
      }
    } catch (err) {
      setError(err.message);
      setOutput('');
      setFormattedOutput('');
    }
  }, [input, formatType]);

  const minify = useCallback(async () => {
    if (!input.trim()) {
      setOutput('');
      setFormattedOutput('');
      setError(null);
      return;
    }

    try {
      const result = await Format({
        input,
        formatType,
        filter: '',
        minify: true,
      });

      if (result.error) {
        setError(result.error);
        setOutput('');
        setFormattedOutput('');
      } else {
        setFormattedOutput(result.output);
        setOutput(result.output);
        setError(null);
        setIsMinified(true);
      }
    } catch (err) {
      setError(err.message);
      setOutput('');
      setFormattedOutput('');
    }
  }, [input, formatType]);

  // Apply filter to formatted output (not the already-filtered output)
  const applyFilter = useCallback(async () => {
    if (!formattedOutput.trim() || !filter.trim()) {
      // If filter is cleared, restore formatted output
      if (!filter.trim()) {
        setOutput(formattedOutput);
      }
      return;
    }

    try {
      const result = await Format({
        input: formattedOutput, // Always use formatted output as source
        formatType,
        filter: filter.trim(),
        minify: false,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setOutput(result.output);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [formattedOutput, formatType, filter]);

  const clearFilter = useCallback(() => {
    setFilter('');
    setError(null);
  }, []);

  const clear = useCallback(() => {
    setInput('');
    setOutput('');
    setFormattedOutput('');
    setFilter('');
    setError(null);
    setIsMinified(false);
  }, []);

  // Auto-format on input change (debounced) - only for formatting, not filter
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        format();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [input, formatType]);

  // Auto-apply filter when filter changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formattedOutput.trim() && currentFormatter?.supportsFilter) {
        applyFilter();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [filter, formattedOutput]);

  return (
    <Grid
      fullWidth
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}
    >
      <Column>
        <ToolHeader
          title="Code Formatter"
          description="Format, minify, and query JSON, XML, HTML, SQL, CSS, and JavaScript with filter support."
        />
      </Column>

      <Column>
        <ToolControls>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <Select
              id="format-type"
              labelText="Format Type"
              value={formatType}
              onChange={(e) => setFormatType(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              {FORMATTERS.map((f) => (
                <SelectItem key={f.id} value={f.id} text={f.name} />
              ))}
            </Select>

            <Button onClick={format} renderIcon={Code} size="md">
              Format
            </Button>
            <Button onClick={minify} kind="secondary" size="md">
              Minify
            </Button>

            <EditorToggle
              enabled={highlightEnabled}
              onToggle={setHighlightEnabled}
              toolKey="codeFormatter"
            />

            {currentFormatter?.sample && (
              <Button kind="tertiary" size="md" onClick={() => setInput(currentFormatter.sample)}>
                Load Sample
              </Button>
            )}

            <div style={{ marginLeft: 'auto', paddingBottom: '4px' }}>
              <ToolLayoutToggle
                direction={layout.direction}
                onToggle={layout.toggleDirection}
                position="controls"
              />
            </div>
          </div>
        </ToolControls>
      </Column>

      {error && (
        <Column>
          <div
            style={{
              color: 'var(--cds-support-error)',
              padding: '0.75rem',
              backgroundColor: 'var(--cds-layer-hover)',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        </Column>
      )}

      <Column style={{ flex: 1, minHeight: 0 }}>
        <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
          <CodeEditor
            label="Input"
            language={formatType}
            value={input}
            onChange={setInput}
            highlight={false}
            placeholder={`Paste ${currentFormatter?.name || 'code'} here...`}
            style={{ minHeight: '100%' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.5rem' }}>
            <CodeEditor
              label={isMinified ? 'Output (Minified)' : 'Output (Formatted)'}
              language={formatType.toLowerCase()}
              value={output}
              highlight={highlightEnabled}
              readOnly
              placeholder={`Formatted ${currentFormatter?.name || 'code'} will appear here...`}
              style={{ flex: 1, minHeight: 0 }}
            />
            {currentFormatter?.supportsFilter && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'flex-end',
                  alignContent: 'flex-end',
                }}
              >
                <TextInput
                  id="filter-input"
                  labelText="Filter"
                  placeholder={currentFormatter.filterPlaceholder}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{ flex: 1 }}
                />
                <IconButton label="Clear filter" onClick={clearFilter} disabled={!filter} size="md">
                  <Close />
                </IconButton>
              </div>
            )}
          </div>
        </ToolSplitPane>
      </Column>
    </Grid>
  );
}
