import React, { useState } from 'react';
import { TextInput, IconButton } from '@carbon/react';
import { View, ViewOff } from '@carbon/icons-react';
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
    const [showPassword, setShowPassword] = useState(false);
    const effectiveFontFamily = monospace ? getMonospaceFontFamily() : fontFamily;
    const effectiveFontSize = fontSize || getDataFontSize();

    // Determine effective input type
    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    // Copy button component
    const copyButton = showCopyButton && (
        <ToolCopyButton
            text={value}
            size="sm"
        />
    );

    // Toggle password visibility button
    const passwordToggleButton = type === 'password' && (
        <IconButton
            kind="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            label={showPassword ? "Hide value" : "Show value"}
            align="bottom"
            className="password-toggle-button"
        >
            {showPassword ? <ViewOff /> : <View />}
        </IconButton>
    );

    return (
        <div
            className="tool-input-container"
            style={{
                display: 'flex',
                flexDirection: 'column',
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
                        type={inputType}
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
                {passwordToggleButton}
                {copyButton}
            </div>
        </div>
    );
}