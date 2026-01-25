import React, { useState, useEffect } from 'react';
import { TextInput } from '@carbon/react';
import { ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function UrlParser() {
    const [url, setUrl] = useState('');
    const [parsed, setParsed] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!url) {
            setParsed(null);
            setError('');
            return;
        }
        try {
            const u = new URL(url);
            const params = {};
            u.searchParams.forEach((v, k) => params[k] = v);

            setParsed({
                protocol: u.protocol,
                host: u.host,
                hostname: u.hostname,
                port: u.port,
                pathname: u.pathname,
                search: u.search,
                hash: u.hash,
                origin: u.origin,
                params: params
            });
            setError('');
        } catch (e) {
            setParsed(null);
            setError('Invalid URL provided.');
        }
    }, [url]);

    const getFullJson = () => {
        if (!parsed) return '';
        return JSON.stringify({
            ...parsed,
            params: undefined, // remove duplicate
            queryParams: parsed.params,
        }, null, 2);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <ToolPane
                label="Input URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/path?query=1"
            />

            {error && <div style={{ color: 'var(--cds-support-error)', textAlign: 'center' }}>{error}</div>}
            
            {parsed && (
                <ToolSplitPane>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', flex: 2 }}>
                        <TextInput labelText="Protocol" value={parsed.protocol} readOnly />
                        <TextInput labelText="Hostname" value={parsed.hostname} readOnly />
                        <TextInput labelText="Port" value={parsed.port || '(default)'} readOnly />
                        <TextInput labelText="Pathname" value={parsed.pathname} readOnly />
                        <TextInput labelText="Search" value={parsed.search} readOnly />
                        <TextInput labelText="Hash" value={parsed.hash} readOnly />
                    </div>
                    <ToolPane
                        label="Query Parameters (JSON)"
                        value={JSON.stringify(parsed.params, null, 2)}
                        readOnly
                        onCopy={getFullJson}
                    />
                </ToolSplitPane>
            )}
        </div>
    );
}
