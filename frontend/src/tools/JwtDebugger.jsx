import React, { useReducer, useCallback } from 'react';
import { Button, Select, SelectItem } from '@carbon/react';
import { CheckmarkFilled, CloseFilled, MagicWand, Security, Code, Search, Edit } from '@carbon/icons-react';
import { ToolHeader, ToolControls, ToolLayout, ToolTextArea, ToolInputGroup, ToolCopyButton, LAYOUT_DIRECTIONS } from '../components/ToolUI';
import useLayoutToggle from '../hooks/useLayoutToggle';
import ToolLayoutToggle from '../components/layout/ToolLayoutToggle';
import { jwtReducer, initialState, actions } from './jwtReducer';
import { generateExampleToken, EXAMPLE_SECRET } from './jwtUtils';

export default function JwtDebugger() {
    const [state, dispatch] = useReducer(jwtReducer, initialState);

    // Single layout toggle for both decode and encode modes
    const layout = useLayoutToggle({
        toolKey: 'jwt-debugger-layout',
        defaultDirection: 'horizontal',
        showToggle: true,
        persist: true
    });

    // Decode JWT when token changes (using Go backend)
    React.useEffect(() => {
        if (!state.token.trim()) {
            dispatch(actions.setDecoded({ header: null, payload: null, signature: '', error: '', isValid: null }));
            return;
        }

        // Call Go backend for decoding
        const decodeToken = async () => {
            try {
                const response = await window.go.main.JWTService.Decode(state.token);
                
                dispatch(actions.setDecoded({
                    header: response.header,
                    payload: response.payload,
                    signature: response.signature,
                    error: response.error,
                    isValid: response.valid
                }));
            } catch (err) {
                dispatch(actions.setDecoded({
                    header: null,
                    payload: null,
                    signature: '',
                    error: `Backend error: ${err.message}`,
                    isValid: false
                }));
            }
        };

        decodeToken();
    }, [state.token]);

    const handleCopy = useCallback((text) => {
        navigator.clipboard.writeText(text);
    }, []);

    const verifySignature = useCallback(async () => {
        if (!state.token || !state.secret) {
            dispatch(actions.setValidation('Please paste a token and enter a secret to verify', null));
            return;
        }

        const parts = state.token.split('.');
        if (parts.length !== 3) {
            dispatch(actions.setValidation('Invalid JWT structure', false));
            return;
        }

        try {
            // Call Go backend for verification
            const response = await window.go.main.JWTService.Verify(state.token, state.secret, state.encoding);
            
            dispatch(actions.setValidation(
                response.error ? response.error : response.validationMessage,
                response.isValid
            ));
        } catch (err) {
            dispatch(actions.setValidation(`Backend error: ${err.message}`, false));
        }
    }, [state.token, state.secret, state.encoding]);

    const handleGenerateExample = useCallback(() => {
        const token = generateExampleToken();
        dispatch(actions.generateExample(token, EXAMPLE_SECRET));
    }, []);

    const encodeJWT = useCallback(async () => {
        // Basic validation
        if (!state.headerInput.trim() && !state.payloadInput.trim()) {
            dispatch(actions.setEncodeResult('', 'Please provide header or payload JSON'));
            return;
        }

        try {
            const response = await window.go.main.JWTService.Encode(
                state.headerInput,
                state.payloadInput,
                state.algorithm,
                state.secret
            );
            
            if (response.error) {
                dispatch(actions.setEncodeResult('', response.error));
            } else {
                dispatch(actions.setEncodeResult(response.token, ''));
            }
        } catch (err) {
            dispatch(actions.setEncodeResult('', `Backend error: ${err.message}`));
        }
    }, [state.headerInput, state.payloadInput, state.algorithm, state.secret]);

    // Tab change handlers
    const handleHeaderTabChange = (tab) => dispatch(actions.setTab('header', tab));
    const handlePayloadTabChange = (tab) => dispatch(actions.setTab('payload', tab));
    const handleEncodeHeaderTabChange = (tab) => dispatch(actions.setTab('encodeHeader', tab));
    const handleEncodePayloadTabChange = (tab) => dispatch(actions.setTab('encodePayload', tab));

    // Status message components
    const ErrorMessage = ({ error }) => error ? (
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

    const SuccessMessage = ({ isValid }) => isValid === true ? (
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

    // Custom mode tab bar with distinct styling
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

    return (
        <div className="tool-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            {/* Header row with title and conditional button */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <ToolHeader
                    title="JWT Debugger"
                    description={state.mode === 'decode' 
                        ? "Paste a JWT below that you'd like to decode, validate, and verify."
                        : "Create a JWT by providing header and payload JSON, algorithm, and secret."
                    }
                />
                {state.mode === 'decode' && (
                    <Button
                        kind="secondary"
                        size="md"
                        renderIcon={MagicWand}
                        onClick={handleGenerateExample}
                        style={{ flexShrink: 0, marginRight: '2rem' }}
                    >
                        Generate Example
                    </Button>
                )}
            </div>

            {/* Row with mode tabs and layout toggle */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
            }}>
                <ModeTabBar 
                    activeMode={state.mode === 'decode' ? 0 : 1} 
                    onChange={(tab) => dispatch(actions.setMode(tab === 0 ? 'decode' : 'encode'))} 
                />
                {layout.showToggle && (
                    <ToolLayoutToggle
                        direction={layout.direction}
                        onToggle={layout.toggleDirection}
                        position="controls"
                        style={{ marginLeft: 'auto' }}
                    />
                )}
            </div>

            {/* Decode Mode */}
            {state.mode === 'decode' && (
                 <>
                     <ToolLayout
                        toolKey="jwt-debugger-decode"
                        direction={layout.direction}
                        onToggle={layout.toggleDirection}
                        showToggle={false}
                        persist={true}
                        togglePosition="top-right"
                        equalHeight={true}
                        style={{ flex: 1, minHeight: 0 }}
                    >
                        {/* Left: Encoded Token Input */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                            <ToolTextArea
                                label="Encoded Token"
                                value={state.token}
                                onChange={(e) => dispatch(actions.setToken(e.target.value))}
                                placeholder="Paste your JWT here..."
                                resizeHeight={true}
                                resizeWidth={false}
                                monospace={true}
                                showCopyButton={true}
                                style={{ flex: 1 }}
                            />
                            
                            {/* Status Messages */}
                            <ErrorMessage error={state.error} />
                            <SuccessMessage isValid={state.isValid} />
                        </div>

                        {/* Right: Header, Payload, and Verification stacked */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                            {/* Header */}
                            <ToolInputGroup
                                title="Header"
                                tabs={['JSON', 'Claims']}
                                activeTab={state.headerTab}
                                onTabChange={handleHeaderTabChange}
                                data={state.header}
                                editable={false}
                                showCopyButton={true}
                                style={{ flex: 1 }}
                            />

                            {/* Payload */}
                            <ToolInputGroup
                                title="Payload"
                                tabs={['JSON', 'Claims']}
                                activeTab={state.payloadTab}
                                onTabChange={handlePayloadTabChange}
                                data={state.payload}
                                editable={false}
                                showCopyButton={true}
                                style={{ flex: 1 }}
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
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ flex: '1 1 200px' }}>
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
                                                onChange={(e) => dispatch(actions.setSecret(e.target.value))}
                                                placeholder="Enter secret..."
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem 0.75rem',
                                                    fontFamily: "'IBM Plex Mono', monospace",
                                                    fontSize: '0.875rem',
                                                    border: '1px solid var(--cds-border-strong)',
                                                    borderRadius: '4px',
                                                    backgroundColor: 'var(--cds-ui-01)',
                                                    color: 'var(--cds-text-primary)',
                                                    width: '100%'
                                                }}
                                            />
                                            <ToolCopyButton
                                                text={state.secret}
                                                disabled={!state.secret}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ flex: '0 1 150px' }}>
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
                                            onChange={(e) => dispatch(actions.setEncoding(e.target.value))}
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
                                    size="md"
                                    renderIcon={Security}
                                    onClick={verifySignature}
                                    style={{ marginTop: '1rem' }}
                                >
                                    Verify Signature
                                </Button>
                            </div>
                        </div>
                    </ToolLayout>
                </>
            )}

            {/* Encode Mode */}
            {state.mode === 'encode' && (
                <>
                    <ToolLayout 
                        toolKey="jwt-debugger-encode"
                        direction={layout.direction}
                        onToggle={layout.toggleDirection}
                        showToggle={false}
                        persist={true}
                        togglePosition="top-right"
                        equalHeight={true}
                        style={{ flex: 1, minHeight: 0 }}
                    >
                        {/* Left: Header and Payload Inputs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                            <ToolInputGroup
                                title="Header"
                                tabs={['JSON', 'Claims']}
                                activeTab={state.encodeHeaderTab}
                                onTabChange={handleEncodeHeaderTabChange}
                                value={state.headerInput}
                                onChange={(value) => dispatch(actions.setHeaderInput(value))}
                                editable={true}
                                showCopyButton={true}
                                style={{ flex: 1 }}
                            />

                            <ToolInputGroup
                                title="Payload"
                                tabs={['JSON', 'Claims']}
                                activeTab={state.encodePayloadTab}
                                onTabChange={handleEncodePayloadTabChange}
                                value={state.payloadInput}
                                onChange={(value) => dispatch(actions.setPayloadInput(value))}
                                editable={true}
                                showCopyButton={true}
                                style={{ flex: 1 }}
                            />

                            {/* Signing Configuration */}
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
                                    Signing Configuration
                                </h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.75rem',
                                            fontWeight: 400,
                                            color: 'var(--cds-text-secondary)',
                                            textTransform: 'uppercase',
                                            marginBottom: '0.5rem'
                                        }}>
                                            Algorithm
                                        </label>
                                        <Select
                                            value={state.algorithm}
                                            noLabel={true}
                                            onChange={(e) => dispatch(actions.setAlgorithm(e.target.value))}
                                            id="algorithm-select"
                                        >
                                            <SelectItem value="HS256" text="HS256" />
                                            <SelectItem value="HS384" text="HS384" />
                                            <SelectItem value="HS512" text="HS512" />
                                        </Select>
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
                                            Secret (Optional - leave empty for unsigned)
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="password"
                                                value={state.secret}
                                                onChange={(e) => dispatch(actions.setSecret(e.target.value))}
                                                placeholder="Enter secret for signing..."
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
                                            <ToolCopyButton
                                                text={state.secret}
                                                disabled={!state.secret}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        kind="primary"
                                        size="md"
                                        renderIcon={Code}
                                        onClick={encodeJWT}
                                    >
                                        Encode JWT
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Encoded Token Output */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                            <ToolTextArea
                                label="Encoded Token"
                                value={state.encodedToken}
                                readOnly={true}
                                placeholder="Encoded JWT will appear here..."
                                resizeHeight={true}
                                resizeWidth={false}
                                monospace={true}
                                showCopyButton={true}
                                style={{ flex: 1 }}
                            />
                            
                            {/* Error Message */}
                            <ErrorMessage error={state.error} />
                        </div>
                    </ToolLayout>
                </>
            )}
        </div>
    );
}