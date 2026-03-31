'use client';
import { CSSProperties } from 'react';

export type StatusState = 'loading' | 'success' | 'error' | 'hidden';

interface StatusBoxProps {
  state: StatusState;
  message?: string;
}

const configs = {
  loading: { bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.25)', color: '#06B6D4', icon: '⏳' },
  success: { bg: 'rgba(5,150,105,0.12)', border: 'rgba(5,150,105,0.35)', color: '#34d399', icon: '✓' },
  error: { bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.35)', color: '#f87171', icon: '⚠' },
  hidden: { bg: '', border: '', color: '', icon: '' },
};

export default function StatusBox({ state, message }: StatusBoxProps) {
  if (state === 'hidden' || !message) return null;
  const c = configs[state];
  const style: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: c.bg,
    border: `0.5px solid ${c.border}`,
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: c.color,
    marginTop: 12,
  };
  return (
    <div style={style}>
      <span style={{ fontSize: 16 }}>{c.icon}</span>
      <span>{message}</span>
    </div>
  );
}
