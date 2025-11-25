import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaSave, FaEye, FaEyeSlash } from "react-icons/fa";
import { usersApi } from "../../api";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^[a-zA-Z0-9_]{8,16}$/,
        "Password must be 8-16 characters, containing only letters, numbers, and underscores."
      ),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export function AdminChangePassword() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordForm) => {
    setShowError(null);
    setSaving(true);

    try {
      await usersApi.changeMyPassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form
      reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      console.error("Failed to change password:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setShowError(
        err.response?.data?.message || "Failed to change password. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 bg-white border rounded-lg shadow-sm border-beige-200">
      <h2 className="mb-6 text-2xl font-bold text-beige-900">Change Password</h2>

      {showSuccess && (
        <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
          <p className="font-medium text-green-800">
            ✓ Password changed successfully!
          </p>
        </div>
      )}

      {showError && (
        <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
          <p className="font-medium text-red-800">✗ {showError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <p className="mb-4 text-sm text-beige-600">
            Please enter your current password to set a new one.
          </p>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-beige-700">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("currentPassword")}
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full px-4 py-2 pr-10 border rounded-lg border-beige-300 focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute text-beige-600 right-3 top-1/2 -translate-y-1/2 hover:text-beige-800"
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* New Password */}
              <div>
                <label className="block mb-2 text-sm font-medium text-beige-700">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register("newPassword")}
                    type={showNewPassword ? "text" : "password"}
                    className="w-full px-4 py-2 pr-10 border rounded-lg border-beige-300 focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
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

              {/* Confirm Password */}
              <div>
                <label className="block mb-2 text-sm font-medium text-beige-700">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-4 py-2 pr-10 border rounded-lg border-beige-300 focus:ring-2 focus:ring-beige-500 focus:border-beige-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute text-beige-600 right-3 top-1/2 -translate-y-1/2 hover:text-beige-800"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-beige-200">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800 disabled:opacity-50"
          >
            <FaSave />
            {saving ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
