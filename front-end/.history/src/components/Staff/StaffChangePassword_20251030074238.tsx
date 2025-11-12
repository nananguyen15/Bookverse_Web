import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

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

export function StaffChangePassword() {
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordFormValues) => {
    if (!user?.username) {
      setShowError("User not found");
      return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const staffUser = users.find((u: any) => u.username === user.username);

    if (!staffUser) {
      setShowError("User not found");
      return;
    }

    // Verify current password
    if (staffUser.password !== data.currentPassword) {
      setShowError("Current password is incorrect");
      return;
    }

    // Update password
    const updatedUsers = users.map((u: any) => {
      if (u.username === user.username) {
        return {
          ...u,
          password: data.newPassword,
        };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setShowError("");
    setShowSuccess(true);
    reset();

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
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
            className="px-6 py-2 font-bold text-white rounded-md bg-beige-700 hover:bg-beige-800"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
