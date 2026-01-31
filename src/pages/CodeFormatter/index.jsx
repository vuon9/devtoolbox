import React, { useState, useCallback, useEffect } from 'react';
import { Button, Select, SelectItem, TextInput, IconButton } from '@carbon/react';
import { Code, TrashCan, Close } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../../components/ToolUI';
import { Backend } from '../../utils/backendBridge';

const FORMATTERS = [
    { id: 'json', name: 'JSON', supportsFilter: true, filterPlaceholder: '.users[] | select(.age > 18) | .name' },
    { id: 'xml', name: 'XML', supportsFilter: true, filterPlaceholder: '//book[price<30]/title' },
    { id: 'html', name: 'HTML', supportsFilter: true, filterPlaceholder: 'div.container > h1' },
    { id: 'sql', name: 'SQL', supportsFilter: false },
    { id: 'css', name: 'CSS', supportsFilter: false },
    { id: 'javascript', name: 'JavaScript', supportsFilter: false },
];

const STORAGE_KEY = 'codeFormatterState';

export default function CodeFormatter() {
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

    const [formatType, setFormatType] = useState(persisted?.formatType || 'json');
    const [input, setInput] = useState(persisted?.input || '');
    const [output, setOutput] = useState('');
    const [formattedOutput, setFormattedOutput] = useState(''); // Store formatted output for filter source
    const [filter, setFilter] = useState(persisted?.filter || '');
    const [error, setError] = useState(null);
    const [isMinified, setIsMinified] = useState(false);

    // Persist state
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            formatType,
            input,
            filter
        }));
    }, [formatType, input, filter]);

    const currentFormatter = FORMATTERS.find(f => f.id === formatType);

    const format = useCallback(async () => {
        if (!input.trim()) {
            setOutput('');
            setFormattedOutput('');
            setError(null);
            return;
        }

        try {
            const result = await Backend.CodeFormatterService.Format({
                input,
                formatType,
                filter: undefined,
                minify: false
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
            const result = await Backend.CodeFormatterService.Format({
                input,
                formatType,
                filter: undefined,
                minify: true
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
            const result = await Backend.CodeFormatterService.Format({
                input: formattedOutput, // Always use formatted output as source
                formatType,
                filter: filter.trim(),
                minify: false
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
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            <ToolHeader
                title="Code Formatter"
                description="Format, minify, and query JSON, XML, HTML, SQL, CSS, and JavaScript with filter support."
            />

            <ToolControls>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <Select
                        id="format-type"
                        labelText="Format Type"
                        value={formatType}
                        onChange={(e) => setFormatType(e.target.value)}
                        style={{ minWidth: '150px' }}
                    >
                        {FORMATTERS.map(f => (
                            <SelectItem key={f.id} value={f.id} text={f.name} />
                        ))}
                    </Select>

                    <Button onClick={format} renderIcon={Code} size='md'>
                        Format
                    </Button>
                    <Button onClick={minify} kind="secondary" size='md'>
                        Minify
                    </Button>
                </div>
            </ToolControls>

            {error && (
                <div style={{
                    color: 'var(--cds-support-error)',
                    padding: '0.75rem',
                    backgroundColor: 'var(--cds-layer-hover)',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                }}>
                    {error}
                </div>
            )}

            <ToolSplitPane>
                <ToolPane
                    label="Input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Paste ${currentFormatter?.name || 'code'} here...`}
                />
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.5rem' }}>
                    <ToolPane
                        label={isMinified ? 'Output (Minified)' : 'Output (Formatted)'}
                        value={output}
                        readOnly
                        placeholder={`Formatted ${currentFormatter?.name || 'code'} will appear here...`}
                    />
                    {currentFormatter?.supportsFilter && (
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'flex-end',
                            alignContent: 'flex-end'
                        }}>
                            <TextInput
                                id="filter-input"
                                labelText="Filter"
                                placeholder={currentFormatter.filterPlaceholder}
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <IconButton
                                label="Clear filter"
                                onClick={clearFilter}
                                disabled={!filter}
                                size="md"
                            >
                                <Close />
                            </IconButton>
                        </div>
                    )}
                </div>
            </ToolSplitPane>
        </div>
    );
}
