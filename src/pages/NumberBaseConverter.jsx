import React, { useState, useCallback } from 'react';
import { TextInput } from '@carbon/react';
import { ToolHeader } from '../components/ToolUI';

const NumberBaseConverter = () => {
    const [values, setValues] = useState({ dec: '', hex: '', oct: '', bin: '' });
    const [error, setError] = useState('');

    const reset = () => setValues({ dec: '', hex: '', oct: '', bin: '' });

    const handleConversion = useCallback((inputValue, fromBase) => {
        if (inputValue.trim() === '') {
            reset();
            setError('');
            return;
        }

        let num;
        switch (fromBase) {
            case 'dec': num = parseInt(inputValue, 10); break;
            case 'hex': num = parseInt(inputValue, 16); break;
            case 'oct': num = parseInt(inputValue, 8); break;
            case 'bin': num = parseInt(inputValue, 2); break;
            default: return;
        }

        if (isNaN(num) || num < 0) {
            setError(`Invalid ${fromBase} input`);
            const newValues = { ...values, [fromBase]: inputValue };
            setValues(newValues);
            return;
        }
        
        setError('');
        setValues({
            dec: num.toString(10),
            hex: num.toString(16).toUpperCase(),
            oct: num.toString(8),
            bin: num.toString(2),
        });
    }, []);

    return (
        <div className="tool-container">
            <ToolHeader title="Number Base Converter" description="Convert numbers between Decimal, Hexadecimal, Octal, and Binary." />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
                <TextInput
                    id="dec-input"
                    labelText="Decimal"
                    value={values.dec}
                    onChange={(e) => handleConversion(e.target.value, 'dec')}
                    invalid={error.includes('dec')}
                    invalidText={error}
                />
                <TextInput
                    id="hex-input"
                    labelText="Hexadecimal"
                    value={values.hex}
                    onChange={(e) => handleConversion(e.target.value, 'hex')}
                    invalid={error.includes('hex')}
                    invalidText={error}
                />
                <TextInput
                    id="oct-input"
                    labelText="Octal"
                    value={values.oct}
                    onChange={(e) => handleConversion(e.target.value, 'oct')}
                    invalid={error.includes('oct')}
                    invalidText={error}
                />
                <TextInput
                    id="bin-input"
                    labelText="Binary"
                    value={values.bin}
                    onChange={(e) => handleConversion(e.target.value, 'bin')}
                    invalid={error.includes('bin')}
                    invalidText={error}
                />
            </div>
        </div>
    );
};

export default NumberBaseConverter;
