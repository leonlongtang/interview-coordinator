import type { InputHTMLAttributes } from "react";

/**
 * Reusable Input component with label and error handling.
 * Provides consistent form input styling across the app.
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  // Generate an ID from the label if not provided
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-gray-700"
      >
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={inputId}
        className={`
          px-3 py-2 border rounded-lg transition-colors
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          ${error ? "border-red-500 bg-red-50" : "border-gray-300"}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
    </div>
  );
}

