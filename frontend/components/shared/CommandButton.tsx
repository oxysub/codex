'use client';
import GlassButton from './GlassButton';

interface CommandButtonProps {
  command: string;
  description: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function CommandButton({ command, description, active, disabled, onClick }: CommandButtonProps) {
  return (
    <GlassButton
      variant={active ? 'command-active' : 'command'}
      disabled={disabled}
      onClick={onClick}
      style={{ flexDirection: 'column', gap: 3, height: 52, width: '100%' }}
    >
      <span style={{ fontWeight: 600, fontSize: 12 }}>{command}</span>
      <span style={{ fontSize: 9, opacity: 0.75, textAlign: 'center', lineHeight: 1.2 }}>{description}</span>
    </GlassButton>
  );
}
