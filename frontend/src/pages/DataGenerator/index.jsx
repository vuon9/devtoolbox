import React, { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, Column, InlineNotification } from '@carbon/react';
import {
  ToolHeader,
  ToolControls,
  ToolPane,
  ToolSplitPane,
  ToolLayoutToggle,
} from '../../components/ToolUI';
import useLayoutToggle from '../../hooks/useLayoutToggle';
import { initialState, reducer } from './constants';
import GeneratorControls from './components/GeneratorControls';
import VariableControls from './components/VariableControls';
import HelpModal from './components/HelpModal';
import { GetPresets, Generate, ValidateTemplate } from '../../generated/http/dataGeneratorService';

export default function DataGenerator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = React.useReducer(reducer, initialState);

  // Get preset from URL params
  const urlPreset = searchParams.get('preset');

  const layout = useLayoutToggle({
    toolKey: 'data-generator-layout',
    defaultDirection: 'horizontal',
    showToggle: true,
    persist: true,
  });

  // Load presets on mount
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const response = await GetPresets();
        console.log('GetPresets response:', response);

        const presets = response.presets || response;

        if (presets && Array.isArray(presets) && presets.length > 0) {
          dispatch({ type: 'SET_PRESETS', payload: presets });

          // Check for URL preset, otherwise use first preset
          let selectedPreset = presets[0];
          if (urlPreset) {
            const urlPresetMatch = presets.find(
              (p) =>
                p.id.toLowerCase() === urlPreset.toLowerCase() ||
                p.name.toLowerCase() === urlPreset.toLowerCase()
            );
            if (urlPresetMatch) {
              selectedPreset = urlPresetMatch;
            }
          }

          const defaultVars = {};
          if (selectedPreset.variables && Array.isArray(selectedPreset.variables)) {
            selectedPreset.variables.forEach((v) => {
              defaultVars[v.name] = v.default;
            });
          }

          dispatch({
            type: 'SELECT_PRESET',
            payload: {
              id: selectedPreset.id,
              template: selectedPreset.template,
              defaultVars,
            },
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

  // Sync preset if URL param changes
  useEffect(() => {
    if (urlPreset && state.presets.length > 0) {
      const preset = state.presets.find(
        (p) =>
          p.id.toLowerCase() === urlPreset.toLowerCase() ||
          p.name.toLowerCase() === urlPreset.toLowerCase()
      );
      if (preset) {
        const defaultVars = {};
        preset.variables.forEach((v) => {
          defaultVars[v.name] = v.default;
        });
        dispatch({
          type: 'SELECT_PRESET',
          payload: {
            id: preset.id,
            template: preset.template,
            defaultVars,
          },
        });
        // Clear URL params after using preset
        setSearchParams({}, { replace: true });
      }
    }
  }, [urlPreset, state.presets, setSearchParams]);

  // Handle preset selection
  const handlePresetChange = useCallback(
    ({ selectedItem }) => {
      const preset = state.presets.find((p) => p.id === selectedItem);
      if (preset) {
        const defaultVars = {};
        preset.variables.forEach((v) => {
          defaultVars[v.name] = v.default;
        });
        dispatch({
          type: 'SELECT_PRESET',
          payload: {
            id: preset.id,
            template: preset.template,
            defaultVars,
          },
        });
      }
    },
    [state.presets]
  );

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
        separator: state.separator === 'custom' ? state.customSeparator : state.separator,
      };

      const response = await Generate(request);

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
  }, [
    state.template,
    state.variables,
    state.mode,
    state.batchCount,
    state.outputFormat,
    state.separator,
    state.customSeparator,
  ]);

  // Get current preset
  const currentPreset = state.presets.find((p) => p.id === state.selectedPreset);
  const presetItems = state.presets.map((p) => p.id);
  const presetLabels = state.presets.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {});

  return (
    <Grid
      fullWidth
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}
    >
      <Column>
        <ToolHeader
          title="Data Generator"
          description="Generate mock data with templates using Faker library"
        />
      </Column>

      {state.error && (
        <Column>
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={state.error}
            onClose={() => dispatch({ type: 'SET_ERROR', payload: null })}
          />
        </Column>
      )}

      <Column>
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
      </Column>

      <Column>
        <VariableControls
          variables={currentPreset?.variables}
          values={state.variables}
          onChange={handleVariableChange}
        />
      </Column>

      <Column style={{ flex: 1, minHeight: 0 }}>
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
      </Column>

      <HelpModal open={state.showHelp} onClose={() => dispatch({ type: 'TOGGLE_HELP' })} />
    </Grid>
  );
}
