import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@carbon/react';
import { QrCode } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../components/ToolUI';

export default function QrCodeGenerator() {
    const [input, setInput] = useState('');
    const [qrUrl, setQrUrl] = useState('');
    const [error, setError] = useState('');

    const generate = async () => {
        if (!input.trim()) { setQrUrl(''); return; }
        try {
            const url = await QRCode.toDataURL(input, { width: 300, margin: 2 });
            setQrUrl(url);
            setError('');
        } catch (e) {
            setError('Error generating QR Code');
        }
    };

    return (
        <div className="tool-container">
            <ToolHeader title="QR Code Generator" description="Generate QR codes from text or URLs." />

            <ToolSplitPane>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
                    <ToolPane
                        label="Content"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter text or URL here..."
                        style={{ flex: 1 }}
                    />
                    <div style={{ marginTop: '1rem' }}>
                        <ToolControls>
                            <Button onClick={generate} renderIcon={QrCode}>Generate</Button>
                        </ToolControls>
                    </div>
                </div>

                <div className="pane" style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--cds-layer-01)',
                    border: '1px solid var(--cds-border-strong)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}>
                    {qrUrl ? (
                        <div style={{ textAlign: 'center' }}>
                            <img src={qrUrl} alt="QR Code" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid white' }} />
                            <br />
                            <a href={qrUrl} download="qrcode.png" style={{ textDecoration: 'none' }}>
                                <Button kind="tertiary" style={{ marginTop: '20px' }}>Download PNG</Button>
                            </a>
                        </div>
                    ) : (
                        <span style={{ color: 'var(--cds-text-secondary)' }}>QR Code will appear here</span>
                    )}
                    {error && <div style={{ color: 'var(--cds-support-error)' }}>{error}</div>}
                </div>
            </ToolSplitPane>
        </div>
    );
}
