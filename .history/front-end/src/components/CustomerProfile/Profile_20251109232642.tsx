import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaUserCircle } from "react-icons/fa";
import { usersApi } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import { provinces, districts, wards } from "vietnam-provinces";

const profileSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^0[3-9]\d{8,9}$/,
      "Invalid Vietnamese phone number (must be 10-11 digits)"
    ),
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

export function Profile() {
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
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const selectedProvince = watch("province");
  const selectedDistrict = watch("district");

  const [districtOptions, setDistrictOptions] = useState<District[]>([]);
  const [wardOptions, setWardOptions] = useState<Ward[]>([]);

  // Parse address string into components
  const parseAddress = (address: string | undefined) => {
    if (!address) return { street: "", ward: "", district: "", province: "" };

    // Expected format: "Street, Ward, District, Province"
    const parts = address.split(",").map((p) => p.trim());

    return {
      street: parts[0] || "",
      ward: parts[1] || "",
      district: parts[2] || "",
      province: parts[3] || "",
    };
  };

  // Merge address components into single string
  const mergeAddress = (
    street: string,
    ward: string,
    district: string,
    province: string
  ) => {
    const parts = [street, ward, district, province].filter((p) => p);
    return parts.join(", ");
  };

  // Update districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const provinceData = provinces.find((p) => p.name === selectedProvince);
      if (provinceData) {
        const filteredDistricts = districts.filter(
          (d) => d.province_code === provinceData.code
        );
        setDistrictOptions(filteredDistricts);
        setWardOptions([]);
      }
    } else {
      setDistrictOptions([]);
      setWardOptions([]);
    }
  }, [selectedProvince]);

  // Update wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const districtData = districts.find((d) => d.name === selectedDistrict);
      if (districtData) {
        const filteredWards = wards.filter(
          (w) => w.district_code === districtData.code
        );
        setWardOptions(filteredWards);
      }
    } else {
      setWardOptions([]);
    }
  }, [selectedDistrict]);

  // Load profile data from API on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await usersApi.getMyInfo();

        // Parse address into components
        const addressParts = parseAddress(userData.address);

        reset({
          name: userData.name || "",
          phone: userData.phone || "",
          image: userData.image || "",
          street: addressParts.street,
          ward: addressParts.ward,
          district: addressParts.district,
          province: addressParts.province,
        });

        if (userData.image) {
          setAvatarPreview(userData.image);
        }

        // Load districts and wards if address exists
        if (addressParts.province) {
          const provinceData = provinces.find(
            (p) => p.name === addressParts.province
          );
          if (provinceData) {
            const filteredDistricts = districts.filter(
              (d) => d.province_code === provinceData.code
            );
            setDistrictOptions(filteredDistricts);

            if (addressParts.district) {
              const districtData = districts.find(
                (d) => d.name === addressParts.district
              );
              if (districtData) {
                const filteredWards = wards.filter(
                  (w) => w.district_code === districtData.code
                );
                setWardOptions(filteredWards);
              }
            }
          }
        }
      } catch (err: unknown) {
        console.error("Error loading profile:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load profile";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
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

      // Merge address components into single string
      const addressString = mergeAddress(
        data.street || "",
        data.ward || "",
        data.district || "",
        data.province || ""
      );

      console.log("📝 Submitting profile update:", {
        name: data.name,
        phone: data.phone,
        address: addressString || undefined,
        image: avatarPreview || undefined,
      });

      // Update profile via API
      await usersApi.updateMyInfo({
        name: data.name,
        phone: data.phone,
        address: addressString || undefined,
        image: avatarPreview || undefined,
      });

      console.log("✅ Profile updated successfully");

      // Refresh user data in context
      if (refreshUser) {
        await refreshUser();
      }

      // Show success message
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      console.error("❌ Error updating profile:", err);
      const error = err as { response?: { data?: { message?: string }; status?: number } };
      
      let errorMessage = "Failed to update profile";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data. Please check your phone number format (10-11 digits starting with 0).";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
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
            <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
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

        {/* Address Section */}
        <div className="pt-6 mt-6 border-t border-beige-200">
          <h3 className="mb-4 text-lg font-semibold text-beige-800">
            Address Information
          </h3>

          <div>
            <label
              htmlFor="province"
              className="block text-sm font-medium text-beige-800"
            >
              Province/City
            </label>
            <select
              id="province"
              {...register("province")}
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
            >
              <option value="">Select Province</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="mt-2 text-sm text-red-600">
                {errors.province.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="district"
                className="block text-sm font-medium text-beige-800"
              >
                District
              </label>
              <select
                id="district"
                {...register("district")}
                className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
                disabled={!selectedProvince}
              >
                <option value="">Select District</option>
                {districtOptions.map((d) => (
                  <option key={d.code} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.district.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="ward"
                className="block text-sm font-medium text-beige-800"
              >
                Ward/Commune
              </label>
              <select
                id="ward"
                {...register("ward")}
                className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
                disabled={!selectedDistrict}
              >
                <option value="">Select Ward</option>
                {wardOptions.map((w) => (
                  <option key={w.code} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
              {errors.ward && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.ward.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="street"
              className="block text-sm font-medium text-beige-800"
            >
              Street, House No.
            </label>
            <input
              type="text"
              id="street"
              {...register("street")}
              placeholder="e.g., 123 Nguyen Hue Street"
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
            />
            {errors.street && (
              <p className="mt-2 text-sm text-red-600">
                {errors.street.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-beige-200">
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
