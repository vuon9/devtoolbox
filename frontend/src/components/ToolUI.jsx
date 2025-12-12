import React from 'react';
import { TextArea, Button } from '@carbon/react';
import { Copy } from '@carbon/icons-react';

export function ToolHeader({ title, description }) {
    return (
        <div className="tool-header">
            <h2 className="tool-title">{title}</h2>
            <p className="tool-desc">{description}</p>
        </div>
    );
}

export function ToolControls({ children, style = {} }) {
    return (
        <div className="controls" style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
            padding: 0,
            border: 'none',
            background: 'transparent',
            ...style
        }}>
            {children}
        </div>
    );
}

export function ToolPane({ label, value, onChange, readOnly, placeholder, onCopy, ...props }) {
    const handleCopy = () => {
        if (onCopy) {
            onCopy();
        } else if (value) {
            navigator.clipboard.writeText(value);
        }
    };

    return (
        <div className="pane" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            flex: 1
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                minHeight: '30px'
            }}>
                <label style={{
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    lineHeight: 1.5,
                    letterSpacing: '0.32px',
                    color: 'var(--cds-text-secondary)',
                    textTransform: 'uppercase'
                }}>
                    {label}
                </label>
                <Button
                    hasIconOnly
                    renderIcon={Copy}
                    kind="ghost"
                    size="sm"
                    iconDescription="Copy to clipboard"
                    tooltipPosition="left"
                    onClick={handleCopy}
                    disabled={!value}
                />
            </div>
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <TextArea
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    placeholder={placeholder}
                    rows={10}
                    style={{
                        height: '100%',
                        resize: 'none',
                        fontFamily: "'IBM Plex Mono', monospace",
                        border: '1px solid var(--cds-border-strong)',
                    }}
                    labelText=""
                    {...props}
                />
            </div>
        </div>
    );
}

export function ToolSplitPane({ children, columnCount = 2 }) {
    const gridColumns = columnCount === 1 ? '1fr' : `repeat(${columnCount}, 1fr)`;
    return (
        <div className="split-pane" style={{
            display: 'grid',
            gridTemplateColumns: gridColumns,
            gap: '16px',
            flex: 1,
            minHeight: 0
        }}>
            {children}
        </div>
    );
}
