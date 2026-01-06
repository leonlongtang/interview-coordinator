import type { TextareaHTMLAttributes } from "react";

/**
 * Reusable Textarea component with label.
 * Used for longer text input like interview notes.
 */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export default function Textarea({
  label,
  error,
  className = "",
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const textareaId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={textareaId}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        className={`
          px-3 py-2 border rounded-lg transition-colors resize-vertical
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

