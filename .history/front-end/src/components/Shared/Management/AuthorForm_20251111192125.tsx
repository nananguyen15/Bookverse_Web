import { FormField, InputField, TextAreaField } from "./FormField";
import { ImageUpload } from "../ImageUpload";

export interface AuthorFormData {
  name: string;
  bio: string;
  image: string;
}

interface AuthorFormProps {
  formData: AuthorFormData;
  onUpdate: (data: AuthorFormData) => void;
  onImageUpload?: (file: File | null) => void;
  isEdit?: boolean;
}

export function AuthorForm({ formData, onUpdate, onImageUpload, isEdit }: AuthorFormProps) {
  return (
    <div className="space-y-4">
      <FormField label="Author Name" required>
        <InputField
          type="text"
          required
          value={formData.name}
          onChange={(value) => onUpdate({ ...formData, name: value })}
          placeholder="Enter author name"
        />
      </FormField>

      <FormField label="Biography / Description" required>
        <TextAreaField
          rows={4}
          required
          value={formData.bio}
          onChange={(value) => onUpdate({ ...formData, bio: value })}
          placeholder="Enter author biography or description (required)"
        />
      </FormField>

      <ImageUpload
        value={formData.image}
        onChange={(url) => onUpdate({ ...formData, image: url })}
        onImageUpload={onImageUpload}
        label="Author Image"
        type="avatar"
        folder="author"
        required
      />
    </div>
  );
}
