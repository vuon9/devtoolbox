import React from 'react';

// Reusable Button component with inline styles
// All buttons must have borders and use sm size only
export function Button({
  children,
  onClick,
  disabled,
  variant = 'default',
  size = 'sm',
  active,
  style = {},
  ...props
}) {
  // Base style - all buttons have consistent padding since only sm is allowed
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontWeight: 500,
    fontSize: '12px',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
    ...style,
  };

  // For toggle buttons (active prop)
  if (active !== undefined) {
    const isActive = active;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        {...props}
        style={{
          ...baseStyle,
          backgroundColor: isActive ? '#2563eb' : '#18181b',
          color: isActive ? '#ffffff' : '#a1a1aa',
          border: isActive ? '1px solid #2563eb' : '1px solid #3f3f46',
        }}
        onMouseEnter={(e) => {
          if (disabled) return;
          if (isActive) {
            e.currentTarget.style.backgroundColor = '#1d4ed8';
            e.currentTarget.style.border = '1px solid #1d4ed8';
          } else {
            e.currentTarget.style.backgroundColor = '#27272a';
            e.currentTarget.style.color = '#f4f4f5';
            e.currentTarget.style.border = '1px solid #52525b';
          }
        }}
        onMouseLeave={(e) => {
          if (isActive) {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.border = '1px solid #2563eb';
          } else {
            e.currentTarget.style.backgroundColor = '#18181b';
            e.currentTarget.style.color = '#a1a1aa';
            e.currentTarget.style.border = '1px solid #3f3f46';
          }
        }}
      >
        {children}
      </button>
    );
  }

  // Standard button variants - ALL have borders
  const variantStyles = {
    default: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      border: '1px solid #2563eb',
    },
    secondary: {
      backgroundColor: '#27272a',
      color: '#a1a1aa',
      border: '1px solid #3f3f46',
    },
    danger: {
      backgroundColor: 'transparent',
      color: '#ef4444',
      border: '1px solid #ef4444',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#f4f4f5',
      border: '1px solid #3f3f46',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...props}
      style={{
        ...baseStyle,
        ...currentVariant,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'secondary' || variant === 'outline') {
          e.currentTarget.style.backgroundColor = variant === 'secondary' ? '#3f3f46' : '#27272a';
          e.currentTarget.style.color = '#f4f4f5';
        } else if (variant === 'danger') {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        } else {
          e.currentTarget.style.backgroundColor = '#1d4ed8';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = '#27272a';
          e.currentTarget.style.color = '#a1a1aa';
        } else if (variant === 'outline') {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#f4f4f5';
        } else if (variant === 'danger') {
          e.currentTarget.style.backgroundColor = 'transparent';
        } else {
          e.currentTarget.style.backgroundColor = '#2563eb';
        }
      }}
    >
      {children}
    </button>
  );
}

export default Button;
