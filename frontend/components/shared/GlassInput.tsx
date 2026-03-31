'use client';
import { CSSProperties, InputHTMLAttributes, forwardRef } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({ leftIcon, style, ...props }, ref) => {
  const inputStyle: CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#f1f5f9',
    fontSize: 13,
    padding: leftIcon ? '10px 12px 10px 34px' : '10px 12px',
    outline: 'none',
    transition: 'border-color 0.2s',
    ...style,
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {leftIcon && (
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex' }}>
          {leftIcon}
        </span>
      )}
      <input ref={ref} style={inputStyle} {...props} />
    </div>
  );
});

GlassInput.displayName = 'GlassInput';
export default GlassInput;
