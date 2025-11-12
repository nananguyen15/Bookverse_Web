import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaUserCircle } from "react-icons/fa";

const profileSchema = z.object({
  avatar: z
    .any()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true; // Avatar is optional
        return files[0]?.size <= 10000000;
      },
      `Max file size is 10MB.`
    )
    .optional(),
  fullName: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^0[3-9]\d{8}$/, "Invalid Vietnamese phone number"),
  email: z.string().email("Invalid email address"),
  gender: z.enum(["male", "female", "not-specified"]),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function Profile() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Load profile data from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      reset(profileData);
      if (profileData.avatarUrl) {
        setAvatarPreview(profileData.avatarUrl);
      }
    }
  }, [reset]);

  // Hide success message when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      setShowSuccess(false);
    };
  }, []);

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

  const onSubmit = (data: ProfileFormValues) => {
    // Save profile data to localStorage
    const profileData = {
      ...data,
      avatarUrl: avatarPreview, // Save avatar preview URL
    };
    localStorage.setItem("userProfile", JSON.stringify(profileData));
    
    // Show success message
    setShowSuccess(true);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-3xl font-bold text-beige-900">
        Personal Information
      </h2>
      
      {/* Success Message */}
      {showSuccess && (
        <div className="p-4 mb-6 text-green-800 bg-green-100 border border-green-200 rounded-md">
          Your profile has been updated successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <label
            htmlFor="avatar"
            className="px-4 py-2 text-sm font-medium bg-white border rounded-md shadow-sm cursor-pointer text-beige-700 border-beige-300 hover:bg-beige-50"
          >
            Change Avatar
          </label>
        </div>
        {errors.avatar && (
          <p className="mt-2 text-sm text-red-600">{errors.avatar.message as string}</p>
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

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-beige-800"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register("email")}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-beige-800"
          >
            Gender
          </label>
          <select
            id="gender"
            {...register("gender")}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="not-specified">Prefer not to say</option>
          </select>
          {errors.gender && (
            <p className="mt-2 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="birthDate"
            className="block text-sm font-medium text-beige-800"
          >
            Date of Birth
          </label>
          <input
            type="date"
            id="birthDate"
            {...register("birthDate")}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
          />
          {errors.birthDate && (
            <p className="mt-2 text-sm text-red-600">
              {errors.birthDate.message}
            </p>
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
