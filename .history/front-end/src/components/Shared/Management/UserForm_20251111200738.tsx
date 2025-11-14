import { useState } from "react";
import { FormField, InputField } from "./FormField";
import { FaUpload, FaLink, FaTimes } from "react-icons/fa";

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
  onImageUpload?: (file: File | null) => void;
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
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [urlInput, setUrlInput] = useState("");

  const updateField = (field: keyof UserFormData, value: string) => {
    onUpdate({ ...formData, [field]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Send file to parent (will be uploaded when form submits)
    if (onImageUpload) {
      onImageUpload(file);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      alert("Please enter an image URL");
      return;
    }

    // Save URL to form data (no file upload needed)
    setPreviewUrl(urlInput);
    onUpdate({ ...formData, image: urlInput });
    if (onImageUpload) {
      onImageUpload(null); // Clear file since using URL
    }
    setUrlInput("");
  };

  const handleClear = () => {
    setPreviewUrl("");
    setUrlInput("");
    onUpdate({ ...formData, image: "" });
    if (onImageUpload) {
      onImageUpload(null);
    }
  };

  return (
    <div className="space-y-4">
      {showImageUpload && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Profile Image
          </label>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setUploadMode("file")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${uploadMode === "file"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              <FaUpload className="text-sm" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("url")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${uploadMode === "url"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              <FaLink className="text-sm" />
              Enter URL
            </button>
          </div>

          {/* Upload Interface */}
          {uploadMode === "file" ? (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-avatar"
              />
              <label
                htmlFor="file-upload-avatar"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <FaUpload className="text-3xl text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP up to 5MB
                </span>
              </label>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
                placeholder="Enter image URL or path (/img/avatar/photo.jpg)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Set URL
              </button>
            </div>
          )}

          {/* Preview */}
          {(previewUrl || formData.image) && (
            <div className="relative inline-block">
              <img
                src={previewUrl || formData.image}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = "/img/avatar/sample-user-avatar.png";
                }}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          )}

          {/* Helper Text */}
          <p className="text-xs text-gray-500">
            {uploadMode === "file"
              ? "File will be uploaded when you save"
              : "Enter full URL or path (e.g., /img/avatar/photo.jpg)"}
          </p>
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
