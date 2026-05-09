import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Shield } from 'lucide-react';
import { ToolCopyButton, ToolInput } from '../../../components/ToolUI';
import { actions } from '../jwtReducer';

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

export default function SignatureVerification({ state, dispatch, verifySignature }) {
  return (
    <div
      style={{
        padding: '1rem',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        flex: '0 1 auto',
      }}
    >
      <h3
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1rem',
          color: 'var(--foreground)',
        }}
      >
        Signature Verification (Optional)
      </h3>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--muted-foreground)',
          marginBottom: '1rem',
        }}
      >
        Enter the secret used to sign the JWT below to verify the signature.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 400,
              color: 'var(--muted-foreground)',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
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
                width: '100%',
              }}
            />
          </div>
        </div>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 400,
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            Encoding
          </label>
          <select
            value={state.encoding}
            onChange={(e) => dispatch(actions.setEncoding(e.target.value))}
            id="encoding-select"
            className={selectClass}
          >
            <option value="utf-8">UTF-8</option>
            <option value="base64">Base64</option>
          </select>
        </div>
      </div>

      {state.validationMessage && (
        <div
          style={{
            paddingTop: '.5rem',
            backgroundColor: 'var(--muted)',
            borderRadius: '4px',
            fontSize: '0.875rem',
            color: 'var(--muted-foreground)',
          }}
        >
          {state.validationMessage}
        </div>
      )}

      <Button variant="default" onClick={verifySignature} style={{ marginTop: '1rem' }}>
        <Shield size={14} />
        Verify Signature
      </Button>
    </div>
  );
}
