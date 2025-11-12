interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, required = false, children }: FormFieldProps) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

interface InputFieldProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  title?: string;
}

export function InputField({
  type,
  value,
  onChange,
  placeholder = "",
  required = false,
  readOnly = false,
  title,
}: InputFieldProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      title={title}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-transparent ${
        readOnly ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  );
}
