import { FormField, InputField, TextAreaField } from "./FormField";

export interface AuthorFormData {
  name: string;
  biography: string;
  image: string;
}

interface AuthorFormProps {
  formData: AuthorFormData;
  onUpdate: (data: AuthorFormData) => void;
  isEdit?: boolean;
}

export function AuthorForm({ formData, onUpdate, isEdit }: AuthorFormProps) {
  return (
    <div className="space-y-4">
      <FormField label="Author Name" required>
        <InputField
          type="text"
          required
          value={formData.name}
          onChange={(e) => onUpdate({ ...formData, name: e.target.value })}
          placeholder="Enter author name"
        />
      </FormField>

      <FormField label="Biography">
        <TextAreaField
          rows={4}
          value={formData.biography}
          onChange={(e) => onUpdate({ ...formData, biography: e.target.value })}
          placeholder="Enter author biography"
        />
      </FormField>

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
            alt="Author preview"
            className="object-cover w-32 h-32 border-2 border-gray-300 rounded-full"
            onError={(e) => {
              e.currentTarget.src = "/img/avatar/default-avatar.jpg";
            }}
          />
        </div>
      )}
    </div>
  );
}
