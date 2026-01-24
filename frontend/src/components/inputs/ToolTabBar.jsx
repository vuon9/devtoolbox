import React from 'react';

/**
 * Simple tab bar component for switching between views
 * 
 * @param {Object} props
 * @param {string[]} props.tabs - Tab labels
 * @param {number} props.activeTab - Index of active tab
 * @param {Function} props.onChange - Callback when tab changes
 * @param {Object} [props.style={}] - Additional styles
 */
export default function ToolTabBar({ 
    tabs, 
    activeTab, 
    onChange, 
    style = {} 
}) {
    return (
        <div 
            className="tool-tab-bar"
            style={{
                display: 'flex',
                gap: '1rem',
                paddingBottom: '0.25rem',
                height: '28px',
                alignItems: 'center',
                borderBottom: '1px solid var(--cds-border-subtle)',
                ...style
            }}
        >
            {tabs.map((tab, idx) => (
                <button
                    key={idx}
                    onClick={() => onChange(idx)}
                    style={{
                        padding: '0.5rem 0',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === idx ? '2px solid var(--cds-interactive-01)' : 'none',
                        color: activeTab === idx ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        top: '1px' // Align with border
                    }}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}