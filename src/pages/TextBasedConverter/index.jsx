import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@carbon/react';
import { ArrowsHorizontal } from '@carbon/icons-react';
import { ToolHeader, ToolPane, ToolSplitPane } from '../../components/ToolUI';
import useLayoutToggle from '../../hooks/useLayoutToggle';
import { Backend } from '../../utils/backendBridge';
import ConversionControls from './components/ConversionControls';
import ConfigurationPane from './components/ConfigurationPane';

export const CONVERTER_MAP = {
    'Encrypt - Decrypt': [
        'AES', 'DES', 'Triple DES', 'Rabbit', 'RC4', 'RC4Drop',
        'ChaCha20', 'Salsa20', 'Blowfish', 'Twofish', 'RSA',
        'Fernet', 'BIP38', 'XOR'
    ],
    'Encode - Decode': [
        'Base16 (Hex)', 'Base32', 'Base58', 'Base64', 'Base64URL',
        'Base85', 'URL', 'HTML Entities', 'Binary', 'Morse Code',
        'Punnycode', 'JWT Decode', 'Bencoded', 'Protobuf'
    ],
    'Convert': [
        'JSON ↔ YAML', 'JSON ↔ XML', 'JSON ↔ CSV / TSV', 'YAML ↔ TOML',
        'Markdown ↔ HTML', 'Unix Timestamp ↔ ISO 8601', 'Color Codes',
        'Number Bases', 'Case Swapping', 'SQL Insert ↔ JSON Array',
        'CURL Command ↔ Fetch', 'Cron Expression ↔ Text'
    ],
    'Hash': [
        'MD5', 'SHA-1', 'SHA-224', 'SHA-256', 'SHA-384', 'SHA-512',
        'SHA-3 (Keccak)', 'BLAKE2b', 'BLAKE3', 'RIPEMD-160',
        'bcrypt', 'scrypt', 'Argon2', 'HMAC', 'CRC32', 'Adler-32',
        'MurmurHash3'
    ],
};

export default function TextBasedConverter() {
    // Persistent state initialization
    const [category, setCategory] = useState(() => localStorage.getItem('tbc-category') || 'Encode - Decode');
    const [method, setMethod] = useState(() => localStorage.getItem('tbc-method') || 'Base64');
    const [subMode, setSubMode] = useState(() => localStorage.getItem('tbc-submode') || ''); // "Encrypt"/"Decrypt" or "Encode"/"Decode"

    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    // Config state
    const [config, setConfig] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('tbc-config')) || {
                key: '',
                iv: '',
                autoRun: true,
                caseSensitive: false
            };
        } catch {
            return { key: '', iv: '', autoRun: true, caseSensitive: false };
        }
    });

    const layout = useLayoutToggle({
        toolKey: 'text-based-converter-layout',
        defaultDirection: 'horizontal',
        showToggle: true,
        persist: true
    });

    // Submode default logic
    useEffect(() => {
        if (category === 'Encrypt - Decrypt' && !['Encrypt', 'Decrypt'].includes(subMode)) {
            setSubMode('Encrypt');
        } else if (category === 'Encode - Decode' && !['Encode', 'Decode'].includes(subMode)) {
            setSubMode('Encode');
        } else if (category === 'Hash' || category === 'Convert') {
            setSubMode('');
        }
    }, [category]);

    // Persistence effects
    useEffect(() => localStorage.setItem('tbc-category', category), [category]);
    useEffect(() => localStorage.setItem('tbc-method', method), [method]);
    useEffect(() => localStorage.setItem('tbc-submode', subMode), [subMode]);
    useEffect(() => localStorage.setItem('tbc-config', JSON.stringify(config)), [config]);

    const performConversion = useCallback(async (text, cat, meth, sub, cfg) => {
        if (!text && cat !== 'Hash') {
            setOutput('');
            setError('');
            return;
        }

        try {
            // Include subMode in backend request
            const backendConfig = { ...cfg, subMode: sub };
            const result = await Backend.ConversionService.Convert(text, cat, meth, backendConfig);
            setOutput(result);
            setError('');
        } catch (err) {
            setError(err.message);
            if (err.message.includes('error') || err.message.includes('invalid')) {
                setOutput('');
            }
        }
    }, []);

    // Auto-run trigger
    useEffect(() => {
        if (config.autoRun) {
            performConversion(input, category, method, subMode, config);
        }
    }, [input, category, method, subMode, config.autoRun, performConversion]);

    const handleConvert = () => {
        performConversion(input, category, method, subMode, config);
    };

    const updateConfig = (newCfg) => setConfig(prev => ({ ...prev, ...newCfg }));

    // Determine if Key/IV pane should be shown
    const showConfig = category === 'Encrypt - Decrypt';

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            <ToolHeader
                title="Text Based Converter"
                description="Universal converter for various data formats and string transformations."
            />

            <ConversionControls
                category={category}
                setCategory={(c) => { setCategory(c); setMethod(CONVERTER_MAP[c][0]); }}
                method={method}
                setMethod={setMethod}
                subMode={subMode}
                setSubMode={setSubMode}
                layout={layout}
                autoRun={config.autoRun}
                setAutoRun={(val) => updateConfig({ autoRun: val })}
                onConvert={handleConvert}
            />

            {showConfig && (
                <ConfigurationPane
                    config={config}
                    updateConfig={updateConfig}
                    method={method}
                />
            )}

            <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
                <ToolPane
                    label={`${category} (${subMode || method}) - Input`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter text here..."
                />


                <ToolPane
                    label="Output"
                    value={output}
                    readOnly
                    placeholder="Result will appear here..."
                    invalid={!!error}
                    invalidText={error}
                />
            </ToolSplitPane>
        </div>
    );
}
