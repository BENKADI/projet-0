import * as React from "react";

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled = false, className = "" }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${checked ? 'bg-primary' : 'bg-input'}
          ${className}
        `}
      >
        <span
          className={`
            ${checked ? 'translate-x-6' : 'translate-x-1'}
            inline-block h-4 w-4 transform rounded-full bg-background
            transition-transform
          `}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
