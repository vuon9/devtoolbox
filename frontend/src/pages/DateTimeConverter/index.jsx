import React from 'react';
import { Grid, Column } from '@carbon/react';
import { ToolHeader } from '../../components/ToolUI';
import { useDateTime } from './hooks/useDateTime';
import { PresetsSection } from './components/PresetsSection';
import { InputSection } from './components/InputSection';
import { ResultsGrid } from './components/ResultsGrid';
import { PRESETS } from './constants';

export default function DateTimeConverter() {
  const {
    input,
    setInput,
    timezone,
    setTimezone,
    parsedDate,
    error,
    customTimezones,
    selectedNewTimezone,
    setSelectedNewTimezone,
    allTimezones,
    availableTimezones,
    addTimezone,
    removeTimezone,
    getTimezoneLabel,
  } = useDateTime();

  const handleSelectPreset = (preset) => {
    setInput(preset.getValue().toString());
  };

  return (
    <Grid
      fullWidth
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}
    >
      <Column>
        <ToolHeader
          title="DateTime Converter"
          description="Convert between timestamps and date formats. Supports Unix timestamps, ISO dates, math expressions (+, -, *, /), and various formats."
        />
      </Column>

      {/* Presets */}
      <Column>
        <PresetsSection onSelectPreset={handleSelectPreset} />
      </Column>

      {/* Input Section */}
      <Column>
        <InputSection
          input={input}
          setInput={setInput}
          timezone={timezone}
          setTimezone={setTimezone}
          availableTimezones={availableTimezones}
          selectedNewTimezone={selectedNewTimezone}
          setSelectedNewTimezone={setSelectedNewTimezone}
          onAddTimezone={addTimezone}
          disabled={availableTimezones.length === 0}
        />
      </Column>

      {/* Error */}
      {error && (
        <Column>
          <div style={{ color: 'var(--cds-text-error)', fontSize: '0.875rem' }}>{error}</div>
        </Column>
      )}

      {/* Results Section */}
      {parsedDate && (
        <Column>
          <ResultsGrid
            parsedDate={parsedDate}
            timezone={timezone}
            customTimezones={customTimezones}
            getTimezoneLabel={getTimezoneLabel}
            onRemoveTimezone={removeTimezone}
          />
        </Column>
      )}
    </Grid>
  );
}
