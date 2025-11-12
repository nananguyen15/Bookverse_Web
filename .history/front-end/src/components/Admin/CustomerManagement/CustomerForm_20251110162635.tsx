import { FormField, InputField } from "./FormField";

interface CustomerFormData {
  username: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
}

interface CustomerFormProps {
  formData: CustomerFormData;
  onUpdate: (formData: CustomerFormData) => void;
  isEdit?: boolean;
}

export function CustomerForm({ formData, onUpdate, isEdit = false }: CustomerFormProps) {
  const updateField = (field: keyof CustomerFormData, value: string) => {
    onUpdate({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Username" required>
          <InputField
            type="text"
            value={formData.username}
            onChange={(value) => updateField("username", value)}
            placeholder="username123"
            required
            readOnly={isEdit}
          />
        </FormField>

        <FormField label="Email" required>
          <InputField
            type="email"
            value={formData.email}
            onChange={(value) => updateField("email", value)}
            placeholder="email@example.com"
            required
          />
        </FormField>
      </div>

      {!isEdit && (
        <FormField label="Password" required>
          <InputField
            type="password"
            value={formData.password}
            onChange={(value) => updateField("password", value)}
            placeholder="Enter password"
            required
          />
        </FormField>
      )}

      <FormField label="Full Name" required>
        <InputField
          type="text"
          value={formData.name}
          onChange={(value) => updateField("name", value)}
          placeholder="John Doe"
          required
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Phone">
          <InputField
            type="tel"
            value={formData.phone}
            onChange={(value) => updateField("phone", value)}
            placeholder="0123456789"
          />
        </FormField>

        <FormField label="Address">
          <InputField
            type="text"
            value={formData.address}
            onChange={(value) => updateField("address", value)}
            placeholder="123 Street, City"
          />
        </FormField>
      </div>
    </div>
  );
}
