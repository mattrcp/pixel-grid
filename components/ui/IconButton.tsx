'use client';

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  variant?: 'default' | 'danger';
  size?: 'sm' | 'md';
}

export function IconButton({ icon, label, active, onClick, variant = 'default', size = 'md' }: IconButtonProps) {
  const sizeClasses = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <button
      onClick={onClick}
      title={label}
      className={`${sizeClasses} flex items-center justify-center rounded-lg transition-all duration-150 ${
        active
          ? 'bg-accent text-white shadow-sm'
          : variant === 'danger'
            ? 'text-destructive hover:bg-destructive/10'
            : 'text-secondary hover:bg-black/[0.04] hover:text-primary'
      }`}
    >
      {icon}
    </button>
  );
}
