import React from 'react';
import { Search, Edit } from '@carbon/icons-react';

const ModeTabBar = ({ activeMode, onChange }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--cds-layer-02)',
        borderRadius: '20px',
        padding: '4px',
        width: 'fit-content',
        minHeight: '40px',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
        {[
            { label: 'Decode', icon: Search },
            { label: 'Encode', icon: Edit }
        ].map((tab, idx) => {
            const isActive = activeMode === idx;
            const Icon = tab.icon;
            return (
                <button
                    key={idx}
                    onClick={() => onChange(idx)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 20px',
                        background: isActive ? 'var(--cds-layer)' : 'transparent',
                        border: 'none',
                        borderRadius: '16px',
                        color: isActive ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.15)' : 'none',
                        minWidth: '120px',
                        justifyContent: 'center',
                        position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                        if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'var(--cds-layer-hover)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }
                    }}
                >
                    <Icon size={16} />
                    {tab.label}
                </button>
            );
        })}
    </div>
);

export default ModeTabBar;
