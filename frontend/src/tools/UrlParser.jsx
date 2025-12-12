import React, { useState, useEffect } from 'react';
import { TextArea, TextInput, Button } from '@carbon/react'; // Clean Carbon imports for consistency
// Note: UrlParser is now often used inside a TabPanel, so we remove the container header if we want,
// or keep it generic. Since UrlTools has the header, we can simplify this or keep it standalone-capable.
// Let's keep it simple form.

export default function UrlParser() {
    const [url, setUrl] = useState('');
    const [parsed, setParsed] = useState(null);

    useEffect(() => {
        try {
            if (!url) {
                setParsed(null);
                return;
            }
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
        } catch (e) {
            setParsed(null);
        }
    }, [url]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <TextArea
                labelText="Input URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/path?query=1"
                rows={3}
            />

            {parsed ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', overflowY: 'auto' }}>
                    <TextInput labelText="Protocol" value={parsed.protocol} readOnly />
                    <TextInput labelText="Host" value={parsed.host} readOnly />
                    <TextInput labelText="Pathname" value={parsed.pathname} readOnly />
                    <TextInput labelText="Search" value={parsed.search} readOnly />
                    <TextInput labelText="Hash" value={parsed.hash} readOnly />
                    <TextInput labelText="Port" value={parsed.port || '(default)'} readOnly />

                    <div style={{ gridColumn: '1 / -1' }}>
                        <TextArea
                            labelText="Query Parameters (JSON)"
                            value={JSON.stringify(parsed.params, null, 2)}
                            readOnly
                            rows={8}
                        />
                    </div>
                </div>
            ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--cds-text-secondary)' }}>
                    {url ? 'Invalid URL' : 'Enter a URL to parse details'}
                </div>
            )}
        </div>
    );
}
