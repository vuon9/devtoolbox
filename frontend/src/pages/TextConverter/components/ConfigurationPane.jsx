import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function ConfigurationPane({ config, updateConfig }) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      {/* Secret Key */}
      <div style={{ flex: 1, minWidth: '250px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            color: '#71717a',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px',
          }}
        >
          Secret Key
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={showKey ? 'text' : 'password'}
            placeholder="Enter key (e.g. 32 chars for AES-256)"
            value={config.key}
            onChange={(e) => updateConfig({ key: e.target.value })}
            style={{
              width: '100%',
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '6px',
              padding: '8px 36px 8px 10px',
              color: '#f4f4f5',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            title={showKey ? 'Hide key' : 'Show key'}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* IV */}
      <div style={{ flex: 1, minWidth: '250px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            color: '#71717a',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px',
          }}
        >
          IV (Initialization Vector)
        </label>
        <input
          type="text"
          placeholder="Enter IV (e.g. 16 chars for AES-CBC)"
          value={config.iv}
          onChange={(e) => updateConfig({ iv: e.target.value })}
          style={{
            width: '100%',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '6px',
            padding: '8px 10px',
            color: '#f4f4f5',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '13px',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}
