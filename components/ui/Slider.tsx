'use client';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  displayValue?: string;
}

export function Slider({ label, value, min, max, step = 1, onChange, displayValue }: SliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-secondary">{label}</label>
        <span className="text-xs font-medium text-primary tabular-nums">
          {displayValue ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="apple-slider"
      />
    </div>
  );
}
