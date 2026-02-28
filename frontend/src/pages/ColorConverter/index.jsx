import React, { useState, useEffect, useCallback, useReducer, useMemo, useRef } from 'react';
import { Button, Grid, Column, Tabs, TabList, Tab, TabPanels, TabPanel, Layer, Checkbox, TextInput } from '@carbon/react';
import { Eyedropper, ColorPalette } from '@carbon/icons-react';
import { ToolHeader } from '../../components/ToolUI';
import { colorReducer, initialState, actions } from './colorReducer';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbToCmyk,
  parseHex,
  parseRgb,
  parseHsl,
  parseHsv,
  parseCmyk,
  generateCodeSnippets,
} from './colorUtils';
import ColorInputs from './components/ColorInputs';
import ColorHistory from './components/ColorHistory';
import CodeSnippetsPanel from './components/CodeSnippetsPanel';

export default function ColorConverter() {
  const [state, dispatch] = useReducer(colorReducer, initialState);
  const [eyedropperSupported, setEyedropperSupported] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const colorPickerRef = useRef(null);
  const historyTimeoutRef = useRef(null);

  // Check for EyeDropper API support
  useEffect(() => {
    setEyedropperSupported('EyeDropper' in window);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, []);

  // Generate code snippets when color changes
  const codeSnippets = useMemo(
    () =>
      generateCodeSnippets(
        state.rgb.r,
        state.rgb.g,
        state.rgb.b,
        state.rgb.a,
        state.hsl,
        state.hsv
      ),
    [state.rgb, state.hsl, state.hsv]
  );

  // Debounced history recording
  const debouncedAddToHistory = useCallback((hex, rgb) => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }
    historyTimeoutRef.current = setTimeout(() => {
      dispatch(actions.addToHistory({ hex, rgb }));
    }, 100);
  }, []);

  // Update all color formats from RGB
  const updateFromRgb = useCallback(
    (r, g, b, a = 1, skipHistory = false) => {
      const hex = rgbToHex(r, g, b, a);
      const hsl = rgbToHsl(r, g, b);
      const hsv = rgbToHsv(r, g, b);
      const cmyk = rgbToCmyk(r, g, b);

      dispatch(actions.setColor({ hex, rgb: { r, g, b, a }, hsl, hsv, cmyk }));

      if (!skipHistory) {
        debouncedAddToHistory(hex, { r, g, b, a });
      }
    },
    [debouncedAddToHistory]
  );

  // Handle color input changes
  const handleColorInput = useCallback(
    (type, value) => {
      let result = null;

      switch (type) {
        case 'hex':
          result = parseHex(value);
          break;
        case 'rgb':
          result = parseRgb(value);
          break;
        case 'hsl':
          result = parseHsl(value);
          break;
        case 'hsv':
          result = parseHsv(value);
          break;
        case 'cmyk':
          result = parseCmyk(value);
          break;
      }

      if (result) {
        updateFromRgb(result.r, result.g, result.b, result.a);
      }
    },
    [updateFromRgb]
  );

  // Open native color picker
  const openColorPicker = useCallback(() => {
    if (colorPickerRef.current) {
      colorPickerRef.current.click();
    }
  }, []);

  // Handle native color picker change
  const handleColorPickerChange = useCallback(
    (e) => {
      const rgb = hexToRgb(e.target.value);
      if (rgb) {
        updateFromRgb(rgb.r, rgb.g, rgb.b, rgb.a);
      }
    },
    [updateFromRgb]
  );

  // EyeDropper functionality
  const openEyeDropper = useCallback(async () => {
    if (!eyedropperSupported) return;

    setIsPicking(true);
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result.sRGBHex) {
        const rgb = hexToRgb(result.sRGBHex);
        if (rgb) {
          updateFromRgb(rgb.r, rgb.g, rgb.b, rgb.a);
        }
      }
    } catch (e) {
      // User cancelled or error
    } finally {
      setIsPicking(false);
    }
  }, [eyedropperSupported, updateFromRgb]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
  }, []);

  // Load color from history
  const loadFromHistory = useCallback(
    (item) => {
      const rgb = hexToRgb(item.hex);
      if (rgb) {
        updateFromRgb(rgb.r, rgb.g, rgb.b, rgb.a, true);
      }
    },
    [updateFromRgb]
  );

  // Generate random color
  const generateRandomColor = useCallback(() => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    updateFromRgb(r, g, b, 1);
  }, [updateFromRgb]);

  return (
    <Grid fullWidth
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', overflow: 'hidden' }}
    >
      <Column>
        <ToolHeader
          title="Color Converter"
          description="Pick colors and generate code snippets for multiple programming languages."
        />
      </Column>

      <Grid>
        {/* Controls */}
        <Column sm={4} md={8} lg={16}
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: '0.75rem',
            backgroundColor: 'var(--cds-layer)',
            borderRadius: '4px',
            marginBottom: '2rem',
          }}
        >
          {/* Clickable Color Preview */}
          <div
            onClick={openColorPicker}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '8px',
              backgroundColor: state.hex,
              border: '2px solid var(--cds-border-strong)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              position: 'relative',
              flexShrink: 0,
            }}
            title="Click to open color picker"
          >
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '4px',
                padding: '3px',
              }}
            >
              <ColorPalette size={14} style={{ color: 'white' }} />
            </div>
          </div>

          {/* Hidden native color picker */}
          <input
            ref={colorPickerRef}
            type="color"
            value={
              state.hex.startsWith('#') && state.hex.length === 9 ? state.hex.slice(0, 7) : state.hex
            }
            onChange={handleColorPickerChange}
            style={{ display: 'none' }}
          />

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              size="sm"
              kind="secondary"
              renderIcon={ColorPalette}
              onClick={generateRandomColor}
            >
              Random
            </Button>

            {eyedropperSupported && (
              <Button
                size="sm"
                kind="primary"
                renderIcon={Eyedropper}
                onClick={openEyeDropper}
                disabled={isPicking}
              >
                {isPicking ? 'Picking...' : 'Eye Dropper'}
              </Button>
            )}
          </div>
        </Column>

        {/* Left Pane: Color Inputs & History */}
        <Column sm={4} md={3} lg={6} style={{ minHeight: '30vh' }}>
          <h4
            style={{
              fontSize: '0.75rem',
              fontWeight: 400,
              lineHeight: 1.5,
              color: 'var(--cds-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            Color Values
          </h4>

          <ColorInputs
            state={state}
            onColorInput={handleColorInput}
            onCopy={copyToClipboard}
            style={{ marginBottom: '1.5rem' }}
          />

          <ColorHistory
            history={state.history}
            onLoadFromHistory={loadFromHistory}
            onClearHistory={() => dispatch(actions.clearHistory())}
          />
        </Column>

        {/* Right Pane: Code Snippets */}
        <Column sm={4} md={5} lg={10}>
          <h4
            area-label="Code Snippets"
            style={{
              fontSize: '0.75rem',
              lineHeight: 1.5,
              color: 'var(--cds-text-secondary)',
              textTransform: 'uppercase',
              marginBottom: '.5rem',
            }}
          >
            Code Snippets
          </h4>

          <CodeSnippetsPanel
            codeSnippets={codeSnippets}
            selectedTab={state.selectedTab}
            onTabChange={(idx) => dispatch(actions.setSelectedTab(idx))}
            onCopy={copyToClipboard}
          />
        </Column>
      </Grid>
    </Grid>

  );
}
