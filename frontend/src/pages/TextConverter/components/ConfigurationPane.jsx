import React, { useState } from 'react';
import { TextInput, IconButton } from '@carbon/react';
import { View, ViewOff } from '@carbon/icons-react';

export default function ConfigurationPane({ config, updateConfig }) {
    const [showKey, setShowKey] = useState(false);

    return (
        <div style={{
            display: 'flex',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'var(--cds-layer)',
            border: '1px solid var(--cds-border-subtle)',
            marginBottom: '0.5rem',
            flexWrap: 'wrap'
        }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                <TextInput
                    id="config-key"
                    labelText="Secret Key"
                    placeholder="Enter key (e.g. 32 chars for AES-256)"
                    type={showKey ? 'text' : 'password'}
                    value={config.key}
                    onChange={(e) => updateConfig({ key: e.target.value })}
                />
                <div style={{ position: 'absolute', right: '0', top: '24px' }}>
                    <IconButton
                        kind="ghost"
                        size="md"
                        onClick={() => setShowKey(!showKey)}
                        label={showKey ? "Hide key" : "Show key"}
                        align="bottom"
                    >
                        {showKey ? <ViewOff /> : <View />}
                    </IconButton>
                </div>
            </div>

            <div style={{ flex: 1, minWidth: '250px' }}>
                <TextInput
                    id="config-iv"
                    labelText="IV (Initialization Vector)"
                    placeholder="Enter IV (e.g. 16 chars for AES-CBC)"
                    value={config.iv}
                    onChange={(e) => updateConfig({ iv: e.target.value })}
                />
            </div>
        </div>
    );
}
