import { useState } from 'react';
import { CopyButton, TextInput } from '@carbon/react';

const HASH_DISPLAY_ORDER = [
    'MD5', 'SHA-1', 'SHA-224', 'SHA-256', 'SHA-384', 'SHA-512',
    'SHA-3 (Keccak)', 'BLAKE2b', 'BLAKE3', 'RIPEMD-160',
    'CRC32', 'Adler-32', 'MurmurHash3', 'xxHash', 'FNV-1a',
];

export default function MultiHashOutput({ value, error, onCopy }) {
    const [copiedHash, setCopiedHash] = useState(null);

    if (error) {
        return (
            <div style={{
                padding: '1rem',
                color: 'var(--cds-text-error)',
                backgroundColor: 'var(--cds-layer)'
            }}>
                {error}
            </div>
        );
    }

    if (!value) {
        return (
            <div style={{
            }}>
            </div>
        );
    }

    let hashes;
    try {
        hashes = JSON.parse(value);
    } catch (e) {
        return (
            <div style={{
                padding: '1rem',
                color: 'var(--cds-text-error)',
                backgroundColor: 'var(--cds-layer)'
            }}>
                Error parsing hash results: {e.message}
            </div>
        );
    }

    const handleCopy = (hashName, hashValue) => {
        navigator.clipboard.writeText(hashValue);
        setCopiedHash(hashName);
        setTimeout(() => setCopiedHash(null), 2000);
        if (onCopy) onCopy(hashName, hashValue);
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '0.75rem',
            maxHeight: '80vh',
            overflowY: 'auto',
        }}>
            {HASH_DISPLAY_ORDER.map((hashName) => {
                const hashValue = hashes[hashName];
                if (!hashValue) return null;

                const isError = hashValue.startsWith('Error:');

                return (
                    <div
                        key={hashName}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <span style={{
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                color: 'var(--cds-text-primary)',
                            }}>
                                {hashName}
                            </span>
                            <CopyButton
                                onClick={() => handleCopy(hashName, hashValue)}
                                feedback={copiedHash === hashName ? 'Copied!' : 'Copy'}
                                feedbackTimeout={2000}
                            />
                        </div>
                        <TextInput
                            id={`hash-${hashName}`}
                            labelText={hashName}
                            hideLabel
                            value={hashValue}
                            readOnly
                            style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: '12px',
                                backgroundColor: 'var(--cds-field)',
                                border: '1px solid var(--cds-border-subtle)',
                                color: isError ? 'var(--cds-text-error)' : 'var(--cds-text-primary)',
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
