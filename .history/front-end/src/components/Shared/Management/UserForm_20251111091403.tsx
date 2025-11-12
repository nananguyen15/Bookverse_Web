import { FormField, InputField } from "./FormField";
import { ImageUpload } from "../ImageUpload";

export interface UserFormData {
  username: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  image?: string;
}

interface UserFormProps {
  formData: UserFormData;
  onUpdate: (formData: UserFormData) => void;
  isEdit?: boolean;
  title?: string;
  showPassword?: boolean;
  additionalFields?: React.ReactNode;
  showImageUpload?: boolean;
}

export function UserForm({ 
  formData, 
  onUpdate, 
  isEdit = false,
  showPassword = true,
  additionalFields 
}: UserFormProps) {
  const updateField = (field: keyof UserFormData, value: string) => {
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
            title={isEdit ? "Username cannot be edited" : ""}
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

      {showPassword && (
        <FormField 
          label={isEdit ? "New Password" : "Password"} 
          required={!isEdit}
          helperText={isEdit ? "Leave blank to keep current password" : undefined}
        >
          <InputField
            type="password"
            value={formData.password}
            onChange={(value) => updateField("password", value)}
            placeholder={isEdit ? "Enter new password" : "Enter password"}
            required={!isEdit}
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

      {/* Additional custom fields */}
      {additionalFields}
    </div>
  );
}
