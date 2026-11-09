"use client";

import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  vertical?: boolean;
  showValue?: boolean;
  label?: string;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
  vertical = false,
  showValue,
  label,
}: SliderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        vertical ? "flex-col h-full" : "w-full",
        className
      )}
    >
      {label && (
        <span className="text-[10px] text-white/50 uppercase tracking-wider">
          {label}
        </span>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          vertical ? "eq-slider" : "w-full h-4",
          "accent-white"
        )}
      />
      {showValue && (
        <span className="text-xs text-white/60 w-8 text-right tabular-nums">
          {value > 0 ? `+${value}` : value}
        </span>
      )}
    </div>
  );
}
