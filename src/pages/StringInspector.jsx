import React, { useState, useEffect } from 'react';
import { TextArea, Tile } from '@carbon/react';

export default function StringInspector() {
    const [input, setInput] = useState('');
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
        { label: 'Unicodes (Chars)', value: stats.chars },
        { label: 'Words', value: stats.words },
        { label: 'Lines', value: stats.lines },
        { label: 'Bytes (UTF-8)', value: stats.bytes },
        { label: 'Sentences (Approx)', value: stats.sentences },
    ];

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">String Inspector</h2>
                <p className="tool-desc">Analyze string statistics.</p>
            </div>

            <div className="split-pane">
                <div className="pane">
                    <TextArea
                        labelText="Input Text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type or paste text..."
                        rows={20}
                        style={{ height: '100%' }}
                    />
                </div>
                <div className="pane" style={{ flex: '0 0 350px' }}>
                    <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Statistics</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {items.map((item, i) => (
                            <Tile key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                                <span style={{ color: 'var(--cds-text-secondary)' }}>{item.label}</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--cds-text-primary)' }}>
                                    {item.value.toLocaleString()}
                                </span>
                            </Tile>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
