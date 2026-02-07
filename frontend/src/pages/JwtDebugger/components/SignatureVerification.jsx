import React from 'react';
import { Button, Select, SelectItem } from '@carbon/react';
import { Security } from '@carbon/icons-react';
import { ToolCopyButton, ToolInput } from '../../../components/ToolUI';
import { actions } from '../jwtReducer';

export default function SignatureVerification({ state, dispatch, verifySignature }) {
    return (
        <div style={{
            padding: '1rem',
            border: '1px solid var(--cds-border-subtle)',
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
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 400,
                        color: 'var(--cds-text-secondary)',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase'
                    }}>
                        Secret
                    </label>
                    <div style={{ display: 'flex' }}>
                        <ToolInput
                            type="password"
                            value={state.secret}
                            onChange={(e) => dispatch(actions.setSecret(e.target.value))}
                            placeholder="Enter secret..."
                            style={{
                                flex: 1,
                                width: '100%'
                            }}
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
                    paddingTop: '.5rem',
                    backgroundColor: 'var(--cds-ui-02)',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    color: 'var(--cds-text-secondary)',
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
    );
}
