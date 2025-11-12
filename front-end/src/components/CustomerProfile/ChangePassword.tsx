import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usersApi } from "../../api";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
        "Password must include uppercase, lowercase, number, and special character."
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ChangePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    try {
      setIsLoading(true);
      
      // Call API with correct field names: oldPassword and newPassword
      await usersApi.changeMyPassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      alert("Password changed successfully!");
      reset();
    } catch (error: any) {
      console.error("Error changing password:", error);
      const errorMessage = error.response?.data?.message || "Failed to change password. Please check your current password.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-3xl font-bold text-beige-900">
        Change Password
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-beige-800"
          >
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            {...register("currentPassword")}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
          />
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
          <input
            type="password"
            id="newPassword"
            {...register("newPassword")}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
          />
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
          <input
            type="password"
            id="confirmPassword"
            {...register("confirmPassword")}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 font-bold text-white rounded-md bg-beige-700 hover:bg-beige-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
