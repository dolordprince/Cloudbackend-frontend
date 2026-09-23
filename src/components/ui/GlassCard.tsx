import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive';
  glow?: 'none' | 'cyan' | 'violet';
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  glow = 'none',
  children,
  className = '',
  ...props
}) => {
  const variantClass = {
    default: 'glass-panel',
    elevated: 'glass-panel-elevated',
    subtle: 'glass-panel-subtle',
    interactive:
      'glass-panel hover:border-white/20 transition-all duration-200 active:scale-[0.99] cursor-pointer',
  }[variant];

  const glowClass = {
    none: '',
    cyan: 'glass-glow-cyan',
    violet: 'glass-glow-violet',
  }[glow];

  return (
    <div
      className={`rounded-2xl relative overflow-hidden ${variantClass} ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
