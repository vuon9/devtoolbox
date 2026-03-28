import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { STORAGE_KEYS, DEFAULT_COMMON_TAGS, LABELS } from '../strings';

// Tag colors for dark theme
const TAG_STYLES = {
  gray: {
    backgroundColor: '#27272a',
    color: '#a1a1aa',
    borderColor: '#3f3f46',
  },
  blue: {
    backgroundColor: '#1e40af',
    color: '#93c5fd',
    borderColor: '#3b82f6',
  },
  green: {
    backgroundColor: '#166534',
    color: '#86efac',
    borderColor: '#22c55e',
  },
};

export default function CommonTags({ currentCategory, currentMethod, onTagSelect }) {
  const [customTags, setCustomTags] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_TAGS)) || [];
    } catch {
      return [];
    }
  });
  const [isHovering, setIsHovering] = useState(false);

  // Save custom tags to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TAGS, JSON.stringify(customTags));
  }, [customTags]);

  // Combine default and custom tags
  const allTags = [...DEFAULT_COMMON_TAGS, ...customTags];

  const handleTagClick = (tag) => {
    onTagSelect(tag.category, tag.method);
  };

  const handleRemoveTag = (e, tagId) => {
    e.stopPropagation();
    setCustomTags(customTags.filter((tag) => tag.id !== tagId));
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 0',
        borderBottom: '1px solid #27272a',
        marginBottom: '12px',
      }}
    >
      <span
        style={{
          fontSize: '12px',
          color: '#71717a',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}
      >
        {LABELS.QUICK_ACTION}
      </span>

      {/* Scrollable tags container */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          flex: 1,
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
          const tagType = isActive ? 'blue' : isCustom ? 'green' : 'gray';
          const style = TAG_STYLES[tagType];

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
              <button
                onClick={() => handleTagClick(tag)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: isCustom ? '4px 28px 4px 12px' : '4px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '9999px',
                  border: `1px solid ${style.borderColor}`,
                  backgroundColor: style.backgroundColor,
                  color: style.color,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {tag.label}
              </button>
              {isCustom && (
                <button
                  onClick={(e) => handleRemoveTag(e, tag.id)}
                  style={{
                    position: 'absolute',
                    right: '4px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#393939',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: 0.6,
                    transition: 'all 0.2s',
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
                  <X style={{ width: '12px', height: '12px' }} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
