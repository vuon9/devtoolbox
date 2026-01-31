import React from 'react';
import { Dropdown, Checkbox, NumberInput } from '@carbon/react';

export default function VariableControls({ variables, values, onChange }) {
    if (!variables || variables.length === 0) return null;

    return (
        <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            flexWrap: 'wrap',
            padding: '1rem',
            backgroundColor: 'var(--cds-layer)',
            borderRadius: '4px'
        }}>
            {variables.map(variable => (
                <div key={variable.name} style={{ minWidth: '150px' }}>
                    {variable.type === 'select' ? (
                        <Dropdown
                            id={`var-${variable.name}`}
                            titleText={variable.name}
                            label="Select"
                            items={variable.options}
                            selectedItem={values[variable.name] || variable.default}
                            onChange={({ selectedItem }) => onChange(variable.name, selectedItem)}
                        />
                    ) : variable.type === 'boolean' ? (
                        <Checkbox
                            labelText={variable.name}
                            id={`var-${variable.name}`}
                            checked={values[variable.name] ?? variable.default}
                            onChange={(_, { checked }) => onChange(variable.name, checked)}
                        />
                    ) : (
                        <NumberInput
                            id={`var-${variable.name}`}
                            label={variable.name}
                            min={variable.min}
                            max={variable.max}
                            value={values[variable.name] || variable.default}
                            onChange={(e, { value }) => onChange(variable.name, value)}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
