import React from 'react';

/**
 * Enhanced tab bar component with improved styling
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
                gap: '0.25rem',
                padding: '0.25rem',
                backgroundColor: 'var(--cds-layer-01)',
                borderRadius: '8px',
                ...style
            }}
        >
            {tabs.map((tab, idx) => (
                <button
                    key={idx}
                    onClick={() => onChange(idx)}
                    style={{
                        padding: '0.5rem 1rem',
                        background: activeTab === idx ? 'var(--cds-layer)' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        color: activeTab === idx ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: activeTab === idx ? '0 1px 3px rgba(0, 0, 0, 0.12)' : 'none',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        minWidth: '80px',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                        if (activeTab !== idx) {
                            e.currentTarget.style.backgroundColor = 'var(--cds-layer-hover)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeTab !== idx) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }
                    }}
                >
                    {/* Optional icon based on tab label */}
                    {tab === 'JSON' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                            <path d="M14 2v6h6" />
                            <path d="m10 12-2 2 2 2" />
                            <path d="m14 12 2 2-2 2" />
                        </svg>
                    )}
                    {tab === 'Claims' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M8 6h8" />
                            <path d="M8 12h8" />
                            <path d="M8 18h8" />
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                        </svg>
                    )}
                    {tab}
                </button>
            ))}
        </div>
    );
}