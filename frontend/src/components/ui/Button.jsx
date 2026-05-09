import React from 'react';

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

  if (active !== undefined) {
    const isActive = active;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        {...props}
        style={{
          ...baseStyle,
          backgroundColor: isActive ? 'var(--primary)' : 'var(--card)',
          color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
          border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
        }}
        onMouseEnter={(e) => {
          if (disabled) return;
          if (isActive) {
            e.currentTarget.style.backgroundColor = 'var(--primary)';
            e.currentTarget.style.border = '1px solid var(--primary)';
          } else {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
            e.currentTarget.style.color = 'var(--foreground)';
            e.currentTarget.style.border = '1px solid var(--border)';
          }
        }}
        onMouseLeave={(e) => {
          if (isActive) {
            e.currentTarget.style.backgroundColor = 'var(--primary)';
            e.currentTarget.style.border = '1px solid var(--primary)';
          } else {
            e.currentTarget.style.backgroundColor = 'var(--card)';
            e.currentTarget.style.color = 'var(--muted-foreground)';
            e.currentTarget.style.border = '1px solid var(--border)';
          }
        }}
      >
        {children}
      </button>
    );
  }

  const variantStyles = {
    default: {
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
      border: '1px solid var(--primary)',
    },
    secondary: {
      backgroundColor: 'var(--muted)',
      color: 'var(--muted-foreground)',
      border: '1px solid var(--border)',
    },
    danger: {
      backgroundColor: 'transparent',
      color: 'var(--destructive)',
      border: '1px solid var(--destructive)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--foreground)',
      border: '1px solid var(--border)',
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
          e.currentTarget.style.backgroundColor =
            variant === 'secondary' ? 'var(--border)' : 'var(--muted)';
          e.currentTarget.style.color = 'var(--foreground)';
        } else if (variant === 'danger') {
          e.currentTarget.style.backgroundColor =
            'color-mix(in srgb, var(--destructive) 10%, transparent)';
        } else {
          e.currentTarget.style.backgroundColor = 'var(--primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = 'var(--muted)';
          e.currentTarget.style.color = 'var(--muted-foreground)';
        } else if (variant === 'outline') {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--foreground)';
        } else if (variant === 'danger') {
          e.currentTarget.style.backgroundColor = 'transparent';
        } else {
          e.currentTarget.style.backgroundColor = 'var(--primary)';
        }
      }}
    >
      {children}
    </button>
  );
}

export default Button;
