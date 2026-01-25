import React, { useState } from 'react';
import { marked } from 'marked';
import { ToolHeader, ToolPane, ToolSplitPane } from '../components/ToolUI';

const MarkdownPreviewStyles = () => (
    <style>{`
        .md-preview h1, .md-preview h2, .md-preview h3 { 
            border-bottom: 1px solid var(--cds-border-subtle); 
            padding-bottom: 0.3em; 
            margin-bottom: 16px; 
            margin-top: 24px; 
            color: var(--cds-text-primary); 
        }
        .md-preview h1 { margin-top: 0; }
        .md-preview p { margin-bottom: 16px; }
        .md-preview pre { 
            background-color: var(--cds-layer-01); 
            padding: 16px; 
            border-radius: 6px; 
            overflow: auto; 
            margin-bottom: 16px; 
        }
        .md-preview code { 
            color: var(--cds-text-primary); 
            background-color: var(--cds-layer-selected); 
            padding: 0.2em 0.4em; 
            border-radius: 6px; 
            font-family: 'IBM Plex Mono', monospace; 
            font-size: 85%; 
        }
        .md-preview pre code { 
            background-color: transparent; 
            padding: 0; 
            font-size: 100%; 
        }
        .md-preview a { 
            color: var(--cds-link-primary); 
            text-decoration: none; 
        }
        .md-preview a:hover { text-decoration: underline; }
        .md-preview blockquote { 
            border-left: 4px solid var(--cds-border-strong); 
            color: var(--cds-text-secondary); 
            padding: 0 1em; 
            margin: 0 0 16px 0; 
        }
        .md-preview ul, .md-preview ol { 
            padding-left: 2em; 
            margin-bottom: 16px; 
        }
    `}</style>
);


export default function MarkdownPreview() {
    const [markdown, setMarkdown] = useState('# Hello World\n\nThis is a **markdown** preview.\n\n- List item 1\n- List item 2\n\n```js\nconsole.log("Code block");\n```');

    return (
        <div className="tool-container">
            <ToolHeader title="Markdown Preview" description="Preview GitHub Flavored Markdown in real-time." />
            <MarkdownPreviewStyles />

            <ToolSplitPane>
                <ToolPane
                    label="Markdown Input"
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
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
                            Preview
                        </label>
                    </div>
                    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <div
                            className="md-preview"
                            style={{
                                overflowY: 'auto',
                                height: '100%',
                                border: '1px solid var(--cds-border-strong)',
                                padding: '1rem',
                                borderRadius: '0'
                            }}
                            dangerouslySetInnerHTML={{ __html: marked(markdown) }}
                        />
                    </div>
                </div>
            </ToolSplitPane>
        </div>
    );
}
