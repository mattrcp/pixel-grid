'use client';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-xs text-secondary group-hover:text-primary transition-colors">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-[22px] w-[38px] rounded-full transition-colors duration-200 ${
          checked ? 'bg-accent' : 'bg-black/[0.09]'
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-[16px]' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}
