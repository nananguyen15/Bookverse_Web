import { FormField, InputField, TextAreaField } from "./FormField";
import { ImageUpload } from "../ImageUpload";

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

      <ImageUpload
        value={formData.image}
        onChange={(url) => onUpdate({ ...formData, image: url })}
        label="Author Image"
        type="avatar"
        folder="author"
        required
      />
    </div>
  );
}
