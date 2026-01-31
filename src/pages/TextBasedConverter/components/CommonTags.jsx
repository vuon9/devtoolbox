import React, { useState, useEffect } from 'react';
import { Tag, Button } from '@carbon/react';
import { Add, Close, Checkmark } from '@carbon/icons-react';

// Default common tags - only 2 as requested
const DEFAULT_COMMON_TAGS = [
    { id: 'url', category: 'Encode - Decode', method: 'URL', label: 'URL Encode' },
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

    const handleTagClick = (tag) => {
        onTagSelect(tag.category, tag.method);
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
                                position: 'relative',
                            }}
                        >
                            <Tag
                                type={isActive ? 'blue' : isCustom ? 'green' : 'gray'}
                                size="md"
                                onClick={() => handleTagClick(tag)}
                                style={{
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    paddingRight: isCustom ? '24px' : '8px',
                                }}
                            >
                                {tag.label}
                            </Tag>
                            {isCustom && (
                                <div
                                    onClick={(e) => handleRemoveTag(e, tag.id)}
                                    style={{
                                        position: 'absolute',
                                        right: '4px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--cds-background-inverse-hover, #393939)',
                                        color: 'var(--cds-text-inverse, #ffffff)',
                                        opacity: 0.6,
                                        transition: 'all 0.2s',
                                        zIndex: 10,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '0.6';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                    }}
                                    title="Remove from quick select"
                                >
                                    <Close size={14} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
