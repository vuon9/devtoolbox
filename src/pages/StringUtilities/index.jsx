import React, { useState, useEffect } from 'react';
import { ToolHeader } from '../../components/ToolUI';
import useLayoutToggle from '../../hooks/useLayoutToggle';
import ToolLayoutToggle from '../../components/layout/ToolLayoutToggle';
import ModeTabBar from './components/ModeTabBar';
import SortDedupePane from './components/SortDedupePane';
import CaseConverterPane from './components/CaseConverterPane';
import InspectorPane from './components/InspectorPane';
import {
    TOOL_TITLE,
    TOOL_DESCRIPTION,
    STORAGE_KEYS,
    DEFAULTS
} from './strings';

export default function StringUtilities() {
    const [activeTab, setActiveTab] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
        return saved ? parseInt(saved, 10) : DEFAULTS.ACTIVE_TAB;
    });

    const [input, setInput] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.INPUT) || '';
    });

    const layout = useLayoutToggle({
        toolKey: 'string-utilities-layout',
        defaultDirection: 'horizontal',
        showToggle: true,
        persist: true
    });

    // Persist state
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab.toString());
    }, [activeTab]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.INPUT, input);
    }, [input]);

    const renderPane = () => {
        switch (activeTab) {
            case 0:
                return (
                    <SortDedupePane
                        input={input}
                        setInput={setInput}
                        layout={layout}
                    />
                );
            case 1:
                return (
                    <CaseConverterPane
                        input={input}
                        setInput={setInput}
                        layout={layout}
                    />
                );
            case 2:
                return (
                    <InspectorPane
                        input={input}
                        setInput={setInput}
                        layout={layout}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <ToolHeader
                    title={TOOL_TITLE}
                    description={TOOL_DESCRIPTION}
                />
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <ModeTabBar
                    activeMode={activeTab}
                    onChange={setActiveTab}
                />
                {layout.showToggle && (
                    <ToolLayoutToggle
                        direction={layout.direction}
                        onToggle={layout.toggleDirection}
                        position="controls"
                        style={{ marginLeft: 'auto' }}
                    />
                )}
            </div>

            {renderPane()}
        </div>
    );
}
