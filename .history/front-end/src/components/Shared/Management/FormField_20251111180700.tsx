import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
  helperText?: string;
}

export function FormField({ label, required = false, children, error, helperText }: FormFieldProps) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}

interface InputFieldProps {
  type: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  title?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function InputField({
  type,
  value,
  onChange,
  placeholder = "",
  required = false,
  readOnly = false,
  disabled = false,
  title,
  className = "",
  min,
  max,
  step,
}: InputFieldProps) {
  const baseClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent";
  const stateClass = readOnly || disabled ? "bg-gray-100 cursor-not-allowed" : "";

  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      disabled={disabled}
      title={title}
      min={min}
      max={max}
      step={step}
      className={`${baseClass} ${stateClass} ${className}`}
    />
  );
}

interface SelectFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  className = "",
}: SelectFieldProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface TextAreaFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export function TextAreaField({
  value,
  onChange,
  placeholder = "",
  required = false,
  rows = 3,
  className = "",
}: TextAreaFieldProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent ${className}`}
    />
  );
}
