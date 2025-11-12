import { FormField, InputField, TextAreaField } from "./FormField";

export interface PublisherFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  image: string;
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
          onChange={(e) => onUpdate({ ...formData, name: e.target.value })}
          placeholder="Enter publisher name"
        />
      </FormField>

      <FormField label="Address">
        <TextAreaField
          rows={2}
          value={formData.address}
          onChange={(e) => onUpdate({ ...formData, address: e.target.value })}
          placeholder="Enter publisher address"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Phone">
          <InputField
            type="text"
            value={formData.phone}
            onChange={(e) => onUpdate({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </FormField>

        <FormField label="Email">
          <InputField
            type="email"
            value={formData.email}
            onChange={(e) => onUpdate({ ...formData, email: e.target.value })}
            placeholder="Enter email"
          />
        </FormField>
      </div>

      <FormField label="Image URL" required>
        <InputField
          type="text"
          required
          value={formData.image}
          onChange={(e) => onUpdate({ ...formData, image: e.target.value })}
          placeholder="https://..."
        />
      </FormField>

      {/* Image Preview */}
      {formData.image && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Preview</p>
          <img
            src={formData.image}
            alt="Publisher preview"
            className="object-cover w-32 h-32 border-2 border-gray-300 rounded"
            onError={(e) => {
              e.currentTarget.src = "/img/publisher/default-publisher.jpg";
            }}
          />
        </div>
      )}
    </div>
  );
}
