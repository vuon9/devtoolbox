import React, { useState, useEffect } from 'react';
import { TextArea, TextInput, Tile } from '@carbon/react';

export default function JwtDebugger() {
    const [token, setToken] = useState('');
    const [header, setHeader] = useState({});
    const [payload, setPayload] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setHeader({});
            setPayload({});
            setError('');
            return;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            setError('Invalid JWT structure (must have 3 parts)');
            return;
        }

        try {
            const decode = (str) => JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
            setHeader(decode(parts[0]));
            setPayload(decode(parts[1]));
            setError('');
        } catch (e) {
            setError('Failed to decode base64url sections');
        }
    }, [token]);

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">JWT Debugger</h2>
                <p className="tool-desc">Decode JSON Web Tokens.</p>
            </div>

            <div className="split-pane">
                <div className="pane">
                    <TextArea
                        labelText="Encoded Token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        rows={10}
                        style={{ fontFamily: 'monospace', color: 'var(--cds-text-primary)' }}
                    />
                    {error && <div style={{ color: 'var(--cds-support-error)', marginTop: '1rem' }}>{error}</div>}
                </div>

                <div className="pane" style={{ gap: '1rem' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>HEADER</p>
                        <TextArea
                            value={JSON.stringify(header, null, 2)}
                            readOnly
                            rows={5}
                            style={{ fontFamily: 'monospace', minHeight: '100px' }}
                        />
                    </div>
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>PAYLOAD</p>
                        <TextArea
                            value={JSON.stringify(payload, null, 2)}
                            readOnly
                            rows={15}
                            style={{ fontFamily: 'monospace', height: '100%' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
