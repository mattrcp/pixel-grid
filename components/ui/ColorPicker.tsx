'use client';

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-secondary">{label}</span>}
      <label className="relative cursor-pointer">
        <div
          className="h-7 w-7 rounded-lg border border-black/[0.08] shadow-sm"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <input
        type="text"
        value={value}
        onChange={e => {
          const v = e.target.value;
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
        }}
        className="h-7 w-[72px] rounded-md border border-black/[0.08] bg-white px-2 text-xs font-mono text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
    </div>
  );
}
