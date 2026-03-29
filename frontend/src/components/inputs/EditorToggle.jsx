import React from 'react';
import { Code } from 'lucide-react';

/**
 * Toggle button for enabling/disabling syntax highlighting
 * Persists preference to localStorage
 *
 * @param {boolean} enabled - Current highlighting state
 * @param {function} onToggle - Callback when toggle is clicked
 * @param {string} toolKey - Unique key for this tool (used for localStorage)
 * @param {string} [className] - Optional CSS class
 */
export default function EditorToggle({ enabled, onToggle, toolKey }) {
  const handleToggle = () => {
    const newValue = !enabled;
    onToggle(newValue);

    // Persist to localStorage
    try {
      localStorage.setItem(`${toolKey}-editor-highlight`, JSON.stringify(newValue));
    } catch (err) {
      console.warn('Failed to persist editor highlight preference:', err);
    }
  };

  return (
    <button
      onClick={handleToggle}
      title={enabled ? 'Disable output highlighting' : 'Enable output highlighting'}
      aria-pressed={enabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        padding: '6px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '4px',
        color: enabled ? '#f4f4f5' : '#71717a',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#27272a';
        e.currentTarget.style.color = '#f4f4f5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = enabled ? '#f4f4f5' : '#71717a';
      }}
    >
      <Code style={{ width: '16px', height: '16px', opacity: enabled ? 1 : 0.4 }} />
    </button>
  );
}
