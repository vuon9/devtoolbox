import React, { useState, useCallback } from 'react';
import { TextInput, NumberInput, Dropdown, Button } from '@carbon/react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane } from '../../components/ToolUI';
import useLayoutToggle from '../../hooks/useLayoutToggle';
import { Copy } from '@carbon/icons-react';

const PREDEFINED_BASES = [
    { id: 'bin', label: 'Binary', base: 2 },
    { id: 'oct', label: 'Octal', base: 8 },
    { id: 'dec', label: 'Decimal', base: 10 },
    { id: 'hex', label: 'Hexadecimal', base: 16 },
];

// Generate options for bases 2-36
const BASE_OPTIONS = Array.from({ length: 35 }, (_, i) => ({
    id: `${i + 2}`,
    label: `Base ${i + 2}`,
    value: i + 2
}));

const NumberConverter = () => {
    const [values, setValues] = useState({ dec: '', hex: '', oct: '', bin: '', custom: '' });
    const [error, setError] = useState('');
    const [activeInput, setActiveInput] = useState('dec');
    const [customBase, setCustomBase] = useState(36);

    const layout = useLayoutToggle({
        toolKey: 'number-converter-layout',
        defaultDirection: 'horizontal',
        showToggle: true,
        persist: true
    });

    const reset = () => setValues({ dec: '', hex: '', oct: '', bin: '', custom: '' });

    const convertToBase = (num, base) => {
        if (isNaN(num) || num === '') return '';
        try {
            return num.toString(base).toUpperCase();
        } catch (e) {
            return 'Error';
        }
    };

    const handleConversion = useCallback((inputValue, fromBase) => {
        setActiveInput(fromBase);
        
        if (inputValue.trim() === '') {
            reset();
            setError('');
            return;
        }

        let num;
        const base = fromBase === 'custom' ? customBase : PREDEFINED_BASES.find(b => b.id === fromBase)?.base;
        
        try {
            num = parseInt(inputValue, base);
        } catch (e) {
            setError(`Invalid input for base ${base}`);
            setValues({ ...values, [fromBase]: inputValue });
            return;
        }

        if (isNaN(num)) {
            setError(`Invalid ${fromBase} input`);
            setValues({ ...values, [fromBase]: inputValue });
            return;
        }
        
        setError('');
        setValues({
            dec: convertToBase(num, 10),
            hex: convertToBase(num, 16),
            oct: convertToBase(num, 8),
            bin: convertToBase(num, 2),
            custom: convertToBase(num, customBase),
        });
    }, [customBase, values]);

    const copyToClipboard = (text) => {
        if (text) navigator.clipboard.writeText(text);
    };

    const renderBasePane = (base, label, placeholder, baseNum, showDropdown = false) => {
        const isActive = activeInput === base;
        const value = values[base] || '';
        
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
                    minHeight: '30px',
                    marginBottom: '0.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            lineHeight: 1.5,
                            letterSpacing: '0.32px',
                            color: isActive ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)',
                            textTransform: 'uppercase'
                        }}>
                            {label}
                        </label>
                        {showDropdown && (
                            <Dropdown
                                id="custom-base-dropdown"
                                items={BASE_OPTIONS}
                                itemToString={(item) => item ? item.label : ''}
                                selectedItem={BASE_OPTIONS.find(opt => opt.value === customBase)}
                                onChange={({ selectedItem }) => {
                                    if (selectedItem) {
                                        setCustomBase(selectedItem.value);
                                        if (values.custom) {
                                            handleConversion(values.custom, 'custom');
                                        }
                                    }
                                }}
                                style={{ width: '140px' }}
                                size="sm"
                            />
                        )}
                        {baseNum && !showDropdown && (
                            <span style={{ 
                                fontSize: '0.65rem', 
                                color: 'var(--cds-text-secondary)',
                                fontWeight: 400
                            }}>
                                (Base {baseNum})
                            </span>
                        )}
                    </div>
                    {isActive && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--cds-text-secondary)' }}>
                            Active
                        </span>
                    )}
                </div>
                <div style={{ flex: 1, position: 'relative', display: 'flex', gap: '0.5rem' }}>
                    <TextInput
                        id={`${base}-input`}
                        value={value}
                        onChange={(e) => handleConversion(e.target.value, base)}
                        placeholder={placeholder}
                        invalid={error.includes(base)}
                        style={{
                            flex: 1,
                            fontFamily: "'IBM Plex Mono', monospace",
                        }}
                    />
                    <Button
                        hasIconOnly
                        renderIcon={Copy}
                        kind="ghost"
                        size="sm"
                        iconDescription="Copy"
                        onClick={() => copyToClipboard(value)}
                        disabled={!value}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            <ToolHeader 
                title="Number Converter" 
                description="Convert numbers between different bases. Type in any field to convert to all others." 
            />
            
            {error && (
                <div style={{ 
                    color: 'var(--cds-support-error)', 
                    padding: '0.5rem',
                    backgroundColor: 'var(--cds-support-error-inverse)',
                    borderRadius: '4px'
                }}>
                    {error}
                </div>
            )}
            
            <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {renderBasePane('dec', 'Decimal', 'Enter decimal number...', 10)}
                    {renderBasePane('hex', 'Hexadecimal', 'Enter hex number...', 16)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {renderBasePane('oct', 'Octal', 'Enter octal number...', 8)}
                    {renderBasePane('bin', 'Binary', 'Enter binary number...', 2)}
                </div>
            </ToolSplitPane>

            <div style={{ marginTop: '1rem' }}>
                {renderBasePane('custom', 'Custom', `Enter base ${customBase} number...`, customBase, true)}
            </div>
        </div>
    );
};

export default NumberConverter;
