import React, { useState, useEffect } from 'react';
import * as Diff from 'diff';
import { Button, ContentSwitcher, Switch } from '@carbon/react';
import { Compare, Renew } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';
import useLayoutToggle from '../hooks/useLayoutToggle';

const DiffView = ({ diffs, mode }) => {
    const renderDiff = () => {
        if (diffs.length === 0) {
            return <span style={{color: 'var(--cds-text-secondary)'}}>No differences</span>;
        }

        return diffs.map((part, index) => {
            const isAdded = part.added;
            const isRemoved = part.removed;
            
            let style = {
                display: 'block',
                padding: '1px 4px',
                margin: '1px 0',
                borderRadius: '2px',
            };

            if (isAdded) {
                style = {
                    ...style,
                    backgroundColor: 'var(--cds-support-success-inverse)',
                    color: 'var(--cds-text-on-color)',
                };
            } else if (isRemoved) {
                style = {
                    ...style,
                    backgroundColor: 'var(--cds-support-error-inverse)',
                    color: 'var(--cds-text-on-color)',
                };
            }

            const prefix = isAdded ? '+ ' : isRemoved ? '- ' : '  ';
            
            return (
                <span key={index} style={style}>
                    <span style={{userSelect: 'none', opacity: 0.7}}>{prefix}</span>
                    {part.value}
                </span>
            );
        });
    };

    return (
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
                    Differences
                </label>
            </div>
            <div style={{ 
                flex: 1, 
                overflowY: 'auto',
                padding: '0.75rem',
                backgroundColor: 'var(--cds-layer)',
                border: '1px solid var(--cds-border-strong)',
                color: 'var(--cds-text-primary)',
                whiteSpace: 'pre-wrap',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.875rem',
                lineHeight: '1.5'
            }}>
                {renderDiff()}
            </div>
        </div>
    );
};

export default function TextDiffChecker() {
    const [oldText, setOldText] = useState('');
    const [newText, setNewText] = useState('');
    const [diffs, setDiffs] = useState([]);
    const [diffMode, setDiffMode] = useState(0); // 0 = lines, 1 = words, 2 = chars

    const layout = useLayoutToggle({
        toolKey: 'text-diff-layout',
        defaultDirection: 'horizontal',
        showToggle: true,
        persist: true
    });

    const compare = () => {
        let d;
        switch (diffMode) {
            case 0:
                d = Diff.diffLines(oldText, newText, { newlineIsToken: true });
                break;
            case 1:
                d = Diff.diffWords(oldText, newText);
                break;
            case 2:
                d = Diff.diffChars(oldText, newText);
                break;
            default:
                d = Diff.diffLines(oldText, newText, { newlineIsToken: true });
        }
        setDiffs(d);
    };

    const clearAll = () => {
        setOldText('');
        setNewText('');
        setDiffs([]);
    };

    // Auto-compare when inputs change
    useEffect(() => {
        if (oldText || newText) {
            compare();
        } else {
            setDiffs([]);
        }
    }, [oldText, newText, diffMode]);

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            <ToolHeader 
                title="Text Diff Checker" 
                description="Compare two blocks of text to find the differences." 
            />

            <ToolControls>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--cds-text-secondary)',
                            textTransform: 'uppercase'
                        }}>
                            Compare by:
                        </label>
                        <ContentSwitcher 
                            selectedIndex={diffMode}
                            onChange={({ index }) => setDiffMode(index)}
                            size="sm"
                            style={{ width: 'auto', minWidth: '150px' }}
                        >
                            <Switch name="lines" text="Lines" />
                            <Switch name="words" text="Words" />
                            <Switch name="chars" text="Chars" />
                        </ContentSwitcher>
                    </div>
                
                    <Button 
                        onClick={compare} 
                        renderIcon={Compare}
                        disabled={!oldText && !newText}
                    >
                        Compare
                    </Button>
                    
                    <Button 
                        onClick={clearAll}
                        renderIcon={Renew}
                        kind="secondary"
                        disabled={!oldText && !newText}
                    >
                        Clear
                    </Button>
                </div>
            </ToolControls>

            <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
                <ToolPane
                    label="Original Text"
                    value={oldText}
                    onChange={(e) => setOldText(e.target.value)}
                    placeholder="Paste original text..."
                />
                <ToolPane
                    label="New Text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Paste new text..."
                />
            </ToolSplitPane>

            <div style={{ flex: 1, minHeight: '200px', marginTop: '0.5rem' }}>
                <DiffView diffs={diffs} mode={diffMode} />
            </div>
        </div>
    );
}
