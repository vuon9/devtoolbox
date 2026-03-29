import React from 'react';
import { Button } from '../../../components/ui/Button';
import { ToolControls } from '../../../components/ToolUI';
import { PRESETS } from '../constants';

export function PresetsSection({ onSelectPreset }) {
  return (
    <ToolControls>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {PRESETS.map((preset) => {
          const IconComponent = preset?.icon;
          return (
            <Button key={preset.id} variant="secondary" onClick={() => onSelectPreset(preset)}>
              {IconComponent && <IconComponent size={14} />}
              {preset.label}
            </Button>
          );
        })}
      </div>
    </ToolControls>
  );
}
