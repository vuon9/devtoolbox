import React from 'react';
import ToolTabBar from './ToolTabBar';
import ToolCopyButton from './ToolCopyButton';
import { validateJson, formatJson, objectToKeyValueString } from '../../utils/inputUtils';

/**
 * Tabbed input group for patterns like JSON/Claims
 * 
 * @param {Object} props
 * @param {string} props.title - Group title
 * @param {string[]} props.tabs - Tab labels (e.g., ['JSON', 'Claims'])
 * @param {number} props.activeTab - Active tab index
 * @param {Function} props.onTabChange - Tab change handler
 * @param {string} [props.value] - Input value for editable mode
 * @param {Function} [props.onChange] - Change handler for editable mode
 * @param {Object} [props.data] - Data object for read-only display
 * @param {boolean} [props.editable=false] - Whether content is editable
 * @param {boolean} [props.showCopyButton=true] - Show copy button in header
 * @param {Object} [props.style={}] - Additional container styles
 */
export default function ToolInputGroup({
    title,
    tabs = ['JSON', 'Claims'],
    activeTab,
    onTabChange,
    value,
    onChange,
    data,
    editable = false,
    showCopyButton = true,
    style = {}
}) {
    // Determine content based on mode
    let content = null;
    let copyText = '';
    
    // Base textarea styles with resizable constraints
    const textareaStyle = {
        flex: 1,
        height: 'auto',
        minHeight: '100px',
        maxHeight: '150px',
        resize: 'vertical',
        overflow: 'auto',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.875rem',
        border: '1px solid var(--cds-border-strong)',
        backgroundColor: 'var(--cds-ui-01)',
        color: 'var(--cds-text-primary)',
        padding: '0.75rem',
        borderRadius: '0',
        outline: 'none'
    };
    if (editable) {
        // Editable mode (like encode mode header/payload)
        if (activeTab === 0) {
            // JSON tab - editable textarea
            content = (
                <textarea
                    value={value || ''}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={`Enter ${title} JSON...`}
                    style={textareaStyle}
                />
            );
            copyText = value || '';
        } else {
            // Claims tab - read-only display of parsed JSON
            const validation = validateJson(value || '');
            const displayText = validation.isValid && validation.data 
                ? objectToKeyValueString(validation.data)
                : '';
            
            content = (
                <textarea
                    value={displayText}
                    readOnly
                    style={textareaStyle}
                />
            );
            copyText = displayText;
        }
    } else {
        // Read-only mode (like decode mode header/payload)
        if (activeTab === 0) {
            // JSON tab - pretty printed JSON
            const jsonText = data ? formatJson(data) : '';
            content = (
                <textarea
                    value={jsonText}
                    readOnly
                    style={textareaStyle}
                />
            );
            copyText = jsonText;
        } else {
            // Claims tab - key: value format
            const claimsText = data ? objectToKeyValueString(data) : '';
            content = (
                <textarea
                    value={claimsText}
                    readOnly
                    style={textareaStyle}
                />
            );
            copyText = claimsText;
        }
    }
    
    // Validation error for editable JSON
    const validationError = editable && activeTab === 0 && value 
        ? validateJson(value).error 
        : null;
    
    return (
        <div 
            className="tool-input-group"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                minHeight: 0,
                flex: 1,
                ...style
            }}
        >
            {/* Header with title and copy button */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.75rem'
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'var(--cds-text-primary)',
                    margin: 0
                }}>
                    {title}
                </h3>
                {showCopyButton && (
                    <ToolCopyButton 
                        text={copyText}
                        disabled={!copyText}
                    />
                )}
            </div>
            
            {/* Tab bar */}
            <ToolTabBar
                tabs={tabs}
                activeTab={activeTab}
                onChange={onTabChange}
            />
            
            {/* Content area */}
            <div style={{ 
                flex: 1, 
                minHeight: 0, 
                display: 'flex', 
                flexDirection: 'column' 
            }}>
                {content}
                
                {/* Validation error for editable JSON */}
                {validationError && (
                    <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: 'var(--cds-support-error-light)',
                        color: 'var(--cds-support-error)',
                        fontSize: '0.75rem',
                        borderRadius: '4px'
                    }}>
                        Invalid JSON: {validationError}
                    </div>
                )}
            </div>
        </div>
    );
}