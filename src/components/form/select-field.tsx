"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function SelectField({
  id,
  label,
  value,
  placeholder,
  options,
  onValueChange,
  invalid,
  describedBy,
  disabled,
  className,
}: {
  id: string;
  label: string;
  value?: string;
  placeholder?: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-32", className)}>
      <label htmlFor={id} className="data-label mb-1 block">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          size="default"
          aria-invalid={invalid ? true : undefined}
          aria-describedby={describedBy}
          className="h-9 w-full rounded-sm border-border bg-background px-2 text-xs shadow-none transition-colors hover:bg-accent/35 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 data-[size=default]:h-9 [&_svg]:size-3.5"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-sm">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="rounded-sm text-xs"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
