import type { SelectHTMLAttributes } from "react";

/**
 * Reusable Select component with label and error handling.
 * Options are passed as an array of { value, label } objects.
 */

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly SelectOption[];
  error?: string;
}

export default function Select({
  label,
  options,
  error,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-gray-700"
      >
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={selectId}
        className={`
          px-3 py-2 border rounded-lg transition-colors bg-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          ${error ? "border-red-500 bg-red-50" : "border-gray-300"}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
    </div>
  );
}

