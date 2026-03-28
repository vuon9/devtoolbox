import React from 'react';
import { cn } from '../../utils/cn';

export function ToolTextArea({
  value,
  onChange,
  readOnly,
  placeholder,
  className,
  rows = 10,
  ...props
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        'w-full p-3 rounded-md bg-background border border-input',
        'font-mono text-sm resize-none transition-all duration-150',
        'placeholder:text-muted-foreground/50',
        // Focus states - visible ring for accessibility
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background focus:border-ring',
        // Read-only state
        readOnly && 'bg-muted/20 cursor-default',
        // Disabled state
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export default ToolTextArea;
