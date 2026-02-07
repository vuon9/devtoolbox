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
import {
    TOOL_TITLE,
    TOOL_DESCRIPTION,
    STORAGE_KEYS,
    DEFAULTS,
    DEFAULT_COMMON_TAGS,
    LABELS,
    PLACEHOLDERS,
    LAYOUT
} from './strings';

export default function TextBasedConverter() {
    // Persistent state initialization
    const [category, setCategory] = useState(() => localStorage.getItem(STORAGE_KEYS.CATEGORY) || DEFAULTS.CATEGORY);
    const [method, setMethod] = useState(() => localStorage.getItem(STORAGE_KEYS.METHOD) || DEFAULTS.METHOD);
    const [subMode, setSubMode] = useState(() => localStorage.getItem(STORAGE_KEYS.SUBMODE) || DEFAULTS.SUBMODE);

    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    // Custom tags state with localStorage persistence
    const [customTags, setCustomTags] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_TAGS)) || [];
        } catch {
            return [];
        }
    });

    // Config state
    const [config, setConfig] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG)) || DEFAULTS.CONFIG;
        } catch {
            return DEFAULTS.CONFIG;
        }
    });

    const layout = useLayoutToggle({
        toolKey: LAYOUT.TOOL_KEY,
        defaultDirection: LAYOUT.DEFAULT_DIRECTION,
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
        } else if (category === 'Escape' && !['Escape', 'Unescape'].includes(subMode)) {
            setSubMode('Escape');
        } else if (category === 'Hash' || category === 'Convert') {
            setSubMode('');
        }
    }, [category]);

    // Persistence effects
    useEffect(() => localStorage.setItem(STORAGE_KEYS.CATEGORY, category), [category]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.METHOD, method), [method]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.SUBMODE, subMode), [subMode]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config)), [config]);
    useEffect(() => localStorage.setItem(STORAGE_KEYS.CUSTOM_TAGS, JSON.stringify(customTags)), [customTags]);

    // Check if current selection is in quick actions
    const isCurrentInQuickActions = useCallback(() => {
        const isInDefault = DEFAULT_COMMON_TAGS.some(
            tag => tag.category === category && tag.method === method
        );
        const isInCustom = customTags.some(
            tag => tag.category === category && tag.method === method
        );
        return isInDefault || isInCustom;
    }, [category, method, customTags]);

    // Add current selection to quick actions
    const addCurrentToQuickActions = useCallback(() => {
        if (isCurrentInQuickActions()) return;
        
        const newTag = {
            id: `${category}-${method}`.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            category,
            method,
            label: `${category} - ${method}`
        };
        
        setCustomTags(prev => [...prev, newTag]);
    }, [category, method, isCurrentInQuickActions]);

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

        // If input is a data URI (base64 image), display it directly
        if (text && text.trim().startsWith('data:image/')) {
            setOutput(text.trim());
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
                title={TOOL_TITLE}
                description={TOOL_DESCRIPTION}
            />

            <CommonTags
                currentCategory={category}
                currentMethod={method}
                onTagSelect={(cat, meth) => {
                    setCategory(cat);
                    setMethod(meth);
                }}
                customTags={customTags}
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
                onAddQuickAction={addCurrentToQuickActions}
                isCurrentInQuickActions={isCurrentInQuickActions()}
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
                    label={LABELS.INPUT(category, subMode, method)}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={PLACEHOLDERS.INPUT}
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
                                {LABELS.OUTPUT}
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
                        label={LABELS.OUTPUT}
                        value={output}
                        readOnly
                        placeholder={PLACEHOLDERS.OUTPUT}
                        invalid={!!error}
                        invalidText={error}
                    />
                )}
            </ToolSplitPane>
        </div>
    );
}
