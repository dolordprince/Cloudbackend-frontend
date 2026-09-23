import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 select-none whitespace-nowrap';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[44px] gap-2',
    lg: 'text-base px-5 py-2.5 min-h-[48px] gap-2.5',
    icon: 'min-h-[44px] min-w-[44px] p-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(56,189,248,0.35)] border border-cyan-300/30 hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:border-cyan-200/50',
    secondary:
      'bg-white/[0.06] text-slate-100 border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.18]',
    ghost:
      'bg-transparent text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent',
    danger:
      'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};
