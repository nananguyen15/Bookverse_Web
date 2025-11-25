import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaUserCircle, FaSave } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { usersApi } from "../../api";

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^0[3-9]\d{8}$/, "Invalid Vietnamese phone number"),
  email: z.string().email("Invalid email address").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function StaffProfile() {
  const { user } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [useUrlUpload, setUseUrlUpload] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Load staff profile from API
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userInfo = await usersApi.getMyInfo();
        reset({
          fullName: userInfo.name || "",
          phone: userInfo.phone || "",
          email: userInfo.email || "",
        });
        if (userInfo.image) {
          setAvatarPreview(userInfo.image);
        }
      } catch (error) {
        console.error("Failed to load staff profile:", error);
        setShowError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setShowError("Avatar file size must be less than 5MB");
        setTimeout(() => setShowError(null), 5000);
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setShowError("Please select an image file");
        setTimeout(() => setShowError(null), 5000);
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setAvatarFile(file);
      setAvatarChanged(true);

      // Clear URL input when file is selected
      setImageUrlInput("");
    }
  };

  const handleToggleUploadMode = (useUrl: boolean) => {
    setUseUrlUpload(useUrl);
    if (useUrl) {
      // Switching to URL mode - clear file
      setAvatarFile(null);
    } else {
      // Switching to file mode - clear URL
      setImageUrlInput("");
    }
  };

  const validateImageUrl = (url: string): boolean => {
    // Check if URL is valid format
    try {
      new URL(url);
    } catch {
      return false;
    }

    // Check if URL ends with common image extensions
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
    return imageExtensions.test(url);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    setShowError(null);
    setSaving(true);

    try {
      // Prepare update data
      const updateData: {
        name: string;
        phone: string;
        imageFile?: File;
        image?: string;
      } = {
        name: data.fullName,
        phone: data.phone,
      };

      // Handle image update - priority: file > URL > keep existing
      if (avatarChanged) {
        if (useUrlUpload && imageUrlInput.trim()) {
          // Validate image URL before using it
          if (!validateImageUrl(imageUrlInput.trim())) {
            setShowError(
              "Please enter a valid image URL (must end with .jpg, .jpeg, .png, .gif, .webp, .bmp, or .svg)"
            );
            setSaving(false);
            setTimeout(() => setShowError(null), 5000);
            return;
          }
          // Use URL upload
          updateData.image = imageUrlInput.trim();
        } else if (avatarFile) {
          // Use file upload
          updateData.imageFile = avatarFile;
        }
      }

      // Update profile info
      const updatedUser = await usersApi.updateMyInfo(updateData);

      // Update avatar preview with new image from server
      if (updatedUser.image) {
        setAvatarPreview(updatedUser.image);
      }

      // Reset avatar changed flag
      setAvatarChanged(false);
      setAvatarFile(null);
      setImageUrlInput("");

      // Dispatch event to update sidenav
      window.dispatchEvent(new Event("staffProfileUpdated"));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update staff profile:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setShowError(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-white border rounded-lg shadow-sm border-beige-200">
        <p className="text-center text-beige-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white border rounded-lg shadow-sm border-beige-200">
      {showSuccess && (
        <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
          <p className="font-medium text-green-800">
            ✓ Profile updated successfully!
          </p>
        </div>
      )}

      {showError && (
        <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
          <p className="font-medium text-red-800">✗ {showError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Avatar Section */}
        <div className="pb-6 border-b border-beige-200">
          <h3 className="mb-4 text-lg font-semibold text-beige-900">
            Profile Picture
          </h3>

          {/* Toggle between File Upload and URL */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => handleToggleUploadMode(false)}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${!useUrlUpload
                ? "bg-beige-600 text-white"
                : "bg-white text-beige-700 border border-beige-300 hover:bg-beige-50"
                }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => handleToggleUploadMode(true)}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${useUrlUpload
                ? "bg-beige-600 text-white"
                : "bg-white text-beige-700 border border-beige-300 hover:bg-beige-50"
                }`}
            >
              Use Image URL
            </button>
          </div>

          {!useUrlUpload ? (
            // File Upload Mode
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="object-cover w-32 h-32 border-4 rounded-full border-beige-200"
                  />
                ) : (
                  <FaUserCircle className="w-32 h-32 text-beige-300" />
                )}
              </div>
              <div className="text-center">
                <label className="px-6 py-2.5 text-sm font-medium bg-white border rounded-md shadow-sm cursor-pointer text-beige-700 border-beige-300 hover:bg-beige-50 transition-colors">
                  Change Avatar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-xs text-beige-500">
                  Max file size: 5MB. Accepted formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
          ) : (
            // URL Input Mode
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                {imageUrlInput && (
                  <img
                    src={imageUrlInput}
                    alt="Preview"
                    className="object-cover w-32 h-32 border-4 rounded-full border-beige-200"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                {!imageUrlInput && avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="Current avatar"
                    className="object-cover w-32 h-32 border-4 rounded-full border-beige-200"
                  />
                )}
                {!imageUrlInput && !avatarPreview && (
                  <FaUserCircle className="w-32 h-32 text-beige-300" />
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    setAvatarChanged(true);
                  }}
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  className="block w-full px-4 py-2.5 border rounded-lg shadow-sm border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
                />
                <p className="mt-2 text-xs text-center text-beige-500">
                  Enter a direct link to an image (JPG, PNG, GIF, WEBP, BMP, SVG)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Personal Details Section */}
        <div className="pb-6 space-y-6 border-b border-beige-200">
          <h3 className="text-lg font-semibold text-beige-900">
            Personal Details
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-beige-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("fullName")}
                className="block w-full px-4 py-2.5 border rounded-lg shadow-sm border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500 focus:border-beige-500 transition-colors"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-beige-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register("phone")}
                className="block w-full px-4 py-2.5 border rounded-lg shadow-sm border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500 focus:border-beige-500 transition-colors"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 font-semibold text-white transition-all rounded-lg shadow-sm bg-beige-700 hover:bg-beige-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
