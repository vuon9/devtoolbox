import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';
import { Play, HelpCircle } from 'lucide-react';
import { SEPARATOR_OPTIONS, OUTPUT_FORMAT_OPTIONS } from '../constants';

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';
const labelClass = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 400,
  color: 'var(--muted-foreground)',
  marginBottom: '0.25rem',
};

export default function GeneratorControls({
  state,
  dispatch,
  presetItems,
  presetLabels,
  onPresetChange,
  onGenerate,
}) {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      {/* Preset Select */}
      <div style={{ width: '220px' }}>
        <label style={labelClass}>Template Preset</label>
        <select
          id="preset-select"
          value={state.selectedPreset}
          onChange={(e) => onPresetChange({ selectedItem: e.target.value })}
          className={selectClass}
        >
          {presetItems.map((item) => (
            <option key={item} value={item}>
              {presetLabels[item] || item}
            </option>
          ))}
        </select>
      </div>

      {/* Mode Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          paddingBottom: '6px',
          minWidth: '120px',
        }}
      >
        <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Single</span>
        <Switch
          id="mode-toggle"
          checked={state.mode === 'batch'}
          onCheckedChange={(checked) =>
            dispatch({ type: 'SET_MODE', payload: checked ? 'batch' : 'single' })
          }
        />
        <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Batch</span>
      </div>

      {/* Batch Count - Only in batch mode */}
      {state.mode === 'batch' && (
        <div style={{ width: '140px' }}>
          <label style={labelClass}>Count (10-1000)</label>
          <input
            id="batch-count"
            type="number"
            min={10}
            max={1000}
            value={state.batchCount}
            onChange={(e) =>
              dispatch({ type: 'SET_BATCH_COUNT', payload: parseInt(e.target.value, 10) })
            }
            className={selectClass}
          />
        </div>
      )}

      {/* Output Format Select */}
      <div style={{ width: '150px' }}>
        <label style={labelClass}>Output Format</label>
        <select
          id="output-format"
          value={state.outputFormat}
          onChange={(e) => dispatch({ type: 'SET_OUTPUT_FORMAT', payload: e.target.value })}
          className={selectClass}
        >
          {OUTPUT_FORMAT_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Separator Select - Only for raw format */}
      {state.outputFormat === 'raw' && (
        <div style={{ width: '150px' }}>
          <label style={labelClass}>Separator</label>
          <select
            id="separator-select"
            value={state.separator}
            onChange={(e) => dispatch({ type: 'SET_SEPARATOR', payload: e.target.value })}
            className={selectClass}
          >
            {SEPARATOR_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom Separator Input */}
      {state.outputFormat === 'raw' && state.separator === 'custom' && (
        <div style={{ width: '200px' }}>
          <label style={labelClass}>Custom Separator</label>
          <Input
            id="custom-separator"
            placeholder="e.g. | or ;;"
            value={state.customSeparator || ''}
            onChange={(e) => dispatch({ type: 'SET_CUSTOM_SEPARATOR', payload: e.target.value })}
          />
        </div>
      )}

      {/* Generate Button */}
      <div>
        <Button variant="default" onClick={onGenerate} disabled={state.isGenerating}>
          <Play size={14} />
          {state.isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      {/* Help Button */}
      <div>
        <Button variant="secondary" onClick={() => dispatch({ type: 'TOGGLE_HELP' })}>
          <HelpCircle size={14} />
          Help
        </Button>
      </div>
    </div>
  );
}
