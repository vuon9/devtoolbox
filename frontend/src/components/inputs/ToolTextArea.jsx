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
        'w-full p-3 rounded-md bg-background border border-border/50',
        'font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all',
        'placeholder:text-muted-foreground/30 shadow-inner',
        readOnly && 'bg-muted/10',
        className
      )}
      {...props}
    />
  );
}

export default ToolTextArea;
