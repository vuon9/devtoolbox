import React from 'react';
import { Checkbox } from '../../../components/ui/checkbox';

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';
const labelClass = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 400,
  color: 'var(--muted-foreground)',
  marginBottom: '0.25rem',
};

export default function VariableControls({ variables, values, onChange }) {
  if (!variables || variables.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
        padding: '1rem',
        backgroundColor: 'var(--card)',
        borderRadius: '4px',
      }}
    >
      {variables.map((variable) => (
        <div key={variable.name} style={{ minWidth: '150px' }}>
          {variable.type === 'select' ? (
            <div>
              <label style={labelClass}>{variable.name}</label>
              <select
                id={`var-${variable.name}`}
                value={values[variable.name] || variable.default}
                onChange={(e) => onChange(variable.name, e.target.value)}
                className={selectClass}
              >
                {variable.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ) : variable.type === 'boolean' ? (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem' }}
            >
              <Checkbox
                id={`var-${variable.name}`}
                checked={values[variable.name] ?? variable.default}
                onCheckedChange={(checked) => onChange(variable.name, checked)}
              />
              <label
                htmlFor={`var-${variable.name}`}
                style={{ fontSize: '0.875rem', color: 'var(--foreground)', cursor: 'pointer' }}
              >
                {variable.name}
              </label>
            </div>
          ) : (
            <div>
              <label style={labelClass}>{variable.name}</label>
              <input
                id={`var-${variable.name}`}
                type="number"
                min={variable.min}
                max={variable.max}
                value={values[variable.name] || variable.default}
                onChange={(e) => onChange(variable.name, parseInt(e.target.value, 10))}
                className={selectClass}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
