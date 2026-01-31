import React, { useState, useEffect } from 'react';
import { Tag, Button } from '@carbon/react';
import { Add, Close } from '@carbon/icons-react';

// Default common tags - at least 5 as requested
const DEFAULT_COMMON_TAGS = [
    { id: 'json-yaml', category: 'Convert', method: 'JSON ↔ YAML', label: 'JSON ↔ YAML' },
    { id: 'base64', category: 'Encode - Decode', method: 'Base64', label: 'Base64' },
    { id: 'md5', category: 'Hash', method: 'MD5', label: 'MD5' },
    { id: 'sha256', category: 'Hash', method: 'SHA-256', label: 'SHA-256' },
    { id: 'json-xml', category: 'Convert', method: 'JSON ↔ XML', label: 'JSON ↔ XML' },
    { id: 'url', category: 'Encode - Decode', method: 'URL', label: 'URL Encode' },
    { id: 'html', category: 'Encode - Decode', method: 'HTML Entities', label: 'HTML Entities' },
    { id: 'csv-tsv', category: 'Convert', method: 'CSV ↔ TSV', label: 'CSV ↔ TSV' },
    { id: 'jwt', category: 'Encode - Decode', method: 'JWT Decode', label: 'JWT Decode' },
    { id: 'all-hashes', category: 'Hash', method: 'All', label: 'All Hashes' },
];

export default function CommonTags({ currentCategory, currentMethod, onTagSelect }) {
    const [customTags, setCustomTags] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('tbc-custom-tags')) || [];
        } catch {
            return [];
        }
    });
    const [isHovering, setIsHovering] = useState(false);

    // Save custom tags to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('tbc-custom-tags', JSON.stringify(customTags));
    }, [customTags]);

    // Combine default and custom tags
    const allTags = [...DEFAULT_COMMON_TAGS, ...customTags];

    // Check if current selection is already in tags
    const isCurrentInTags = allTags.some(
        tag => tag.category === currentCategory && tag.method === currentMethod
    );

    const handleTagClick = (tag) => {
        onTagSelect(tag.category, tag.method);
    };

    const handleAddCurrent = () => {
        if (isCurrentInTags) return;

        const newTag = {
            id: `custom-${Date.now()}`,
            category: currentCategory,
            method: currentMethod,
            label: `${currentCategory} > ${currentMethod}`,
        };

        setCustomTags([...customTags, newTag]);
    };

    const handleRemoveTag = (e, tagId) => {
        e.stopPropagation();
        setCustomTags(customTags.filter(tag => tag.id !== tagId));
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--cds-border-subtle)',
                marginBottom: '0.75rem',
            }}
        >
            <span
                style={{
                    fontSize: '0.75rem',
                    color: 'var(--cds-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.32px',
                    whiteSpace: 'nowrap',
                }}
            >
                Quick Select:
            </span>

            {/* Scrollable tags container */}
            <div
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    overflowX: 'auto',
                    flex: 1,
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--cds-border-subtle) transparent',
                    paddingBottom: '2px',
                    cursor: isHovering ? 'grab' : 'default',
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onWheel={(e) => {
                    // Enable horizontal scroll with mouse wheel
                    if (e.deltaY !== 0) {
                        e.currentTarget.scrollLeft += e.deltaY;
                        e.preventDefault();
                    }
                }}
            >
                {allTags.map((tag) => {
                    const isActive = tag.category === currentCategory && tag.method === currentMethod;
                    const isCustom = tag.id.startsWith('custom-');

                    return (
                        <div
                            key={tag.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Tag
                                type={isActive ? 'blue' : 'gray'}
                                size="sm"
                                onClick={() => handleTagClick(tag)}
                                style={{
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                }}
                                filter={isCustom}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {tag.label}
                                    {isCustom && (
                                        <Close
                                            size={12}
                                            style={{ cursor: 'pointer' }}
                                            onClick={(e) => handleRemoveTag(e, tag.id)}
                                        />
                                    )}
                                </span>
                            </Tag>
                        </div>
                    );
                })}
            </div>

            {/* Add current button */}
            {!isCurrentInTags && (
                <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Add}
                    iconDescription="Add current to quick select"
                    onClick={handleAddCurrent}
                    style={{
                        flexShrink: 0,
                        padding: '0 8px',
                    }}
                >
                    Add
                </Button>
            )}
        </div>
    );
}
