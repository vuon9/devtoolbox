import React, { useState, useEffect } from 'react';
import { Button } from '@carbon/react';
import { Download, Copy, Warning } from '@carbon/icons-react';

export function isBase64Image(str) {
    if (!str || typeof str !== 'string') return false;
    
    const trimmed = str.trim();
    
    // Check for data URI format
    if (trimmed.startsWith('data:image/')) {
        return true;
    }
    
    // Remove common prefixes that might be present
    let cleanStr = trimmed;
    if (cleanStr.startsWith('data:')) {
        // Try to extract base64 part after comma
        const commaIndex = cleanStr.indexOf(',');
        if (commaIndex !== -1) {
            cleanStr = cleanStr.substring(commaIndex + 1);
        }
    }
    
    // Remove whitespace and newlines
    cleanStr = cleanStr.replace(/\s/g, '');
    
    // Check minimum length
    if (cleanStr.length < 50) return false;
    
    // Check if it's valid base64 characters
    const base64Pattern = /^[A-Za-z0-9+/=_-]+$/;
    if (!base64Pattern.test(cleanStr)) return false;
    
    // Common image signatures in base64
    const imageSignatures = [
        '/9j/',         // JPEG
        'iVBORw0KGgo', // PNG  
        'R0lGOD',       // GIF
        'Qk0',          // BMP
        'SUQz',         // MP3
        'TVqQ',         // EXE (not image, but common)
    ];
    
    // Also check for data URI with base64
    if (trimmed.includes('data:image') && trimmed.includes('base64')) {
        return true;
    }
    
    return imageSignatures.some(sig => cleanStr.startsWith(sig));
}

export function getImageSrc(str) {
    const trimmed = str.trim();
    
    // If it's already a data URI, return as-is
    if (trimmed.startsWith('data:image/')) {
        return trimmed;
    }
    
    // Remove whitespace and newlines
    let cleanStr = trimmed.replace(/\s/g, '');
    
    // Try to detect format
    if (cleanStr.startsWith('/9j/')) {
        return `data:image/jpeg;base64,${cleanStr}`;
    } else if (cleanStr.startsWith('iVBORw0KGgo')) {
        return `data:image/png;base64,${cleanStr}`;
    } else if (cleanStr.startsWith('R0lGOD')) {
        return `data:image/gif;base64,${cleanStr}`;
    } else if (cleanStr.startsWith('Qk0')) {
        return `data:image/bmp;base64,${cleanStr}`;
    }
    
    // Default to PNG
    return `data:image/png;base64,${cleanStr}`;
}

export function validateBase64(str) {
    try {
        // Remove whitespace and data URI prefix
        let cleanStr = str.trim().replace(/\s/g, '');
        
        if (cleanStr.startsWith('data:')) {
            const commaIndex = cleanStr.indexOf(',');
            if (commaIndex !== -1) {
                cleanStr = cleanStr.substring(commaIndex + 1);
            }
        }
        
        // Try to decode
        atob(cleanStr);
        return { valid: true, error: null };
    } catch (e) {
        return { valid: false, error: e.message };
    }
}

export default function ImageOutput({ value, onCopy }) {
    const [copyFeedback, setCopyFeedback] = useState('Copy');
    const [loadError, setLoadError] = useState(false);
    const [validation, setValidation] = useState({ valid: true, error: null });
    
    useEffect(() => {
        if (value) {
            setLoadError(false);
            setValidation(validateBase64(value));
        }
    }, [value]);

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
        
        // Determine file extension from data
        let extension = 'png';
        if (value.includes('jpeg') || value.includes('jpg') || value.startsWith('/9j/')) {
            extension = 'jpg';
        } else if (value.includes('gif') || value.startsWith('R0lGOD')) {
            extension = 'gif';
        } else if (value.includes('bmp') || value.startsWith('Qk0')) {
            extension = 'bmp';
        }
        
        link.download = `image.${extension}`;
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
                        disabled={loadError}
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
                {!validation.valid ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--cds-text-error)',
                        textAlign: 'center',
                    }}>
                        <Warning size={32} />
                        <div>Invalid Base64 Data</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                            {validation.error}
                        </div>
                    </div>
                ) : loadError ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--cds-text-error)',
                        textAlign: 'center',
                    }}>
                        <Warning size={32} />
                        <div>Failed to load image</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                            The base64 data may be corrupted or not an image
                        </div>
                        <div style={{ 
                            fontSize: '0.625rem', 
                            color: 'var(--cds-text-secondary)',
                            maxWidth: '300px',
                            wordBreak: 'break-all',
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            backgroundColor: 'var(--cds-layer)',
                            borderRadius: '4px',
                        }}>
                            Preview: {value.substring(0, 50)}...
                        </div>
                    </div>
                ) : (
                    <img
                        src={imageSrc}
                        alt="Base64 decoded"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            display: loadError ? 'none' : 'block',
                        }}
                        onError={() => {
                            setLoadError(true);
                        }}
                    />
                )}
            </div>
            
            {/* Data info */}
            <div style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: 'var(--cds-layer)',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: 'var(--cds-text-secondary)',
            }}>
                Data length: {value.length.toLocaleString()} characters
                {validation.valid && (
                    <span style={{ marginLeft: '1rem', color: 'var(--cds-text-success)' }}>
                        Valid Base64
                    </span>
                )}
            </div>
        </div>
    );
}
