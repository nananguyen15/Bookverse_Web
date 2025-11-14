import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaUserCircle } from "react-icons/fa";
import { usersApi } from "../../api/endpoints/users.api";

const profileSchema = z.object({
  avatar: z
    .any()
    .refine((files) => {
      if (!files || files.length === 0) return true; // Avatar is optional
      return files[0]?.size <= 10000000;
    }, `Max file size is 10MB.`)
    .optional(),
  name: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^0[3-9]\d{8}$/, "Invalid Vietnamese phone number"),
  address: z.string().min(5, "Address is required (at least 5 characters)"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function Profile() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Load profile data from API on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const userInfo = await usersApi.getMyInfo();
        
        // Reset form with API data
        reset({
          name: userInfo.name || "",
          phone: userInfo.phone || "",
          address: userInfo.address || "",
        });

        // Set avatar preview if exists
        if (userInfo.image) {
          setAvatarPreview(userInfo.image);
        }
      } catch (error) {
        console.error("❌ Failed to load profile:", error);
        setErrorMessage("Failed to load profile data. Please refresh the page.");
        setShowError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
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

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      setShowError(false);
      setShowSuccess(false);

      // Call API to update profile
      await usersApi.updateMyInfo({
        name: data.name,
        phone: data.phone,
        address: data.address,
        image: avatarPreview || undefined,
      });

      // Dispatch custom event to notify other components (navbar, etc.)
      window.dispatchEvent(new Event("profileUpdated"));

      // Show success message
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("❌ Failed to update profile:", error);
      const message = error.response?.data?.message || "Failed to update profile. Please try again.";
      setErrorMessage(message);
      setShowError(true);

      // Hide error message after 5 seconds
      setTimeout(() => {
        setShowError(false);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm min-h-96">
        <p className="text-beige-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-3xl font-bold text-beige-900">
        Personal Information
      </h2>

      {/* Success Message */}
      {showSuccess && (
        <div className="p-4 mb-6 text-green-800 bg-green-100 border border-green-200 rounded-md">
          ✓ Your profile has been updated successfully!
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="p-4 mb-6 text-red-800 bg-red-100 border border-red-200 rounded-md">
          ✕ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Section */}
        <div className="pb-6 border-b border-beige-200">
          <label className="block mb-2 text-sm font-medium text-beige-800">
            Profile Picture
          </label>
          <div className="flex items-center space-x-6">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="object-cover w-24 h-24 border-4 rounded-full border-beige-200"
                />
              ) : (
                <FaUserCircle className="w-24 h-24 text-beige-300" />
              )}
              <input
                type="file"
                id="avatar"
                {...register("avatar")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleAvatarChange}
                accept="image/*"
              />
            </div>
            <div>
              <label
                htmlFor="avatar"
                className="px-4 py-2 text-sm font-medium bg-white border rounded-md shadow-sm cursor-pointer text-beige-700 border-beige-300 hover:bg-beige-50"
              >
                Change Avatar
              </label>
              <p className="mt-2 text-xs text-beige-500">
                Max file size: 10MB. Accepted formats: JPG, PNG, GIF
              </p>
            </div>
          </div>
          {errors.avatar && (
            <p className="mt-2 text-sm text-red-600">
              {errors.avatar.message as string}
            </p>
          )}
        </div>

        {/* Personal Information Section */}
        <div className="pb-6 border-b border-beige-200">
          <h3 className="mb-4 text-lg font-semibold text-beige-900">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block mb-1 text-sm font-medium text-beige-800"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className="block w-full px-3 py-2 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block mb-1 text-sm font-medium text-beige-800"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                {...register("phone")}
                className="block w-full px-3 py-2 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
                placeholder="0xxxxxxxxx"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-beige-900">
            Delivery Address
          </h3>
          <div>
            <label
              htmlFor="address"
              className="block mb-1 text-sm font-medium text-beige-800"
            >
              Full Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              {...register("address")}
              rows={3}
              className="block w-full px-3 py-2 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
              placeholder="Enter your full address (street, ward, district, city/province)"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.message}
              </p>
            )}
            <p className="mt-2 text-xs text-beige-500">
              Example: 123 Nguyen Hue Street, Ward 1, District 1, Ho Chi Minh City
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-beige-200">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 font-bold text-white rounded-md bg-beige-700 hover:bg-beige-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="object-cover w-24 h-24 border-4 rounded-full border-beige-200"
              />
            ) : (
              <FaUserCircle className="w-24 h-24 text-beige-300" />
            )}
            <input
              type="file"
              id="avatar"
              {...register("avatar")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleAvatarChange}
              accept="image/*"
            />
          </div>
          <label
            htmlFor="avatar"
            className="px-4 py-2 text-sm font-medium bg-white border rounded-md shadow-sm cursor-pointer text-beige-700 border-beige-300 hover:bg-beige-50"
          >
            Change Avatar
          </label>
        </div>
        {errors.avatar && (
          <p className="mt-2 text-sm text-red-600">
            {errors.avatar.message as string}
          </p>
        )}

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-beige-800"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            {...register("fullName")}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
          />
          {errors.fullName && (
            <p className="mt-2 text-sm text-red-600">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-beige-800"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            {...register("phone")}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
          />
          {errors.phone && (
            <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 font-bold text-white rounded-md bg-beige-700 hover:bg-beige-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
