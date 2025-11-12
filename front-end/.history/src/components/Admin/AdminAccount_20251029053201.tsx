import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaUserCircle, FaSave, FaEye, FaEyeSlash } from "react-icons/fa";

const adminProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          val
        ),
      "Password must be at least 8 characters with uppercase, lowercase, number and special character"
    ),
  confirmPassword: z.string().optional(),
});

type AdminProfileForm = z.infer<typeof adminProfileSchema>;

export function AdminAccount() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AdminProfileForm>({
    resolver: zodResolver(adminProfileSchema),
  });

  const newPassword = watch("newPassword");

  useEffect(() => {
    // Load admin profile from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const adminUser = users.find((u: any) => u.role === "admin");

    if (adminUser) {
      reset({
        username: adminUser.username || "",
        fullName: adminUser.fullName || "Administrator",
        email: adminUser.email || "",
      });
    }

    const adminProfile = localStorage.getItem("adminProfile");
    if (adminProfile) {
      const profile = JSON.parse(adminProfile);
      setAvatarPreview(profile.avatarUrl);
    }
  }, [reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: AdminProfileForm) => {
    // Validate password change
    if (data.newPassword) {
      if (!data.currentPassword) {
        alert("Please enter current password to change password");
        return;
      }

      if (data.newPassword !== data.confirmPassword) {
        alert("New password and confirm password do not match");
        return;
      }

      // Verify current password
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const adminUser = users.find((u: any) => u.role === "admin");

      if (adminUser && adminUser.password !== data.currentPassword) {
        alert("Current password is incorrect");
        return;
      }
    }

    // Check if username is unique (excluding current admin)
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const usernameExists = users.some(
      (u: any) => u.username === data.username && u.role !== "admin"
    );

    if (usernameExists) {
      alert("Username already exists. Please choose another one.");
      return;
    }

    // Update users array
    const updatedUsers = users.map((u: any) => {
      if (u.role === "admin") {
        return {
          ...u,
          username: data.username,
          fullName: data.fullName,
          email: data.email,
          password: data.newPassword || u.password,
        };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    // Update admin profile
    const adminProfile = {
      username: data.username,
      fullName: data.fullName,
      avatarUrl: avatarPreview,
    };
    localStorage.setItem("adminProfile", JSON.stringify(adminProfile));

    // Dispatch event to update header
    window.dispatchEvent(new Event("adminProfileUpdated"));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset password fields
    reset({
      ...data,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-beige-900">My Account</h2>
        <p className="mt-1 text-beige-600">
          Manage your admin account settings
        </p>
      </div>

      {showSuccess && (
        <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
          <p className="font-medium text-green-800">
            ✓ Profile updated successfully!
          </p>
        </div>
      )}

      <div className="p-8 bg-white border rounded-lg shadow-sm border-beige-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <div className="pb-6 border-b border-beige-200">
            <h3 className="mb-4 text-lg font-semibold text-beige-900">
              Profile Picture
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="object-cover w-24 h-24 border-4 rounded-full border-beige-200"
                  />
                ) : (
                  <FaUserCircle className="w-24 h-24 text-beige-400" />
                )}
              </div>
              <div>
                <label className="px-4 py-2 text-sm font-medium transition-colors border rounded-lg cursor-pointer text-beige-700 border-beige-300 hover:bg-beige-50">
                  Change Avatar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-xs text-beige-500">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="pb-6 border-b border-beige-200">
            <h3 className="mb-4 text-lg font-semibold text-beige-900">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-beige-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("username")}
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg border-beige-300 focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-beige-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("fullName")}
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg border-beige-300 focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-beige-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg border-beige-300 focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-beige-900">
              Change Password
            </h3>
            <p className="mb-4 text-sm text-beige-600">
              Leave blank if you don't want to change your password
            </p>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-beige-700">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    {...register("currentPassword")}
                    type={showCurrentPassword ? "text" : "password"}
                    className="w-full px-4 py-2 border rounded-lg border-beige-300 focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute text-beige-600 right-3 top-1/2 -translate-y-1/2 hover:text-beige-800"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-beige-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      {...register("newPassword")}
                      type={showNewPassword ? "text" : "password"}
                      className="w-full px-4 py-2 border rounded-lg border-beige-300 focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute text-beige-600 right-3 top-1/2 -translate-y-1/2 hover:text-beige-800"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-beige-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full px-4 py-2 border rounded-lg border-beige-300 focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
                      disabled={!newPassword}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute text-beige-600 right-3 top-1/2 -translate-y-1/2 hover:text-beige-800"
                      disabled={!newPassword}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-beige-200">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
            >
              <FaSave />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
