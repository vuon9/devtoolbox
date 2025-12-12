import React, { useReducer, useCallback } from 'react';
import { Button, TextArea, Select, SelectItem } from '@carbon/react';
import { Copy, CheckmarkFilled, CloseFilled } from '@carbon/icons-react';
import { ToolHeader } from '../components/ToolUI';

// Reusable Tab Component
const TabBar = ({ tabs, activeTab, onChange }) => (
    <div style={{
        display: 'flex',
        gap: '1rem',
        paddingBottom: '0.25rem',
        height: '28px',
        alignItems: 'center'
    }}>
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
                    transition: 'all 0.2s'
                }}
            >
                {tab}
            </button>
        ))}
    </div>
);

// Reusable JSON Display with Copy Button
const ParsedContentDisplay = ({ label, data, onCopy, withJson }) => (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row-reverse' }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
        }}>
            <Button
                hasIconOnly
                renderIcon={Copy}
                kind="ghost"
                size="sm"
                onClick={() => onCopy(data ? (withJson ? JSON.stringify(data, null, 2) : data) : '')}
            />
        </div>
        <TextArea
            value={data ? (
                withJson
                    ? JSON.stringify(data, null, 2)
                    : Object.entries(data).map(([k, v]) => (`${k}: ${JSON.stringify(v)}`)).join("\n")
            ) : ''}
            readOnly
            style={{
                flex: 1,
                minHeight: '100px',
                padding: '0.75rem',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.875rem',
                border: '1px solid var(--cds-border-strong)',
                backgroundColor: 'var(--cds-ui-01)',
                color: 'var(--cds-text-primary)',
            }}
        />
    </div>
);

// Reusable Tab Section (JSON + Claims)
const TabSection = ({ title, data, activeTab, onTabChange, onCopy }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minHeight: 0,
        flex: '0 1 auto'
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid var(--cds-border-subtle)'
        }}>
            <label style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--cds-text-primary)',
            }}>
                {title}
            </label>
        </div>
        <TabBar tabs={['JSON', 'Claims']} activeTab={activeTab} onChange={onTabChange} />
        {activeTab === 0 ? (
            <ParsedContentDisplay label={``} data={data} onCopy={onCopy} withJson={true} />
        ) : (
            <ParsedContentDisplay label={``} data={data} onCopy={onCopy} />
        )}
    </div>
);

// Reducer for JWT state management
const jwtReducer = (state, action) => {
    switch (action.type) {
        case 'SET_TOKEN':
            return { ...state, token: action.payload };
        case 'SET_DECODED':
            return {
                ...state,
                header: action.payload.header,
                payload: action.payload.payload,
                signature: action.payload.signature,
                error: action.payload.error,
                isValid: action.payload.isValid
            };
        case 'SET_SECRET':
            return { ...state, secret: action.payload };
        case 'SET_ENCODING':
            return { ...state, encoding: action.payload };
        case 'SET_TAB':
            return {
                ...state,
                [action.payload.section + 'Tab']: action.payload.tab
            };
        case 'SET_VALIDATION':
            return {
                ...state,
                validationMessage: action.payload.message,
                isValid: action.payload.isValid
            };
        default:
            return state;
    }
};

export default function JwtDebugger() {
    const [state, dispatch] = useReducer(jwtReducer, {
        token: '',
        header: null,
        payload: null,
        signature: '',
        secret: '',
        error: '',
        validationMessage: '',
        isValid: null,
        encoding: 'utf-8',
        headerTab: 0,
        payloadTab: 0
    });

    // Decode JWT when token changes
    React.useEffect(() => {
        if (!state.token.trim()) {
            dispatch({ type: 'SET_DECODED', payload: { header: null, payload: null, signature: '', error: '', isValid: null } });
            return;
        }

        const parts = state.token.split('.');
        if (parts.length !== 3) {
            dispatch({
                type: 'SET_DECODED',
                payload: {
                    header: null,
                    payload: null,
                    signature: '',
                    error: 'Invalid JWT structure: must have 3 parts separated by dots.',
                    isValid: false
                }
            });
            return;
        }

        try {
            const decode = (str) => JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
            dispatch({
                type: 'SET_DECODED',
                payload: {
                    header: decode(parts[0]),
                    payload: decode(parts[1]),
                    signature: parts[2],
                    error: '',
                    isValid: true
                }
            });
        } catch (e) {
            dispatch({
                type: 'SET_DECODED',
                payload: {
                    header: null,
                    payload: null,
                    signature: '',
                    error: 'Failed to decode Base64URL sections. Check if the token is valid.',
                    isValid: false
                }
            });
        }
    }, [state.token]);

    const handleCopy = useCallback((text) => {
        navigator.clipboard.writeText(text);
    }, []);

    const verifySignature = useCallback(() => {
        if (!state.token || !state.secret) {
            dispatch({ type: 'SET_VALIDATION', payload: { message: 'Please paste a token and enter a secret to verify', isValid: null } });
            return;
        }

        const parts = state.token.split('.');
        if (parts.length !== 3) {
            dispatch({ type: 'SET_VALIDATION', payload: { message: 'Invalid JWT structure', isValid: false } });
            return;
        }

        try {
            // Simplified verification - in production use proper HMAC-SHA256
            dispatch({ type: 'SET_VALIDATION', payload: { message: 'Signature verification (would require proper HMAC-SHA256 backend)', isValid: null } });
        } catch (e) {
            dispatch({ type: 'SET_VALIDATION', payload: { message: 'Error verifying signature', isValid: false } });
        }
    }, [state.token, state.secret]);

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ToolHeader
                title="JWT Debugger"
                description="Paste a JWT below that you'd like to decode, validate, and verify."
            />

            {/* Main Layout: Encoded Token on Left, Header/Payload/Signature on Right */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                flex: 1,
                minHeight: 0
            }}>
                {/* Left: Encoded Token */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    minHeight: 0
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid var(--cds-border-subtle)'
                    }}>
                        <label style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: 'var(--cds-text-primary)',
                        }}>
                            Encoded Token
                        </label>
                    </div>
                    <TextArea
                        value={state.token}
                        onChange={(e) => dispatch({ type: 'SET_TOKEN', payload: e.target.value })}
                        placeholder="Paste your JWT here..."
                        style={{
                            flex: 1,
                            minHeight: '500px'
                        }}
                    />
                    {/* Status Message below textarea */}
                    {state.error && (
                        <div style={{
                            paddingTop: '0.5rem',
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
                            {state.error}
                        </div>
                    )}

                    {state.isValid === true && !state.error && (
                        <div style={{
                            paddingTop: '0.5rem',
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
                    )}
                </div>

                {/* Right: Header, Payload, and Signature Verification stacked */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    minHeight: 0,
                    overflow: 'auto'
                }}>
                    <TabSection
                        title="Header"
                        data={state.header}
                        activeTab={state.headerTab}
                        onTabChange={(tab) => dispatch({ type: 'SET_TAB', payload: { section: 'header', tab } })}
                        onCopy={handleCopy}
                    />

                    <TabSection
                        title="Payload"
                        data={state.payload}
                        activeTab={state.payloadTab}
                        onTabChange={(tab) => dispatch({ type: 'SET_TAB', payload: { section: 'payload', tab } })}
                        onCopy={handleCopy}
                    />

                    {/* Signature Verification Section */}
                    <div style={{
                        padding: '1rem',
                        border: '1px solid var(--cds-border-subtle)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--cds-layer-accent)',
                        flex: '0 1 auto'
                    }}>
                        <h3 style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: '1rem',
                            color: 'var(--cds-text-primary)'
                        }}>
                            Signature Verification (Optional)
                        </h3>
                        <p style={{
                            fontSize: '0.875rem',
                            color: 'var(--cds-text-secondary)',
                            marginBottom: '1rem'
                        }}>
                            Enter the secret used to sign the JWT below to verify the signature.
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 150px',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: 400,
                                    color: 'var(--cds-text-secondary)',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.5rem'
                                }}>
                                    Secret
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="password"
                                        value={state.secret}
                                        onChange={(e) => dispatch({ type: 'SET_SECRET', payload: e.target.value })}
                                        placeholder="Enter secret..."
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem 0.75rem',
                                            fontFamily: "'IBM Plex Mono', monospace",
                                            fontSize: '0.875rem',
                                            border: '1px solid var(--cds-border-strong)',
                                            borderRadius: '4px',
                                            backgroundColor: 'var(--cds-ui-01)',
                                            color: 'var(--cds-text-primary)'
                                        }}
                                    />
                                    <Button
                                        hasIconOnly
                                        renderIcon={Copy}
                                        kind="ghost"
                                        size="sm"
                                        onClick={() => state.secret && handleCopy(state.secret)}
                                        tooltipPosition='left'
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: 400,
                                    color: 'var(--cds-text-secondary)',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.5rem'
                                }}>
                                    Encoding
                                </label>
                                <Select
                                    value={state.encoding}
                                    noLabel={true}
                                    onChange={(e) => dispatch({ type: 'SET_ENCODING', payload: e.target.value })}
                                    id="encoding-select"
                                >
                                    <SelectItem value="utf-8" text="UTF-8" />
                                    <SelectItem value="base64" text="Base64" />
                                </Select>
                            </div>
                        </div>

                        {state.validationMessage && (
                            <div style={{
                                padding: '0.75rem',
                                backgroundColor: 'var(--cds-ui-02)',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                color: 'var(--cds-text-secondary)',
                                marginBottom: '1rem'
                            }}>
                                {state.validationMessage}
                            </div>
                        )}

                        <Button
                            kind="primary"
                            size="sm"
                            onClick={verifySignature}
                        >
                            Verify Signature
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
