import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordFormValues) => {
    // TODO: Implement actual password change logic
    // 1. Verify currentPassword against stored hash
    // 2. If correct, hash newPassword and update it in the database
    console.log(data);
    alert("Password changed successfully! (mocked)");
    reset();
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Change Password</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-lg mx-auto space-y-6"
      >
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            {...register("currentPassword")}
            className="block w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm"
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
            className="block text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            {...register("newPassword")}
            className="block w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm"
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
            className="block text-sm font-medium text-gray-700"
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            {...register("confirmPassword")}
            className="block w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm"
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
            className="px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
