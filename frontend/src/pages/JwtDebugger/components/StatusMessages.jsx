import React from 'react';
import { CheckmarkFilled, CloseFilled } from '@carbon/icons-react';

export const ErrorMessage = ({ error }) => error ? (
    <div style={{
        padding: '0.5rem',
        backgroundColor: 'var(--cds-support-error-light)',
        color: 'var(--cds-support-error)',
        borderRadius: '4px',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexShrink: 0
    }}>
        <CloseFilled size={16} />
        {error}
    </div>
) : null;

export const SuccessMessage = ({ isValid }) => isValid === true ? (
    <div style={{
        padding: '0.5rem',
        backgroundColor: 'var(--cds-support-success-light)',
        color: 'var(--cds-support-success)',
        borderRadius: '4px',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexShrink: 0
    }}>
        <CheckmarkFilled size={16} />
        Valid JWT structure
    </div>
) : null;
