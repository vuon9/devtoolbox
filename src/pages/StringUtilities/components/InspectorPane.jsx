import React, { useState, useEffect } from 'react';
import { Tile } from '@carbon/react';
import { ToolPane, ToolSplitPane } from '../../../components/ToolUI';

export default function InspectorPane({ input, setInput, layout }) {
    const [stats, setStats] = useState({
        chars: 0,
        words: 0,
        lines: 0,
        bytes: 0,
        sentences: 0
    });

    useEffect(() => {
        const chars = input.length;
        const words = input.trim() === '' ? 0 : input.trim().split(/\s+/).length;
        const lines = input === '' ? 0 : input.split('\n').length;
        const bytes = new Blob([input]).size;
        const sentences = input.trim() === '' ? 0 : input.split(/[.!?]+/).filter(x => x.trim()).length;

        setStats({ chars, words, lines, bytes, sentences });
    }, [input]);

    const items = [
        { label: 'Characters', value: stats.chars },
        { label: 'Words', value: stats.words },
        { label: 'Lines', value: stats.lines },
        { label: 'Bytes (UTF-8)', value: stats.bytes },
        { label: 'Sentences', value: stats.sentences },
    ];

    return (
        <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
            <ToolPane
                label="Input Text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to analyze..."
            />
            <div className="pane" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                flex: 1
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '30px',
                    marginBottom: '0.5rem'
                }}>
                    <label style={{
                        fontSize: '0.75rem',
                        fontWeight: 400,
                        lineHeight: 1.5,
                        letterSpacing: '0.32px',
                        color: 'var(--cds-text-secondary)',
                        textTransform: 'uppercase'
                    }}>
                        Statistics
                    </label>
                </div>
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0.75rem',
                    backgroundColor: 'var(--cds-layer)',
                    border: '1px solid var(--cds-border-strong)',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {items.map((item, i) => (
                            <Tile key={i} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '1rem',
                                backgroundColor: 'var(--cds-layer-01)'
                            }}>
                                <span style={{ color: 'var(--cds-text-secondary)' }}>{item.label}</span>
                                <span style={{ 
                                    fontWeight: 'bold', 
                                    fontSize: '1.25rem', 
                                    color: 'var(--cds-text-primary)',
                                    fontFamily: "'IBM Plex Mono', monospace"
                                }}>
                                    {item.value.toLocaleString()}
                                </span>
                            </Tile>
                        ))}
                    </div>
                </div>
            </div>
        </ToolSplitPane>
    );
}
