import { ToolLayout, ToolTextArea, ToolInputGroup } from '../../../components/ToolUI';
import { actions } from '../jwtReducer';
import { ErrorMessage, SuccessMessage } from './StatusMessages';
import SignatureVerification from './SignatureVerification';
import { Button } from '@carbon/react';
import { MagicWand } from '@carbon/icons-react';
import { generateExampleToken, EXAMPLE_SECRET } from '../jwtUtils';
import { useCallback } from 'react';
import { Backend } from '../../../utils/backendBridge';

export default function JwtDecode({ state, dispatch, layout, verifySignature }) {
    // Tab change handlers
    const handleHeaderTabChange = (tab) => dispatch(actions.setTab('header', tab));
    const handlePayloadTabChange = (tab) => dispatch(actions.setTab('payload', tab));

    const handleGenerateExample = useCallback(async () => {
        const header = { alg: 'HS256', typ: 'JWT' };
        const payload = {
            sub: '1234567890',
            name: 'John Doe',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
        };

        try {
            const response = await Backend.JWTService.Encode(
                JSON.stringify(header),
                JSON.stringify(payload),
                'HS256',
                EXAMPLE_SECRET
            );

            if (response.token) {
                dispatch(actions.generateExample(response.token, EXAMPLE_SECRET));
            }
        } catch (err) {
            console.error("Failed to generate sample token", err);
        }
    }, []);

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

                <div style={{ marginTop: '.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        kind="secondary"
                        size="md"
                        renderIcon={MagicWand}
                        onClick={handleGenerateExample}
                        style={{ flexShrink: 0, justifyContent: 'flex-end' }}
                    >
                        Sample
                    </Button>
                </div>

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
