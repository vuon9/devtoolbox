import React, { useState } from 'react';

export default function HtmlPreview() {
    const [html, setHtml] = useState(`<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; padding: 20px; }
  h1 { color: #333; }
</style>
</head>
<body>
  <h1>Hello World</h1>
  <p>This is a preview.</p>
</body>
</html>`);

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">HTML Preview</h2>
                <p className="tool-desc">Real-time HTML/CSS preview.</p>
            </div>

            <div className="split-pane">
                <div className="pane">
                    <div className="pane-header"><span className="pane-label">HTML Input</span></div>
                    <textarea className="code-editor" value={html} onChange={(e) => setHtml(e.target.value)} />
                </div>
                <div className="pane">
                    <div className="pane-header"><span className="pane-label">Preview</span></div>
                    <iframe
                        srcDoc={html}
                        style={{ width: '100%', height: '100%', backgroundColor: 'white', border: 'none', borderRadius: '4px' }}
                        title="preview"
                    />
                </div>
            </div>
        </div>
    );
}
