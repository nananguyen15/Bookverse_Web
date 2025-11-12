import { FormField, InputField, TextAreaField } from "./FormField";

export interface PublisherFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface PublisherFormProps {
  formData: PublisherFormData;
  onUpdate: (data: PublisherFormData) => void;
  isEdit?: boolean;
}

export function PublisherForm({ formData, onUpdate, isEdit }: PublisherFormProps) {
  return (
    <div className="space-y-4">
      <FormField label="Publisher Name" required>
        <InputField
          type="text"
          required
          value={formData.name}
          onChange={(value) => onUpdate({ ...formData, name: value })}
          placeholder="Enter publisher name"
        />
      </FormField>

      <FormField label="Address">
        <TextAreaField
          rows={2}
          value={formData.address}
          onChange={(value) => onUpdate({ ...formData, address: value })}
          placeholder="Enter publisher address"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Phone">
          <InputField
            type="text"
            value={formData.phone}
            onChange={(value) => onUpdate({ ...formData, phone: value })}
            placeholder="Enter phone number"
          />
        </FormField>

        <FormField label="Email">
          <InputField
            type="email"
            value={formData.email}
            onChange={(value) => onUpdate({ ...formData, email: value })}
            placeholder="Enter email"
          />
        </FormField>
      </div>
    </div>
  );
}
