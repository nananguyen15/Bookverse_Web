import { FormField, InputField, TextAreaField } from "./FormField";

export interface PublisherFormData {
  name: string;
  address: string;
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
          rows={3}
          value={formData.address}
          onChange={(value) => onUpdate({ ...formData, address: value })}
          placeholder="Enter publisher address"
        />
      </FormField>
    </div>
  );
}
