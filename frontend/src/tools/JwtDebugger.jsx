import React, { useState, useEffect } from 'react';
import { ToolHeader, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function JwtDebugger() {
    const [token, setToken] = useState('');
    const [header, setHeader] = useState(null);
    const [payload, setPayload] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token.trim()) {
            setHeader(null);
            setPayload(null);
            setError('');
            return;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            setError('Invalid JWT structure: must have 3 parts separated by dots.');
            setHeader(null);
            setPayload(null);
            return;
        }

        try {
            const decode = (str) => JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
            setHeader(decode(parts[0]));
            setPayload(decode(parts[1]));
            setError('');
        } catch (e) {
            setError('Failed to decode Base64URL sections. Check if the token is valid.');
            setHeader(null);
            setPayload(null);
        }
    }, [token]);

    return (
        <div className="tool-container">
            <ToolHeader title="JWT Debugger" description="Decode and inspect JSON Web Tokens." />

            {error && <div style={{ color: 'var(--cds-support-error)', marginBottom: '1rem' }}>{error}</div>}

            <ToolSplitPane>
                <ToolPane
                    label="Encoded Token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your JWT here..."
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    <ToolPane
                        label="Header (JSON)"
                        value={header ? JSON.stringify(header, null, 2) : ''}
                        readOnly
                        style={{ minHeight: '120px', flex: '0 1 auto' }}
                    />
                    <ToolPane
                        label="Payload (JSON)"
                        value={payload ? JSON.stringify(payload, null, 2) : ''}
                        readOnly
                    />
                </div>
            </ToolSplitPane>
        </div>
    );
}
