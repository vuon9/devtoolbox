import React, { useState } from 'react';
import * as Diff from 'diff';

export default function TextDiffChecker() {
    const [oldText, setOldText] = useState('');
    const [newText, setNewText] = useState('');
    const [diffs, setDiffs] = useState([]);

    const compare = () => {
        const d = Diff.diffLines(oldText, newText);
        setDiffs(d);
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">Text Diff Checker</h2>
                <p className="tool-desc">Compare two texts and find differences.</p>
            </div>

            <div className="controls">
                <button className="btn-primary" onClick={compare}>Compare</button>
            </div>

            <div className="split-pane" style={{ minHeight: '300px' }}>
                <div className="pane">
                    <div className="pane-header"><span className="pane-label">Original Text</span></div>
                    <textarea
                        className="code-editor"
                        value={oldText}
                        onChange={(e) => setOldText(e.target.value)}
                        placeholder="Paste original text..."
                    />
                </div>
                <div className="pane">
                    <div className="pane-header"><span className="pane-label">New Text</span></div>
                    <textarea
                        className="code-editor"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Paste new text..."
                    />
                </div>
            </div>

            <div className="pane" style={{ marginTop: '20px', flex: 1 }}>
                <div className="pane-header"><span className="pane-label">Differences</span></div>
                <div className="code-editor" style={{ overflowY: 'auto', backgroundColor: '#0d1117', color: '#c9d1d9' }}>
                    {diffs.map((part, index) => {
                        const style = {
                            backgroundColor: part.added ? 'rgba(46, 160, 67, 0.15)' : part.removed ? 'rgba(248, 81, 73, 0.15)' : 'transparent',
                            color: part.added ? '#e6ffec' : part.removed ? '#ffeadf' : 'inherit',
                            display: 'block',
                            width: '100%',
                            whiteSpace: 'pre-wrap'
                        };
                        const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
                        return (
                            <span key={index} style={style}>{prefix}{part.value}</span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
