import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@carbon/react';
import { ArrowsHorizontal } from '@carbon/icons-react';
import { ToolHeader, ToolPane, ToolSplitPane } from '../../components/ToolUI';
import useLayoutToggle from '../../hooks/useLayoutToggle';
import { Backend } from '../../utils/backendBridge';
import ConversionControls from './components/ConversionControls';
import ConfigurationPane from './components/ConfigurationPane';
import MultiHashOutput from './components/MultiHashOutput';
import CommonTags from './components/CommonTags';
import ImageOutput, { isBase64Image } from './components/ImageOutput';
import { CONVERTER_MAP } from './constants';

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

    // Check if showing all hashes
    const isAllHashes = category === 'Hash' && method === 'All';

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

        // For All Hashes, we compute even with empty input (show empty results)
        if (!text && cat === 'Hash' && meth === 'All') {
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
    const showConfig = category === 'Encrypt - Decrypt' || method === 'HMAC';

    // Check if output is a base64 image
    const isImageOutput = !isAllHashes && isBase64Image(output);

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            <ToolHeader
                title="Text Based Converter"
                description="Universal converter for various data formats and string transformations."
            />

            <CommonTags
                currentCategory={category}
                currentMethod={method}
                onTagSelect={(cat, meth) => {
                    setCategory(cat);
                    setMethod(meth);
                }}
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
                isAllHashes={isAllHashes}
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

                {isAllHashes ? (
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
                                Output
                            </label>
                        </div>
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '0.75rem',
                            backgroundColor: 'var(--cds-layer)',
                        }}>
                            <MultiHashOutput
                                value={output}
                                error={error}
                            />
                        </div>
                    </div>
                ) : isImageOutput ? (
                    <div className="pane" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        minHeight: 0,
                        flex: 1
                    }}>
                        <ImageOutput value={output} />
                    </div>
                ) : (
                    <ToolPane
                        label="Output"
                        value={output}
                        readOnly
                        placeholder="Result will appear here..."
                        invalid={!!error}
                        invalidText={error}
                    />
                )}
            </ToolSplitPane>
        </div>
    );
}
