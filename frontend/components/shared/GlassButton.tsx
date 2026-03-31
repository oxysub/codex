'use client';
import { CSSProperties, ReactNode, ButtonHTMLAttributes, useState } from 'react';

type Variant = 'neutral' | 'cyan' | 'cyan-outline' | 'violet' | 'command' | 'command-active';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
};

function getVariantStyle(variant: Variant): CSSProperties {
  switch (variant) {
    case 'neutral':
      return {
        background: 'linear-gradient(160deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.09) 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderTop: '1px solid rgba(255,255,255,0.32)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.5)',
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: 500,
        padding: '9px 18px',
      };
    case 'cyan':
      return {
        background: 'linear-gradient(160deg, rgba(6,182,212,0.9) 0%, rgba(6,182,212,0.7) 100%)',
        border: '1px solid rgba(6,182,212,0.9)',
        borderTop: '1px solid rgba(255,255,255,0.3)',
        borderBottom: '1px solid rgba(6,182,212,0.4)',
        borderRadius: 14,
        color: '#0a0a0a',
        fontSize: 15,
        fontWeight: 700,
        padding: 15,
        boxShadow: '0 4px 24px rgba(6,182,212,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
      };
    case 'cyan-outline':
      return {
        background: 'linear-gradient(160deg, rgba(6,182,212,0.28) 0%, rgba(6,182,212,0.08) 60%, rgba(6,182,212,0.18) 100%)',
        border: '1px solid rgba(6,182,212,0.6)',
        borderTop: '1px solid rgba(6,182,212,0.9)',
        borderBottom: '1px solid rgba(6,182,212,0.3)',
        color: '#06B6D4',
        borderRadius: 10,
        padding: '9px 13px',
        fontSize: 11,
        boxShadow: 'inset 0 1px 0 rgba(6,182,212,0.2), 0 2px 12px rgba(6,182,212,0.2)',
      };
    case 'violet':
      return {
        background: 'linear-gradient(160deg, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.08) 60%, rgba(124,58,237,0.18) 100%)',
        border: '1px solid rgba(124,58,237,0.5)',
        borderTop: '1px solid rgba(124,58,237,0.8)',
        color: '#a78bfa',
        borderRadius: 10,
        padding: '6px 13px',
        fontSize: 11,
      };
    case 'command':
      return {
        background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.06) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderTop: '1px solid rgba(255,255,255,0.2)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        color: '#64748b',
        borderRadius: 8,
        padding: '8px 6px',
        fontSize: 12,
        fontWeight: 500,
      };
    case 'command-active':
      return {
        background: 'linear-gradient(160deg, rgba(6,182,212,0.28) 0%, rgba(6,182,212,0.08) 60%, rgba(6,182,212,0.18) 100%)',
        border: '1px solid rgba(6,182,212,0.6)',
        borderTop: '1px solid rgba(6,182,212,0.9)',
        borderBottom: '1px solid rgba(6,182,212,0.3)',
        color: '#06B6D4',
        textShadow: '0 0 8px rgba(6,182,212,0.6)',
        borderRadius: 8,
        padding: '8px 6px',
        fontSize: 12,
        fontWeight: 500,
      };
    default:
      return {};
  }
}

export default function GlassButton({ variant = 'neutral', children, fullWidth, style, disabled, ...props }: GlassButtonProps) {
  const [hovered, setHovered] = useState(false);
  const variantStyle = getVariantStyle(variant);
  
  const hoverStyle: CSSProperties = hovered && variant === 'neutral' && !disabled ? {
    background: 'linear-gradient(160deg, rgba(220,38,38,0.28) 0%, rgba(185,28,28,0.08) 60%, rgba(220,38,38,0.18) 100%)',
    border: '1px solid rgba(220,38,38,0.6)',
    borderTop: '1px solid rgba(220,38,38,0.9)',
    borderBottom: '1px solid rgba(220,38,38,0.3)',
    boxShadow: 'inset 0 1px 0 rgba(220,38,38,0.35), 0 2px 12px rgba(220,38,38,0.2)',
    color: '#f87171',
  } : hovered && variant === 'cyan' && !disabled ? {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 28px rgba(6,182,212,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
  } : {};

  return (
    <button
      {...props}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...baseStyle,
        ...variantStyle,
        ...hoverStyle,
        ...(fullWidth ? { width: '100%' } : {}),
        ...(disabled ? { opacity: 0.45, pointerEvents: 'none' } : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
