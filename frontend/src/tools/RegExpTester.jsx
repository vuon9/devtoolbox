import React, { useState, useEffect } from 'react';
import { TextInput } from '@carbon/react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function RegExpTester() {
    const [regexStr, setRegexStr] = useState('');
    const [flags, setFlags] = useState('gm');
    const [text, setText] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        runRegex();
    }, [regexStr, flags, text]);

    const runRegex = () => {
        if (!regexStr) {
            setOutput('No regular expression provided.');
            setError('');
            return;
        }
        try {
            const re = new RegExp(regexStr, flags);
            const matches = Array.from(text.matchAll(re));
            
            if (matches.length === 0) {
                setOutput('No matches found.');
            } else {
                const matchDetails = matches.map((match, i) => {
                    let detail = `Match ${i + 1}: "${match[0]}"\nIndex: ${match.index}`;
                    if (match.groups) {
                        const groupEntries = Object.entries(match.groups);
                        if (groupEntries.length > 0) {
                            detail += '\nGroups:\n' + groupEntries.map(([key, value]) => `  ${key}: "${value}"`).join('\n');
                        }
                    }
                    // Add capturing groups if they exist but are not named
                    if (match.length > 1) {
                        const unnamedGroups = match.slice(1).filter((g, idx) => !Object.values(match.groups || {}).includes(g));
                        if (unnamedGroups.length > 0) {
                             detail += '\nUnnamed Groups:\n' + unnamedGroups.map((g, gi) => `  ${gi + 1}: "${g}"`).join('\n');
                        }
                    }
                    return detail;
                }).join('\n\n');
                setOutput(`Found ${matches.length} match(es):\n\n${matchDetails}`);
            }
            setError('');
        } catch (e) {
            setError(e.message);
            setOutput('');
        }
    };

    return (
        <div className="tool-container">
            <ToolHeader title="RegExp Tester" description="Test Regular Expressions against text." />

            <ToolControls>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <span style={{ color: 'var(--cds-text-secondary)', marginRight: '0.5rem' }}>/</span>
                    <TextInput
                        id="regex-input"
                        labelText=""
                        value={regexStr}
                        onChange={(e) => setRegexStr(e.target.value)}
                        placeholder="Regular Expression..."
                        style={{ flex: 1 }}
                    />
                    <span style={{ color: 'var(--cds-text-secondary)', marginLeft: '0.5rem', marginRight: '0.5rem' }}>/</span>
                    <TextInput
                        id="flags-input"
                        labelText=""
                        value={flags}
                        onChange={(e) => setFlags(e.target.value)}
                        placeholder="flags"
                        style={{ width: '80px' }}
                    />
                </div>
            </ToolControls>
            
            {error && <div style={{ color: 'var(--cds-support-error)', marginBottom: '1rem' }}>{error}</div>}

            <ToolSplitPane>
                <ToolPane
                    label="Test String"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the text to test against..."
                />
                <ToolPane
                    label={`Matches`}
                    value={output}
                    readOnly
                    placeholder="Matching results will appear here."
                />
            </ToolSplitPane>
        </div>
    );
}
