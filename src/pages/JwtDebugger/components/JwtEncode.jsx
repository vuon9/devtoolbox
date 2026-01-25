import React from 'react';
import { Button, Select, SelectItem } from '@carbon/react';
import { Code } from '@carbon/icons-react';
import { ToolLayout, ToolTextArea, ToolInputGroup, ToolCopyButton } from '../../../components/ToolUI';
import { actions } from '../jwtReducer';
import { ErrorMessage } from './StatusMessages';

export default function JwtEncode({ state, dispatch, layout, encodeJWT }) {
    // Tab change handlers
    const handleEncodeHeaderTabChange = (tab) => dispatch(actions.setTab('encodeHeader', tab));
    const handleEncodePayloadTabChange = (tab) => dispatch(actions.setTab('encodePayload', tab));

    return (
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
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-start' }}>
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
    );
}
