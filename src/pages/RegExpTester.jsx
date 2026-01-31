import React, { useState, useEffect } from 'react';
import { TextInput, Tag } from '@carbon/react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';
import useLayoutToggle from '../hooks/useLayoutToggle';

const FLAG_OPTIONS = [
    { flag: 'g', label: 'Global', desc: 'Find all matches' },
    { flag: 'i', label: 'Ignore Case', desc: 'Case-insensitive' },
    { flag: 'm', label: 'Multiline', desc: '^ and $ match start/end of line' },
    { flag: 's', label: 'Dot All', desc: '. matches newlines' },
    { flag: 'u', label: 'Unicode', desc: 'Unicode support' },
    { flag: 'y', label: 'Sticky', desc: 'Match from lastIndex' },
];

const HighlightedText = ({ text, regex, flags }) => {
    if (!regex || !text) return <span>{text}</span>;

    try {
        const re = new RegExp(regex, flags.includes('g') ? flags : flags + 'g');
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = re.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                parts.push(
                    <span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>
                );
            }

            // Add highlighted match
            parts.push(
                <mark 
                    key={`match-${match.index}`}
                    style={{
                        backgroundColor: 'var(--cds-support-success-inverse)',
                        color: 'var(--cds-text-on-color)',
                        padding: '1px 2px',
                        borderRadius: '2px',
                        fontWeight: 600
                    }}
                >
                    {match[0]}
                </mark>
            );

            lastIndex = re.lastIndex;
            
            // Prevent infinite loop for zero-length matches
            if (match.index === re.lastIndex) {
                re.lastIndex++;
            }
        }

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(
                <span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>
            );
        }

        return <>{parts}</>;
    } catch (e) {
        return <span>{text}</span>;
    }
};

export default function RegExpTester() {
    const [regexStr, setRegexStr] = useState('');
    const [flags, setFlags] = useState('gm');
    const [text, setText] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [matches, setMatches] = useState([]);

    const layout = useLayoutToggle({
        toolKey: 'regexp-tester-layout',
        defaultDirection: 'horizontal',
        showToggle: true,
        persist: true
    });

    useEffect(() => {
        runRegex();
    }, [regexStr, flags, text]);

    const runRegex = () => {
        if (!regexStr) {
            setOutput('');
            setError('');
            setMatches([]);
            return;
        }
        try {
            const re = new RegExp(regexStr, flags);
            const foundMatches = Array.from(text.matchAll(re));
            setMatches(foundMatches);
            
            if (foundMatches.length === 0) {
                setOutput('No matches found.');
            } else {
                const matchDetails = foundMatches.map((match, i) => {
                    let detail = `Match ${i + 1}: "${match[0]}"\nIndex: ${match.index}`;
                    if (match.groups) {
                        const groupEntries = Object.entries(match.groups);
                        if (groupEntries.length > 0) {
                            detail += '\nGroups:\n' + groupEntries.map(([key, value]) => `  ${key}: "${value}"`).join('\n');
                        }
                    }
                    if (match.length > 1) {
                        const unnamedGroups = match.slice(1).filter((g, idx) => !Object.values(match.groups || {}).includes(g));
                        if (unnamedGroups.length > 0) {
                             detail += '\nUnnamed Groups:\n' + unnamedGroups.map((g, gi) => `  ${gi + 1}: "${g}"`).join('\n');
                        }
                    }
                    return detail;
                }).join('\n\n');
                setOutput(`Found ${foundMatches.length} match(es):\n\n${matchDetails}`);
            }
            setError('');
        } catch (e) {
            setError(e.message);
            setOutput('');
            setMatches([]);
        }
    };

    const toggleFlag = (flag) => {
        if (flags.includes(flag)) {
            setFlags(flags.replace(flag, ''));
        } else {
            setFlags(flags + flag);
        }
    };

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            <ToolHeader 
                title="RegExp Tester" 
                description="Test Regular Expressions against text. Matches are highlighted in the test string." 
            />

            <ToolControls>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '0.5rem' }}>
                    <span style={{ 
                        color: 'var(--cds-text-secondary)', 
                        fontSize: '1.25rem',
                        fontFamily: "'IBM Plex Mono', monospace"
                    }}>/</span>
                    <TextInput
                        id="regex-input"
                        labelText=""
                        value={regexStr}
                        onChange={(e) => setRegexStr(e.target.value)}
                        placeholder="Regular Expression..."
                        invalid={!!error}
                        style={{ 
                            flex: 1,
                            fontFamily: "'IBM Plex Mono', monospace"
                        }}
                    />
                    <span style={{ 
                        color: 'var(--cds-text-secondary)', 
                        fontSize: '1.25rem',
                        fontFamily: "'IBM Plex Mono', monospace"
                    }}>/</span>
                    
                    <TextInput
                        id="flags-input"
                        labelText=""
                        value={flags}
                        onChange={(e) => setFlags(e.target.value)}
                        placeholder="flags"
                        style={{ 
                            width: '80px',
                            fontFamily: "'IBM Plex Mono', monospace"
                        }}
                    />
                </div>
            </ToolControls>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {FLAG_OPTIONS.map(({ flag, label }) => (
                    <Tag
                        key={flag}
                        type={flags.includes(flag) ? 'blue' : 'gray'}
                        onClick={() => toggleFlag(flag)}
                        style={{ cursor: 'pointer' }}
                    >
                        {flag} - {label}
                    </Tag>
                ))}
            </div>
            
            {error && (
                <div style={{ 
                    color: 'var(--cds-support-error)', 
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: 'var(--cds-support-error-inverse)',
                    borderRadius: '4px'
                }}>
                    {error}
                </div>
            )}

            <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
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
                            Test String
                        </label>
                        {matches.length > 0 && (
                            <span style={{ 
                                fontSize: '0.75rem', 
                                color: 'var(--cds-support-success)',
                                fontWeight: 600
                            }}>
                                {matches.length} match{matches.length !== 1 ? 'es' : ''}
                            </span>
                        )}
                    </div>
                    <div style={{ 
                        flex: 1,
                        overflowY: 'auto',
                        padding: '0.75rem',
                        backgroundColor: 'var(--cds-layer)',
                        border: '1px solid var(--cds-border-strong)',
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter the text to test against..."
                            style={{
                                width: '100%',
                                height: '100%',
                                minHeight: '200px',
                                background: 'transparent',
                                border: 'none',
                                resize: 'none',
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: '0.875rem',
                                lineHeight: '1.5',
                                color: 'var(--cds-text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

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
                            Match Details
                        </label>
                    </div>
                    <div style={{ 
                        flex: 1,
                        overflowY: 'auto',
                        padding: '0.75rem',
                        backgroundColor: 'var(--cds-layer)',
                        border: '1px solid var(--cds-border-strong)',
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        color: 'var(--cds-text-primary)'
                    }}>
                        {output || (
                            <span style={{ color: 'var(--cds-text-secondary)' }}>
                                Matching results will appear here...
                            </span>
                        )}
                    </div>
                </div>
            </ToolSplitPane>

            {text && regexStr && !error && (
                <div style={{ 
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: 'var(--cds-layer)',
                    border: '1px solid var(--cds-border-strong)',
                    borderRadius: '4px'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--cds-text-secondary)',
                        textTransform: 'uppercase',
                        marginBottom: '0.5rem'
                    }}>
                        Highlighted Matches
                    </div>
                    <div style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        padding: '0.75rem',
                        backgroundColor: 'var(--cds-layer-01)',
                        borderRadius: '4px',
                        minHeight: '60px'
                    }}>
                        <HighlightedText text={text} regex={regexStr} flags={flags} />
                    </div>
                </div>
            )}
        </div>
    );
}
