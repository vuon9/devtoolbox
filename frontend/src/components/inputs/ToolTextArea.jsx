import React from 'react';
import { TextArea } from '@carbon/react';
import ToolCopyButton from './ToolCopyButton';
import { getMonospaceFontFamily, getDataFontSize, getTextareaResize } from '../../utils/inputUtils';

/**
 * Enhanced TextArea component with label, copy button, and configurable options
 * 
 * @param {Object} props
 * @param {string} props.label - Label text (displayed above textarea)
 * @param {string} props.value - Textarea value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} [props.readOnly=false] - Whether textarea is read-only
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.showCopyButton=true] - Show copy button
 * @param {boolean} [props.resizeHeight=true] - Allow vertical resize
 * @param {boolean} [props.resizeWidth=false] - Allow horizontal resize
 * @param {boolean} [props.monospace=true] - Use IBM Plex Mono font
 * @param {string} [props.fontSize] - Custom font size (defaults to 0.875rem)
 * @param {string} [props.fontFamily] - Custom font family
 * @param {number} [props.rows] - Number of rows (overrides height styling)
 * @param {Object} [props.textAreaProps={}] - Additional props passed to Carbon TextArea
 * @param {Object} [props.style={}] - Additional container styles
 */
export default function ToolTextArea({
    label,
    value,
    onChange,
    readOnly = false,
    placeholder,
    showCopyButton = true,
    resizeHeight = true,
    resizeWidth = false,
    monospace = true,
    fontSize,
    fontFamily,
    rows,
    textAreaProps = {},
    style = {}
}) {
    const effectiveFontFamily = monospace ? getMonospaceFontFamily() : fontFamily;
    const effectiveFontSize = fontSize || getDataFontSize();
    const resizeStyle = getTextareaResize(resizeHeight, resizeWidth);
    
    // Copy button component
    const copyButton = showCopyButton && (
        <ToolCopyButton 
            text={value}
            style={{ marginLeft: 'auto' }}
        />
    );
    
    return (
        <div 
            className="tool-textarea-container"
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                flex: 1,
                ...style
            }}
        >
            {/* Label and copy button row */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '30px',
                marginBottom: '0.5rem'
            }}>
                <label style={{
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    lineHeight: 1.5,
                    letterSpacing: '0.32px',
                    color: 'var(--cds-text-secondary)',
                    textTransform: 'uppercase'
                }}>
                    {label}
                </label>
                {copyButton}
            </div>
            
            {/* Textarea container */}
            <div style={{ 
                flex: 1, 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column',
                minHeight: 0
            }}>
                <TextArea
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    placeholder={placeholder}
                    rows={rows}
                    style={{
                        flex: 1,
                        height: rows ? undefined : '100%',
                        minHeight: rows ? undefined : 0,
                        resize: resizeStyle,
                        fontFamily: effectiveFontFamily,
                        fontSize: effectiveFontSize,
                        border: '1px solid var(--cds-border-strong)',
                        backgroundColor: readOnly ? 'var(--cds-ui-01)' : 'var(--cds-field)',
                        color: 'var(--cds-text-primary)',
                    }}
                    labelText=""
                    {...textAreaProps}
                />
            </div>
        </div>
    );
}