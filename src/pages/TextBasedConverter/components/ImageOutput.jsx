import React, { useState } from 'react';
import { Button, CopyButton } from '@carbon/react';
import { Download, Copy } from '@carbon/icons-react';

export function isBase64Image(str) {
    // Check if string looks like a base64 image
    if (!str || typeof str !== 'string') return false;

    // Check for data URI format
    if (str.startsWith('data:image/')) {
        return true;
    }

    // Check for raw base64 that might be an image
    // Common image signatures in base64
    const imageSignatures = [
        '/9j/',     // JPEG
        'iVBORw0KGgo', // PNG
        'R0lGOD',   // GIF
        'Qk02',     // BMP
        'SUQz',     // MP3 (not image, but sometimes confused)
    ];

    // Check if it's a reasonable length for an image (at least 100 chars)
    if (str.length < 100) return false;

    // Check for image signatures at the start
    const trimmed = str.trim();
    return imageSignatures.some(sig => trimmed.startsWith(sig));
}

export function getImageSrc(str) {
    if (str.startsWith('data:image/')) {
        return str;
    }
    // Try to detect format and construct data URI
    const trimmed = str.trim();

    if (trimmed.startsWith('/9j/')) {
        return `data:image/jpeg;base64,${trimmed}`;
    } else if (trimmed.startsWith('iVBORw0KGgo')) {
        return `data:image/png;base64,${trimmed}`;
    } else if (trimmed.startsWith('R0lGOD')) {
        return `data:image/gif;base64,${trimmed}`;
    } else if (trimmed.startsWith('Qk02')) {
        return `data:image/bmp;base64,${trimmed}`;
    }

    // Default to PNG if can't detect
    return `data:image/png;base64,${trimmed}`;
}

export default function ImageOutput({ value, onCopy }) {
    const [copyFeedback, setCopyFeedback] = useState('Copy');

    if (!value) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cds-text-secondary)',
                fontStyle: 'italic',
            }}>
                Enter base64 image data...
            </div>
        );
    }

    const imageSrc = getImageSrc(value);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = 'image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopyFeedback('Copied!');
        setTimeout(() => setCopyFeedback('Copy'), 2000);
        if (onCopy) onCopy();
    };

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            {/* Header with actions */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 0 0.5rem 0',
                borderBottom: '1px solid var(--cds-border-subtle)',
                marginBottom: '0.5rem',
            }}>
                <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--cds-text-secondary)',
                    textTransform: 'uppercase',
                }}>
                    Image Preview
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                        kind="ghost"
                        size="sm"
                        renderIcon={Copy}
                        onClick={handleCopy}
                    >
                        {copyFeedback}
                    </Button>
                    <Button
                        kind="primary"
                        size="sm"
                        renderIcon={Download}
                        onClick={handleDownload}
                    >
                        Download
                    </Button>
                </div>
            </div>

            {/* Image display */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
                backgroundColor: 'var(--cds-field)',
                borderRadius: '4px',
                padding: '1rem',
            }}>
                <img
                    src={imageSrc}
                    alt="Base64 decoded"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
                <div style={{
                    display: 'none',
                    color: 'var(--cds-text-error)',
                    textAlign: 'center',
                }}>
                    Failed to load image. The base64 data may be invalid.
                </div>
            </div>
        </div>
    );
}
