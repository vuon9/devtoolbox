import React from 'react';
import { IconButton } from '@carbon/react';
import { Code } from '@carbon/icons-react';

/**
 * Toggle button for enabling/disabling syntax highlighting
 * Persists preference to localStorage
 *
 * @param {boolean} enabled - Current highlighting state
 * @param {function} onToggle - Callback when toggle is clicked
 * @param {string} toolKey - Unique key for this tool (used for localStorage)
 * @param {string} [className] - Optional CSS class
 */
export default function EditorToggle({ enabled, onToggle, toolKey, className = '' }) {
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
    <IconButton
      kind="ghost"
      size="sm"
      label={enabled ? 'Disable output highlighting' : 'Enable output highlighting'}
      onClick={handleToggle}
      className={className}
      aria-pressed={enabled}
    >
      <Code style={{ opacity: enabled ? 1 : 0.4 }} />
    </IconButton>
  );
}
