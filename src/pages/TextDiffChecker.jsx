import React, { useState } from 'react';
import * as Diff from 'diff';
import { Button } from '@carbon/react';
import { Compare } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

const DiffView = ({ diffs }) => (
    <div className="pane" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '200px',
        flex: 1
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            minHeight: '24px'
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
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                overflowY: 'auto',
                height: '100%',
                border: '1px solid var(--cds-border-strong)',
                padding: '0.5rem',
                backgroundColor: 'var(--cds-layer)',
                color: 'var(--cds-text-primary)',
                whiteSpace: 'pre-wrap',
                fontFamily: "'IBM Plex Mono', monospace"
            }}>
                {diffs.length === 0 
                    ? <span style={{color: 'var(--cds-text-secondary)'}}>No differences</span>
                    : diffs.map((part, index) => {
                        const style = {
                            backgroundColor: part.added ? 'var(--cds-support-success-inversed)' : part.removed ? 'var(--cds-support-error-inversed)' : 'transparent',
                            color: part.added ? 'var(--cds-text-on-color)' : part.removed ? 'var(--cds-text-on-color)' : 'inherit',
                        };
                        const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
                        return (
                            <span key={index} style={style}>
                                <span style={{userSelect: 'none'}}>{prefix}</span>
                                {part.value}
                            </span>
                        );
                })}
            </div>
        </div>
    </div>
);

export default function TextDiffChecker() {
    const [oldText, setOldText] = useState('');
    const [newText, setNewText] = useState('');
    const [diffs, setDiffs] = useState([]);

    const compare = () => {
        const d = Diff.diffLines(oldText, newText, { newlineIsToken: true });
        setDiffs(d);
    };

    return (
        <div className="tool-container">
            <ToolHeader title="Text Diff Checker" description="Compare two blocks of text to find the differences." />

            <ToolControls>
                <Button onClick={compare} renderIcon={Compare}>Compare</Button>
            </ToolControls>

            <ToolSplitPane>
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

            <div style={{ marginTop: '1rem' }}>
                <DiffView diffs={diffs} />
            </div>
        </div>
    );
}
