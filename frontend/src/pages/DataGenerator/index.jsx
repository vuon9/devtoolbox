import React, { useEffect, useCallback } from 'react';
import { InlineNotification } from '@carbon/react';
import { ToolHeader, ToolControls, ToolPane, ToolSplitPane, ToolLayoutToggle } from '../../components/ToolUI';
import useLayoutToggle from '../../hooks/useLayoutToggle';
import { initialState, reducer } from './constants';
import GeneratorControls from './components/GeneratorControls';
import VariableControls from './components/VariableControls';
import HelpModal from './components/HelpModal';
import { DataGeneratorService } from '../../../bindings/devtoolbox/internal/wails';

export default function DataGenerator() {
    const [state, dispatch] = React.useReducer(reducer, initialState);

    const layout = useLayoutToggle({
        toolKey: 'data-generator-layout',
        defaultDirection: 'horizontal',
        showToggle: true,
        persist: true
    });

    // Load presets on mount
    useEffect(() => {
        const loadPresets = async () => {
            try {
                const response = await DataGeneratorService.GetPresets();
                console.log('GetPresets response:', response);

                const presets = response.presets || response;

                if (presets && Array.isArray(presets) && presets.length > 0) {
                    dispatch({ type: 'SET_PRESETS', payload: presets });

                    const defaultVars = {};
                    if (presets[0].variables && Array.isArray(presets[0].variables)) {
                        presets[0].variables.forEach(v => {
                            defaultVars[v.name] = v.default;
                        });
                    }

                    dispatch({
                        type: 'SELECT_PRESET',
                        payload: {
                            id: presets[0].id,
                            template: presets[0].template,
                            defaultVars
                        }
                    });
                } else {
                    console.warn('No presets found in response:', response);
                }
            } catch (err) {
                console.error('Failed to load presets:', err);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to load presets: ' + err.message });
            }
        };
        loadPresets();
    }, []);

    // Handle preset selection
    const handlePresetChange = useCallback(({ selectedItem }) => {
        const preset = state.presets.find(p => p.id === selectedItem);
        if (preset) {
            const defaultVars = {};
            preset.variables.forEach(v => {
                defaultVars[v.name] = v.default;
            });
            dispatch({
                type: 'SELECT_PRESET',
                payload: {
                    id: preset.id,
                    template: preset.template,
                    defaultVars
                }
            });
        }
    }, [state.presets]);

    // Handle variable change
    const handleVariableChange = useCallback((name, value) => {
        dispatch({ type: 'SET_VARIABLE', payload: { name, value } });
    }, []);

    // Generate data
    const handleGenerate = useCallback(async () => {
        dispatch({ type: 'SET_GENERATING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const request = {
                template: state.template,
                variables: state.variables,
                batchCount: state.mode === 'single' ? 1 : state.batchCount,
                outputFormat: state.outputFormat,
                separator: state.separator === 'custom' ? state.customSeparator : state.separator
            };

            const response = await DataGeneratorService.Generate(request);

            if (response.error) {
                dispatch({ type: 'SET_ERROR', payload: response.error });
            } else {
                dispatch({ type: 'SET_OUTPUT', payload: response.output });
                dispatch({ type: 'SET_DURATION', payload: response.durationMs });
            }
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.message });
        } finally {
            dispatch({ type: 'SET_GENERATING', payload: false });
        }
    }, [state.template, state.variables, state.mode, state.batchCount, state.outputFormat, state.separator, state.customSeparator]);

    // Get current preset
    const currentPreset = state.presets.find(p => p.id === state.selectedPreset);
    const presetItems = state.presets.map(p => p.id);
    const presetLabels = state.presets.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {});

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            <ToolHeader
                title="Data Generator"
                description="Generate mock data with templates using Faker library"
            />

            {state.error && (
                <InlineNotification
                    kind="error"
                    title="Error"
                    subtitle={state.error}
                    onClose={() => dispatch({ type: 'SET_ERROR', payload: null })}
                />
            )}

            <ToolControls>
                <GeneratorControls
                    state={state}
                    dispatch={dispatch}
                    presetItems={presetItems}
                    presetLabels={presetLabels}
                    onPresetChange={handlePresetChange}
                    onGenerate={handleGenerate}
                />
                <div style={{ marginLeft: 'auto', paddingBottom: '4px' }}>
                    <ToolLayoutToggle
                        direction={layout.direction}
                        onToggle={layout.toggleDirection}
                        position="controls"
                    />
                </div>
            </ToolControls>

            <VariableControls
                variables={currentPreset?.variables}
                values={state.variables}
                onChange={handleVariableChange}
            />

            <ToolSplitPane columnCount={layout.direction === 'horizontal' ? 2 : 1}>
                <ToolPane
                    label="Template"
                    value={state.template}
                    onChange={(e) => dispatch({ type: 'SET_TEMPLATE', payload: e.target.value })}
                    placeholder="Enter your template here..."
                />

                <ToolPane
                    label={state.duration > 0 ? `Output (${state.duration}ms)` : 'Output'}
                    value={state.output}
                    readOnly
                    placeholder="Generated data will appear here..."
                />
            </ToolSplitPane>

            <HelpModal
                open={state.showHelp}
                onClose={() => dispatch({ type: 'TOGGLE_HELP' })}
            />
        </div>
    );
}
