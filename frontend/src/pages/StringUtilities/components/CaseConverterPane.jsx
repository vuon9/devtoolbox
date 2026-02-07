import React from 'react';
import { Button } from '@carbon/react';
import { Copy } from '@carbon/icons-react';
import { ToolPane, ToolSplitPane } from '../../../components/ToolUI';

const cases = [
    { id: 'camel', label: 'camelCase' },
    { id: 'snake', label: 'snake_case' },
    { id: 'kebab', label: 'kebab-case' },
    { id: 'pascal', label: 'PascalCase' },
    { id: 'constant', label: 'CONSTANT_CASE' },
    { id: 'upper', label: 'UPPER CASE' },
    { id: 'lower', label: 'lower case' },
];

const splitWords = (str) => {
    if (!str) return [];
    return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').split(/\s+/).filter(x => x);
};

const convertCase = (input, type) => {
    if (!input) return '';
    
    const words = splitWords(input);
    if (words.length === 0) return '';

    switch (type) {
        case 'camel':
            return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        case 'snake':
            return words.map(w => w.toLowerCase()).join('_');
        case 'kebab':
            return words.map(w => w.toLowerCase()).join('-');
        case 'pascal':
            return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        case 'constant':
            return words.map(w => w.toUpperCase()).join('_');
        case 'upper':
            return input.toUpperCase();
        case 'lower':
            return input.toLowerCase();
        default:
            return input;
    }
};

function CaseResult({ label, value }) {
    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            padding: '0.75rem',
            backgroundColor: 'var(--cds-layer)',
            borderRadius: '4px',
            marginBottom: '0.5rem'
        }}>
            <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--cds-text-secondary)',
                minWidth: '120px',
                fontWeight: 600
            }}>
                {label}
            </div>
            <div style={{ 
                flex: 1,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.875rem',
                color: 'var(--cds-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}>
                {value || '<empty>'}
            </div>
            <Button
                hasIconOnly
                renderIcon={Copy}
                kind="ghost"
                size="sm"
                iconDescription="Copy"
                tooltipPosition="left"
                onClick={() => navigator.clipboard.writeText(value)}
                disabled={!value}
            />
        </div>
    );
}

export default function CaseConverterPane({ input, setInput, layout }) {
    return (
        <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
            <ToolPane
                label="Input Text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to convert..."
            />
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
                    minHeight: '30px',
                    marginBottom: '0.5rem'
                }}>
                    <label style={{
                        fontSize: '0.75rem',
                        fontWeight: 400,
                        lineHeight: 1.5,
                        letterSpacing: '0.32px',
                        color: 'var(--cds-text-secondary)',
                        textTransform: 'uppercase'
                    }}>
                        Case Conversions
                    </label>
                </div>
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0.5rem',
                    backgroundColor: 'var(--cds-layer)',
                    border: '1px solid var(--cds-border-strong)',
                }}>
                    {cases.map((caseItem) => (
                        <CaseResult
                            key={caseItem.id}
                            label={caseItem.label}
                            value={convertCase(input, caseItem.id)}
                        />
                    ))}
                </div>
            </div>
        </ToolSplitPane>
    );
}
