import React from 'react';
import { Button, TextInput, ComboBox } from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { ToolControls } from '../../../components/ToolUI';

export function InputSection({
  availableTimezones,
  input,
  setInput,
  timezone,
  setTimezone,
  selectedNewTimezone,
  setSelectedNewTimezone,
  onAddTimezone,
  disabled,
}) {
  return (
    <ToolControls>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
        <TextInput
          id="datetime-input"
          labelText="Input Date/Time (or Unix timestamp)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., 1738412345, 2026-02-01T12:24:05Z, 1738412345 + 3600..."
          style={{ fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace" }}
        />
        <div>
          <ComboBox
            id="timezone"
            titleText="Input timezone"
            placeholder={availableTimezones.length === 0 ? 'Loading...' : 'Select timezone'}
            items={availableTimezones}
            itemToString={(item) => (item ? item.label : '')}
            selectedItem={availableTimezones.find((tz) => tz.id === timezone)}
            onChange={({ selectedItem }) => selectedItem && setTimezone(selectedItem.id)}
            disabled={availableTimezones.length === 0}
          />
        </div>

        <ComboBox
          id="add-timezone"
          titleText="Add timezone"
          placeholder={disabled ? 'Loading timezones...' : 'Search timezone...'}
          items={availableTimezones}
          itemToString={(item) => (item ? item.label : '')}
          selectedItem={selectedNewTimezone}
          onChange={({ selectedItem }) => setSelectedNewTimezone(selectedItem)}
          style={{ minWidth: '300px' }}
          disabled={disabled}
        />
        <Button
          size="md"
          onClick={onAddTimezone}
          disabled={!selectedNewTimezone}
          renderIcon={Add}
          iconDescription="Add timezone"
        >
          Add
        </Button>
      </div>
    </ToolControls>
  );
}
