import React from 'react';
import { Button } from '@carbon/react';
import { ToolControls } from '../../../components/ToolUI';
import { PRESETS } from '../constants';

export function PresetsSection({ onSelectPreset }) {
  return (
    <ToolControls>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {PRESETS.map((preset) => (
          <Button
            key={preset.id}
            size="sm"
            kind="tertiary"
            onClick={() => onSelectPreset(preset)}
            renderIcon={preset?.icon}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </ToolControls>
  );
}
