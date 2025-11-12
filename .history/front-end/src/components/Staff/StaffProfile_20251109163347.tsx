import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { usersApi } from "../../api";
import { provinces, districts, wards } from "vietnam-provinces";

const profileSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^0[3-9]\d{8}$/, "Invalid Vietnamese phone number"),
  image: z.string().optional(),
  // Address fields
  province: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  street: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface District {
  code: string;
  name: string;
  province_code: string;
  province_name: string;
  unit: string;
  full_name: string;
}

interface Ward {
  code: string;
  name: string;
  district_code: string;
  district_name: string;
  province_code: string;
  province_name: string;
  unit: string;
  full_name: string;
}

export function StaffProfile() {
  const { user, refreshUser } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Load staff profile from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await usersApi.getMyInfo();
        reset({
          name: userData.name || "",
          phone: userData.phone || "",
          address: userData.address || "",
          image: userData.image || "",
        });
        if (userData.image) {
          setAvatarPreview(userData.image);
        }
      } catch (err: unknown) {
        console.error("Error loading profile:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [reset]);

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
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        setValue("image", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update profile via API
      await usersApi.updateMyInfo({
        name: data.name,
        phone: data.phone,
        address: data.address,
        image: avatarPreview || undefined,
      });

      // Refresh user data in context
      if (refreshUser) {
        await refreshUser();
      }

      // Dispatch event to update sidenav
      window.dispatchEvent(new Event("staffProfileUpdated"));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-beige-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-3xl font-bold text-beige-900">
        Personal Information
      </h2>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-6 text-red-800 bg-red-100 border border-red-200 rounded-md">
          {error}
        </div>
      )}

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

        {/* Username (Read-only) */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-beige-800"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={user?.username || ""}
            disabled
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-beige-50 border-beige-300 text-beige-600 cursor-not-allowed"
          />
        </div>

        {/* Email (Read-only) */}
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
            value={user?.email || ""}
            disabled
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm bg-beige-50 border-beige-300 text-beige-600 cursor-not-allowed"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-beige-800"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            {...register("name")}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600">
              {errors.name.message}
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
            htmlFor="address"
            className="block text-sm font-medium text-beige-800"
          >
            Address
          </label>
          <textarea
            id="address"
            {...register("address")}
            rows={3}
            className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
          />
          {errors.address && (
            <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 font-bold text-white rounded-md bg-beige-700 hover:bg-beige-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
