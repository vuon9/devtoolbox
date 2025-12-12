import React, { useState } from 'react';

export default function StringCaseConverter() {
    const [input, setInput] = useState('');

    const toCamel = (str) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '').replace(/[-_]/g, '');
    const toSnake = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/\s+/g, '_').toLowerCase().replace(/^_/, '');
    const toKebab = (str) => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/\s+/g, '-').toLowerCase().replace(/^-/, '');
    const toPascal = (str) => str.replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()).replace(/\s+/g, '').replace(/[-_]/g, '');
    const toUpper = (str) => str.toUpperCase();
    const toLower = (str) => str.toLowerCase();

    // The above regexes are simplistic. Better handling involves splitting by potential delimiters then joining.
    // Enhanced split:
    const splitWords = (str) => str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').split(/\s+/).filter(x => x);

    const convert = (type) => {
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
            case 'upper': return input.toUpperCase();
            case 'lower': return input.toLowerCase();
            case 'constant': return words.map(w => w.toUpperCase()).join('_');
            default: return input;
        }
    };

    return (
        <div className="tool-container">
            <div className="tool-header">
                <h2 className="tool-title">String Case Converter</h2>
                <p className="tool-desc">Convert string between different cases.</p>
            </div>

            <div className="split-pane">
                <div className="pane">
                    <div className="pane-header"><span className="pane-label">Input</span></div>
                    <textarea className="code-editor" value={input} onChange={(e) => setInput(e.target.value)} />
                </div>
                <div className="pane" style={{ overflowY: 'auto' }}>
                    <CaseResult label="camelCase" value={convert('camel')} />
                    <CaseResult label="snake_case" value={convert('snake')} />
                    <CaseResult label="kebab-case" value={convert('kebab')} />
                    <CaseResult label="PascalCase" value={convert('pascal')} />
                    <CaseResult label="CONSTANT_CASE" value={convert('constant')} />
                    <CaseResult label="UPPER CASE" value={convert('upper')} />
                    <CaseResult label="lower case" value={convert('lower')} />
                </div>
            </div>
        </div>
    );
}

function CaseResult({ label, value }) {
    return (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{label}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input className="code-editor" style={{ height: '40px' }} readOnly value={value} />
                <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(value)}>Copy</button>
            </div>
        </div>
    );
}
