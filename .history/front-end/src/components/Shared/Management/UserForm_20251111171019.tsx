import { FormField, InputField } from "./FormField";

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
  onImageUpload?: (file: File) => void;
  isEdit?: boolean;
  title?: string;
  showPassword?: boolean;
  additionalFields?: React.ReactNode;
  showImageUpload?: boolean;
}

export function UserForm({
  formData,
  onUpdate,
  onImageUpload,
  isEdit = false,
  showPassword = true,
  additionalFields,
  showImageUpload = false,
}: UserFormProps) {
  const updateField = (field: keyof UserFormData, value: string) => {
    onUpdate({ ...formData, [field]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      {showImageUpload && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Profile Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500">
            Upload image (PNG, JPG, WEBP up to 5MB)
          </p>
          {formData.image && (
            <p className="text-xs text-gray-600 truncate">
              Current: {formData.image}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Username"
          required
          helperText={!isEdit ? "8-32 characters" : undefined}
        >
          <InputField
            type="text"
            value={formData.username}
            onChange={(value) => updateField("username", value)}
            placeholder="username123 (8-32 chars)"
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
            readOnly={isEdit}
            title={isEdit ? "Email cannot be edited" : ""}
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

      <FormField label="Full Name">
        <InputField
          type="text"
          value={formData.name}
          onChange={(value) => updateField("name", value)}
          placeholder="John Doe"
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
