import React, { useState, useEffect } from 'react';

export default function RegExpTester() {
    const [regexStr, setRegexStr] = useState('');
    const [flags, setFlags] = useState('gm');
    const [text, setText] = useState('');
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        runRegex();
    }, [regexStr, flags, text]);

    const runRegex = () => {
        if (!regexStr) {
            setMatches([]);
            setError('');
            return;
        }
        try {
            const re = new RegExp(regexStr, flags);
            const found = [];
            let match;
            // Prevent infinite loops with global flag if empty string match
            // But usually matchAll or exec loop is used.
            // Simplified approach:
            if (!flags.includes('g')) {
                const m = text.match(re);
                if (m) found.push({ index: m.index, match: m[0], groups: m.slice(1) });
            } else {
                let tempText = text;
                // Using matchAll is better for modern JS
                const iterator = text.matchAll(re);
                for (const m of iterator) {
                    found.push({ index: m.index, match: m[0], groups: m.slice(1) });
                }
            }
            setMatches(found);
            setError('');
        } catch (e) {
            setError(e.message);
            setMatches([]);
        }
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">RegExp Tester</h2>
                <p className="tool-desc">Test Regular Expressions against text.</p>
            </div>

            <div className="controls">
                <span style={{ color: 'var(--text-secondary)' }}>/</span>
                <input
                    type="text"
                    style={{ flex: 1, fontFamily: 'monospace' }}
                    value={regexStr}
                    onChange={(e) => setRegexStr(e.target.value)}
                    placeholder="Regular Expression..."
                />
                <span style={{ color: 'var(--text-secondary)' }}>/</span>
                <input
                    type="text"
                    style={{ width: '60px', fontFamily: 'monospace' }}
                    value={flags}
                    onChange={(e) => setFlags(e.target.value)}
                    placeholder="flags"
                />
            </div>
            {error && <div style={{ color: 'var(--error-color)', marginBottom: '10px' }}>{error}</div>}

            <div className="split-pane">
                <div className="pane">
                    <div className="pane-header"><span className="pane-label">Text</span></div>
                    <textarea
                        className="code-editor"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Test string..."
                    />
                </div>
                <div className="pane">
                    <div className="pane-header">
                        <span className="pane-label">Matches ({matches.length})</span>
                    </div>
                    <div className="code-editor" style={{ overflowY: 'auto' }}>
                        {matches.length === 0 ? <span style={{ color: 'var(--text-secondary)' }}>No matches</span> : (
                            matches.map((m, i) => (
                                <div key={i} style={{ marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>
                                    <div style={{ color: 'var(--accent-color)' }}>Match {i + 1}: "{m.match}"</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Index: {m.index}</div>
                                    {m.groups.length > 0 && (
                                        <div style={{ marginLeft: '10px' }}>
                                            {m.groups.map((g, gi) => (
                                                <div key={gi}>Group {gi + 1}: "{g}"</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
