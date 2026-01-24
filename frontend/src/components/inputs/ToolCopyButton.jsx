import React, { useState, useCallback } from 'react';
import { Button } from '@carbon/react';
import { Copy, Checkmark } from '@carbon/icons-react';

/**
 * Standardized copy button component with success feedback
 * 
 * @param {Object} props
 * @param {string} props.text - Text to copy
 * @param {Function} [props.onCopy] - Custom copy handler (receives text as argument)
 * @param {string} [props.tooltipPosition='left'] - Tooltip position
 * @param {boolean} [props.disabled] - Whether button is disabled (defaults to !text)
 * @param {string} [props.kind='ghost'] - Carbon Button kind
 * @param {string} [props.size='sm'] - Button size
 * @param {Object} [props.style={}] - Additional styles
 */
export default function ToolCopyButton({ 
    text,
    onCopy,
    tooltipPosition = 'left',
    disabled,
    kind = 'ghost',
    size = 'sm',
    style = {}
}) {
    const [copied, setCopied] = useState(false);
    
    const isDisabled = disabled ?? !text;
    
    const handleCopy = useCallback(async () => {
        if (isDisabled) return;
        
        try {
            if (onCopy) {
                await onCopy(text);
            } else {
                await navigator.clipboard.writeText(text);
            }
            
            // Show success feedback
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy text:', error);
        }
    }, [text, onCopy, isDisabled]);
    
    const icon = copied ? Checkmark : Copy;
    const label = copied ? "Copied!" : "Copy to clipboard";
    const iconDescription = copied ? "Copied" : "Copy";
    
    return (
        <Button
            hasIconOnly
            renderIcon={icon}
            kind={kind}
            size={size}
            iconDescription={iconDescription}
            tooltipPosition={tooltipPosition}
            onClick={handleCopy}
            disabled={isDisabled}
            style={style}
        >
            {label}
        </Button>
    );
}