import React from 'react';

/**
 * Vertical split layout - stacks children in a column
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child panes (2 or more)
 * @param {string} [props.gap='1rem'] - Spacing between panes
 * @param {boolean} [props.equalHeight=true] - Whether panes should have equal height
 * @param {Object} [props.style={}] - Additional container styles
 */
export default function ToolVerticalSplit({
    children,
    gap = '1rem',
    equalHeight = true,
    style = {}
}) {
    const childArray = React.Children.toArray(children);

    if (childArray.length < 2) {
        console.warn('ToolVerticalSplit expects at least 2 children');
    }

    return (
        <div
            className="tool-vertical-split"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: gap,
                flex: 1,
                minHeight: 0,
                ...style
            }}
        >
            {React.Children.map(children, (child, index) => {
                if (!React.isValidElement(child)) return child;

                // Enhance child with proper flex styling
                const childStyle = equalHeight
                    ? {
                        flex: '1 1 50%',
                        minHeight: '30%',
                        maxHeight: '70%',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                    : index === 0
                        ? { flex: '0 0 auto' } // First child doesn't grow
                        : { flex: 1, minHeight: 0 };

                return React.cloneElement(child, {
                    style: {
                        ...child.props.style,
                        ...childStyle
                    }
                });
            })}
        </div>
    );
}