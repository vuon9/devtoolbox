import React from 'react';
import { TextInput } from '@carbon/react';
import ToolCopyButton from './ToolCopyButton';
import { getMonospaceFontFamily, getDataFontSize } from '../../utils/inputUtils';

/**
 * Enhanced input field with label and copy button
 * 
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.type='text'] - Input type (text, password, etc.)
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.readOnly=false] - Whether input is read-only
 * @param {boolean} [props.showCopyButton=true] - Show copy button
 * @param {boolean} [props.monospace=true] - Use IBM Plex Mono font
 * @param {string} [props.fontSize] - Custom font size
 * @param {string} [props.fontFamily] - Custom font family
 * @param {Object} [props.inputProps={}] - Additional props passed to Carbon TextInput
 * @param {Object} [props.style={}] - Additional container styles
 */
export default function ToolInput({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    readOnly = false,
    showCopyButton = true,
    monospace = true,
    fontSize,
    fontFamily,
    inputProps = {},
    style = {}
}) {
    const effectiveFontFamily = monospace ? getMonospaceFontFamily() : fontFamily;
    const effectiveFontSize = fontSize || getDataFontSize();
    
    // Copy button component
    const copyButton = showCopyButton && (
        <ToolCopyButton 
            text={value}
            size="sm"
        />
    );
    
    return (
        <div 
            className="tool-input-container"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                ...style
            }}
        >
            {/* Label */}
            <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 400,
                color: 'var(--cds-text-secondary)',
                textTransform: 'uppercase',
                marginBottom: '0.25rem'
            }}>
                {label}
            </label>
            
            {/* Input and copy button row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <div style={{ flex: 1 }}>
                    <TextInput
                        value={value}
                        onChange={onChange}
                        type={type}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        style={{
                            fontFamily: effectiveFontFamily,
                            fontSize: effectiveFontSize,
                            backgroundColor: readOnly ? 'var(--cds-ui-01)' : 'var(--cds-field)',
                            color: 'var(--cds-text-primary)',
                            width: '100%'
                        }}
                        {...inputProps}
                    />
                </div>
                {copyButton}
            </div>
        </div>
    );
}