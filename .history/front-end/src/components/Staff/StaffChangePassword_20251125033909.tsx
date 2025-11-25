import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { usersApi } from "../../api";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be 8-16 characters")
      .max(16, "Password must be 8-16 characters")
      .regex(
        /^[a-zA-Z0-9_]{8,16}$/,
        "Password must be 8-16 characters, containing only letters, numbers, and underscores."
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function StaffChangePassword() {
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    if (!user) {
      setShowError("User not found");
      return;
    }

    try {
      await usersApi.changeMyPassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setShowError("");
      setShowSuccess(true);
      reset();

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Failed to change password:", error);
      setShowError(
        error.response?.data?.message || "Failed to change password. Please try again."
      );
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-3xl font-bold text-beige-900">
        Change Password
      </h2>

      {showSuccess && (
        <div className="p-4 mb-6 text-green-800 bg-green-100 border border-green-200 rounded-md">
          Password changed successfully!
        </div>
      )}

      {showError && (
        <div className="p-4 mb-6 text-red-800 bg-red-100 border border-red-200 rounded-md">
          {showError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-beige-800"
          >
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              id="currentPassword"
              {...register("currentPassword")}
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showCurrentPassword ? "Hide password" : "Show password"}
            >
              {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-beige-800"
          >
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              {...register("newPassword")}
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-beige-800"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              {...register("confirmPassword")}
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 font-bold text-white rounded-md bg-beige-700 hover:bg-beige-800"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
