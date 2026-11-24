import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { useId, type ReactNode } from "react";

export interface RadioOption<Value extends string> {
  value: Value;
  label: ReactNode;
}

export interface RadioGroupProps<Value extends string> {
  /** The group's name, shown beside the row. */
  label: string;
  /** Extra classes for the name: `max-sm:sr-only` keeps it for a screen reader only on a phone. */
  labelClassName?: string;
  options: readonly RadioOption<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
}

/**
 * One choice from a few, drawn as a segmented row: bordered segments, the chosen one in blued steel. Tab enters the
 * group and the arrow keys move and choose (base-ui rule 16): for a setting kept on the device, like a figure's
 * speed.
 */
export function RadioGroup<Value extends string>({
  label,
  labelClassName = "",
  options,
  value,
  onValueChange,
}: RadioGroupProps<Value>) {
  const labelId = useId();
  return (
    <div className="flex items-center gap-2">
      <span id={labelId} className={`text-sm text-muted ${labelClassName}`}>
        {label}
      </span>
      <BaseRadioGroup<Value>
        aria-labelledby={labelId}
        value={value}
        onValueChange={onValueChange}
        className="inline-flex overflow-hidden rounded-control border border-rule-strong bg-surface"
      >
        {options.map((option) => (
          <Radio.Root
            key={option.value}
            value={option.value}
            className="grid min-h-10.5 min-w-13 cursor-pointer place-items-center px-2 text-sm text-ink select-none not-first:border-l not-first:border-rule-strong hover:not-data-checked:bg-paper-2 focus-visible:outline-2 focus-visible:-outline-offset-3 focus-visible:outline-focus data-checked:bg-accent data-checked:text-accent-ink max-sm:min-w-10 max-sm:px-1 max-sm:text-[0.875rem] motion-safe:transition-colors motion-safe:duration-(--dur-short) motion-safe:ease-(--ease-out)"
          >
            {option.label}
          </Radio.Root>
        ))}
      </BaseRadioGroup>
    </div>
  );
}
