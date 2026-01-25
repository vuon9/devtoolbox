import React from 'react';
import { ToolLayout, ToolTextArea, ToolInputGroup } from '../../../components/ToolUI';
import { actions } from '../jwtReducer';
import { ErrorMessage, SuccessMessage } from './StatusMessages';
import SignatureVerification from './SignatureVerification';

export default function JwtDecode({ state, dispatch, layout, verifySignature }) {
    // Tab change handlers
    const handleHeaderTabChange = (tab) => dispatch(actions.setTab('header', tab));
    const handlePayloadTabChange = (tab) => dispatch(actions.setTab('payload', tab));

    return (
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
                <SignatureVerification
                    state={state}
                    dispatch={dispatch}
                    verifySignature={verifySignature}
                />
            </div>
        </ToolLayout>
    );
}
