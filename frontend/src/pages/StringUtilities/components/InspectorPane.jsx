import React, { useState, useEffect } from 'react';

export default function InspectorPane({ input, setInput, stats }) {
  const items = [
    { label: 'Characters', value: stats.chars },
    { label: 'Words', value: stats.words },
    { label: 'Lines', value: stats.lines },
    { label: 'Bytes (UTF-8)', value: stats.bytes },
    { label: 'Sentences', value: stats.sentences },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '30px',
            marginBottom: '8px',
          }}
        >
          <label
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Input Text
          </label>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to analyze..."
          style={{
            flex: 1,
            width: '100%',
            padding: '12px',
            fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
            fontSize: '14px',
            lineHeight: 1.5,
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '8px',
            color: '#f4f4f5',
            resize: 'none',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '30px',
            marginBottom: '8px',
          }}
        >
          <label
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Statistics
          </label>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            backgroundColor: '#1c1917',
            border: '1px solid #27272a',
            borderRadius: '8px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: '#18181b',
                  borderRadius: '6px',
                }}
              >
                <span style={{ color: '#71717a', fontSize: '14px' }}>{item.label}</span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#f4f4f5',
                    fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
                  }}
                >
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
