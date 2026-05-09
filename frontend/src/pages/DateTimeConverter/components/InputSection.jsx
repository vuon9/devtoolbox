import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/input';
import { Plus } from 'lucide-react';
import { ToolControls } from '../../../components/ToolUI';

const selectClass = "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

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
        <div style={{ flex: 1 }}>
          <Input
            id="datetime-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 1738412345, 2026-02-01T12:24:05Z, 1738412345 + 3600..."
            className="font-mono"
          />
        </div>
        <div>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={selectClass}
            disabled={availableTimezones.length === 0}
            style={{ minWidth: '200px' }}
          >
            {availableTimezones.length === 0 && (
              <option value="">Loading...</option>
            )}
            {availableTimezones.map((tz) => (
              <option key={tz.id} value={tz.id}>{tz.label}</option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '300px' }}>
          <select
            id="add-timezone"
            value={selectedNewTimezone?.id || ''}
            onChange={(e) => {
              const tz = availableTimezones.find((t) => t.id === e.target.value);
              setSelectedNewTimezone(tz || null);
            }}
            className={selectClass}
            style={{ width: '100%' }}
            disabled={disabled}
          >
            <option value="">{disabled ? 'Loading timezones...' : 'Search timezone...'}</option>
            {availableTimezones.map((tz) => (
              <option key={tz.id} value={tz.id}>{tz.label}</option>
            ))}
          </select>
        </div>
        <Button variant="default" onClick={onAddTimezone} disabled={!selectedNewTimezone}>
          <Plus size={14} />
          Add
        </Button>
      </div>
    </ToolControls>
  );
}
