import React from 'react';

// Reusable Button component with inline styles
// Matches the Convert button style from TextConverter
export function Button({
  children,
  onClick,
  disabled,
  variant = 'default',
  size = 'default',
  active,
  style = {},
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 500,
    fontSize: size === 'sm' ? '12px' : '14px',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
    border: '1px solid',
    ...style,
  };

  const paddingMap = {
    sm: '6px 12px',
    default: '8px 16px',
  };

  // For toggle buttons (active prop)
  if (active !== undefined) {
    const isActive = active;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          ...baseStyle,
          padding: paddingMap[size] || paddingMap.default,
          backgroundColor: isActive ? '#2563eb' : '#18181b',
          color: isActive ? '#ffffff' : '#a1a1aa',
          borderColor: isActive ? '#2563eb' : '#3f3f46',
        }}
        onMouseEnter={(e) => {
          if (disabled) return;
          if (isActive) {
            e.currentTarget.style.backgroundColor = '#1d4ed8';
          } else {
            e.currentTarget.style.backgroundColor = '#27272a';
            e.currentTarget.style.color = '#f4f4f5';
            e.currentTarget.style.borderColor = '#52525b';
          }
        }}
        onMouseLeave={(e) => {
          if (isActive) {
            e.currentTarget.style.backgroundColor = '#2563eb';
          } else {
            e.currentTarget.style.backgroundColor = '#18181b';
            e.currentTarget.style.color = '#a1a1aa';
            e.currentTarget.style.borderColor = '#3f3f46';
          }
        }}
      >
        {children}
      </button>
    );
  }

  // Standard button variants
  const variantStyles = {
    default: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      borderColor: '#2563eb',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#a1a1aa',
      borderColor: 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#f4f4f5',
      borderColor: '#3f3f46',
    },
    destructive: {
      backgroundColor: 'transparent',
      color: '#ef4444',
      borderColor: 'transparent',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        padding: paddingMap[size] || paddingMap.default,
        ...currentVariant,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'ghost' || variant === 'outline') {
          e.currentTarget.style.backgroundColor = '#27272a';
          e.currentTarget.style.color = '#f4f4f5';
        } else if (variant === 'destructive') {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        } else {
          e.currentTarget.style.backgroundColor = '#1d4ed8';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#a1a1aa';
        } else if (variant === 'outline') {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#f4f4f5';
        } else if (variant === 'destructive') {
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
