import React, { useState } from 'react';
import { TextArea, TextInput, Button, ButtonSet } from '@carbon/react';
import { Copy, Script } from '@carbon/icons-react';

export default function HashGenerator() {
    const [input, setInput] = useState('');
    const [hashes, setHashes] = useState({
        sha256: '',
        sha384: '',
        sha512: ''
    });

    const generateHashes = async (text) => {
        setInput(text);
        if (!text) {
            setHashes({ sha256: '', sha384: '', sha512: '' });
            return;
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(text);

        const hashBuffer256 = await crypto.subtle.digest('SHA-256', data);
        const hashBuffer384 = await crypto.subtle.digest('SHA-384', data);
        const hashBuffer512 = await crypto.subtle.digest('SHA-512', data);

        setHashes({
            sha256: Array.from(new Uint8Array(hashBuffer256)).map(b => b.toString(16).padStart(2, '0')).join(''),
            sha384: Array.from(new Uint8Array(hashBuffer384)).map(b => b.toString(16).padStart(2, '0')).join(''),
            sha512: Array.from(new Uint8Array(hashBuffer512)).map(b => b.toString(16).padStart(2, '0')).join('')
        });
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">Hash Generator</h2>
                <p className="tool-desc">Generate SHA hashes.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', height: '100%', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <TextArea
                        labelText="Input Text"
                        placeholder="Text to hash..."
                        value={input}
                        onChange={(e) => generateHashes(e.target.value)}
                        rows={20}
                        style={{ height: '100%' }}
                    />
                </div>

                <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {['256', '384', '512'].map(algo => (
                        <div key={algo} style={{ position: 'relative' }}>
                            <TextInput
                                id={`sha${algo}`}
                                labelText={`SHA-${algo}`}
                                value={hashes[`sha${algo}`]}
                                readOnly
                            />
                            {hashes[`sha${algo}`] && (
                                <Button
                                    hasIconOnly
                                    renderIcon={Copy}
                                    kind="ghost"
                                    size="sm"
                                    iconDescription="Copy"
                                    tooltipAlignment="end"
                                    onClick={() => navigator.clipboard.writeText(hashes[`sha${algo}`])}
                                    style={{ position: 'absolute', top: '24px', right: '0' }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
