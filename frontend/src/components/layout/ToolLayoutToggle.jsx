import React from 'react';
import { Button } from '@carbon/react';
import { SplitScreen, VerticalView } from '@carbon/icons-react';
import { TOGGLE_POSITIONS } from './constants';

/**
 * Layout toggle button for switching between horizontal and vertical layouts
 *
 * @param {Object} props
 * @param {'horizontal'|'vertical'} props.direction - Current layout direction
 * @param {Function} props.onToggle - Callback when toggle is clicked
 * @param {string} [props.position='top-right'] - Position styling
 * @param {boolean} [props.disabled=false] - Whether toggle is disabled
 * @param {Object} [props.style={}] - Additional styles
 */
export default function ToolLayoutToggle({
    direction,
    onToggle,
    position = 'top-right',
    disabled = false,
    style = {}
}) {
    const isHorizontal = direction === 'horizontal';

    // Position styling based on position prop
    const positionStyles = {
        'top-right': {
            position: 'absolute',
            top: '0',
            right: '0',
            zIndex: 10,
        },
        'controls': {
            marginLeft: 'auto', // Pushes to end of flex container
        },
        'floating': {
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            zIndex: 10,
            backgroundColor: 'var(--cds-layer)',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }
    };

    const containerStyle = {
        ...positionStyles[position] || positionStyles['top-right'],
        ...style
    };

    return (
        <div style={containerStyle}>
            <Button
                kind="ghost"
                size="sm"
                renderIcon={isHorizontal ? VerticalView : SplitScreen}
                iconDescription={isHorizontal ? "Vertical layout" : "Horizontal layout"}
                hasIconOnly
                disabled={disabled}
                onClick={onToggle}
                title={isHorizontal ? "Switch to vertical layout" : "Switch to horizontal layout"}
            />
        </div>
    );
}