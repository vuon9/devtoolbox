import React, { useEffect, useReducer, useCallback } from 'react';
import { ToolHeader } from '../../components/ToolUI';
import useLayoutToggle from '../../hooks/useLayoutToggle';
import ToolLayoutToggle from '../../components/layout/ToolLayoutToggle';
import { jwtReducer, initialState, actions } from './jwtReducer';
import ModeTabBar from './components/ModeTabBar';
import JwtDecode from './components/JwtDecode';
import JwtEncode from './components/JwtEncode';
import { JWTService } from '../../../bindings/devtoolbox/service';

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
    useEffect(() => {
        if (!state.token.trim()) {
            dispatch(actions.setDecoded({ header: null, payload: null, signature: '', error: '', isValid: null }));
            return;
        }

        // Call Go backend for decoding
        const decodeToken = async () => {
            try {
                const response = await JWTService.Decode(state.token);

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
            const response = await JWTService.Verify(state.token, state.secret, state.encoding);

            dispatch(actions.setValidation(
                response.error ? response.error : response.validationMessage,
                response.isValid
            ));
        } catch (err) {
            dispatch(actions.setValidation(`Backend error: ${err.message}`, false));
        }
    }, [state.token, state.secret, state.encoding]);

    const encodeJWT = useCallback(async () => {
        // Basic validation
        if (!state.headerInput.trim() && !state.payloadInput.trim()) {
            dispatch(actions.setEncodeResult('', 'Please provide header or payload JSON'));
            return;
        }

        try {
            const response = await JWTService.Encode(
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
            </div>

            {/* Row with mode tabs and layout toggle */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
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
                <JwtDecode
                    state={state}
                    dispatch={dispatch}
                    layout={layout}
                    verifySignature={verifySignature}
                />
            )}

            {/* Encode Mode */}
            {state.mode === 'encode' && (
                <JwtEncode
                    state={state}
                    dispatch={dispatch}
                    layout={layout}
                    encodeJWT={encodeJWT}
                />
            )}
        </div>
    );
}