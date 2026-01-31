import React from 'react';
import {
    Button,
    Dropdown,
    NumberInput,
    Toggle,
    TextInput
} from '@carbon/react';
import { Renew, Help } from '@carbon/icons-react';
import { SEPARATOR_OPTIONS, OUTPUT_FORMAT_OPTIONS } from '../constants';

export default function GeneratorControls({
    state,
    dispatch,
    presetItems,
    presetLabels,
    onPresetChange,
    onGenerate
}) {
    return (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Preset Dropdown */}
            <div style={{ width: '220px' }}>
                <Dropdown
                    id="preset-select"
                    titleText="Template Preset"
                    label="Select preset"
                    items={presetItems}
                    itemToString={(item) => presetLabels[item] || item}
                    selectedItem={state.selectedPreset}
                    onChange={onPresetChange}
                />
            </div>

            {/* Mode Toggle */}
            <div style={{ paddingBottom: '6px', minWidth: '120px' }}>
                <Toggle
                    id="mode-toggle"
                    labelA="Single"
                    labelB="Batch"
                    toggled={state.mode === 'batch'}
                    onToggle={(checked) => dispatch({ type: 'SET_MODE', payload: checked ? 'batch' : 'single' })}
                    size="md"
                />
            </div>

            {/* Batch Count - Only in batch mode */}
            {state.mode === 'batch' && (
                <div style={{ width: '140px' }}>
                    <NumberInput
                        id="batch-count"
                        label="Count (10-1000)"
                        min={10}
                        max={1000}
                        value={state.batchCount}
                        onChange={(e, { value }) => dispatch({ type: 'SET_BATCH_COUNT', payload: value })}
                    />
                </div>
            )}

            {/* Output Format Dropdown */}
            <div style={{ width: '150px' }}>
                <Dropdown
                    id="output-format"
                    titleText="Output Format"
                    label="Select format"
                    items={OUTPUT_FORMAT_OPTIONS.map(o => o.id)}
                    itemToString={(item) => OUTPUT_FORMAT_OPTIONS.find(o => o.id === item)?.label || item}
                    selectedItem={state.outputFormat}
                    onChange={({ selectedItem }) => dispatch({ type: 'SET_OUTPUT_FORMAT', payload: selectedItem })}
                />
            </div>

            {/* Separator Dropdown - Only for raw format */}
            {state.outputFormat === 'raw' && (
                <div style={{ width: '150px' }}>
                    <Dropdown
                        id="separator-select"
                        titleText="Separator"
                        label="Select separator"
                        items={SEPARATOR_OPTIONS.map(o => o.id)}
                        itemToString={(item) => SEPARATOR_OPTIONS.find(o => o.id === item)?.label || item}
                        selectedItem={state.separator}
                        onChange={({ selectedItem }) => dispatch({ type: 'SET_SEPARATOR', payload: selectedItem })}
                    />
                </div>
            )}

            {/* Custom Separator Input */}
            {state.outputFormat === 'raw' && state.separator === 'custom' && (
                <div style={{ width: '200px' }}>
                    <TextInput
                        id="custom-separator"
                        labelText="Custom Separator"
                        placeholder="e.g. | or ;;"
                        value={state.customSeparator || ''}
                        onChange={(e) => dispatch({ type: 'SET_CUSTOM_SEPARATOR', payload: e.target.value })}
                    />
                </div>
            )}

            {/* Generate Button */}
            <div>
                <Button
                    kind="primary"
                    size="md"
                    renderIcon={Renew}
                    onClick={onGenerate}
                    disabled={state.isGenerating}
                >
                    {state.isGenerating ? 'Generating...' : 'Generate'}
                </Button>
            </div>

            {/* Help Button */}
            <div>
                <Button
                    kind="tertiary"
                    size="md"
                    renderIcon={Help}
                    onClick={() => dispatch({ type: 'TOGGLE_HELP' })}
                >
                    Help
                </Button>
            </div>
        </div>
    );
}
