import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaUserCircle } from "react-icons/fa";
import { usersApi } from "../../api/endpoints/users.api";
import { getImageUrl } from "../../api/client";
import { provinces, districts, wards } from "vietnam-provinces";

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
  province: z.string().min(1, "Province/City is required"),
  district: z.string().min(1, "District is required"),
  ward: z.string().min(1, "Ward/Commune is required"),
  street: z.string().min(1, "Street address is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface District {
  code: string;
  name: string;
  province_code: string;
}

interface Ward {
  code: string;
  name: string;
  district_code: string;
}

export function Profile() {
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [useUrlUpload, setUseUrlUpload] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [districtOptions, setDistrictOptions] = useState<District[]>([]);
  const [wardOptions, setWardOptions] = useState<Ward[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const selectedProvince = watch("province");
  const selectedDistrict = watch("district");

  // Load districts when province changes
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

  // Load wards when district changes
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

  // Parse address string into components
  const parseAddress = (addressString: string) => {
    // Try to parse format: "street, ward, district, province"
    const parts = addressString.split(",").map((s) => s.trim());
    if (parts.length >= 4) {
      return {
        street: parts[0],
        ward: parts[1],
        district: parts[2],
        province: parts.slice(3).join(", "),
      };
    }
    return {
      street: addressString,
      ward: "",
      district: "",
      province: "",
    };
  };

  // Load profile data from API on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const userInfo = await usersApi.getMyInfo();

        // Parse address if exists
        const addressParts = userInfo.address
          ? parseAddress(userInfo.address)
          : { street: "", ward: "", district: "", province: "" };

        // Load districts and wards if province/district exists
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
              const districtData = filteredDistricts.find(
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

        // Reset form with API data
        reset({
          name: userInfo.name || "",
          phone: userInfo.phone || "",
          street: addressParts.street,
          ward: addressParts.ward,
          district: addressParts.district,
          province: addressParts.province,
        });

        // Set avatar URL if exists
        if (userInfo.image) {
          setAvatarPreview(getImageUrl(userInfo.image));
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
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Avatar file size must be less than 5MB");
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select an image file");
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setAvatarFile(file);
      setAvatarChanged(true);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      setShowError(false);
      setShowSuccess(false);

      // Combine address parts into single string
      const fullAddress = `${data.street}, ${data.ward}, ${data.district}, ${data.province}`;

      // Prepare update data
      const updateData: {
        name: string;
        phone: string;
        address: string;
        imageFile?: File;
        image?: string;
      } = {
        name: data.name,
        phone: data.phone,
        address: fullAddress,
      };

      // Handle image update - priority: file > URL > keep existing
      if (avatarChanged) {
        if (useUrlUpload && imageUrlInput.trim()) {
          // Use URL upload
          updateData.image = imageUrlInput.trim();
        } else if (avatarFile) {
          // Use file upload
          updateData.imageFile = avatarFile;
        }
      }

      console.log("🔄 Updating profile with data:", {
        name: updateData.name,
        phone: updateData.phone,
        address: updateData.address,
        imageFile: updateData.imageFile ? `${updateData.imageFile.name} (${updateData.imageFile.size} bytes)` : undefined,
        imageUrl: updateData.image
      });

      // Call API to update profile
      const updatedUser = await usersApi.updateMyInfo(updateData);

      // Update avatar preview with new image from server
      if (updatedUser.image) {
        setAvatarPreview(updatedUser.image);
      }

      // Reset avatar changed flag
      setAvatarChanged(false);

      // Dispatch custom event to notify other components (navbar, etc.)
      window.dispatchEvent(new Event("profileUpdated"));

      // Show success message
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error: unknown) {
      console.error("❌ Failed to update profile:", error);
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err.response?.data?.message ||
        "Failed to update profile. Please try again.";
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
          
          {/* Toggle between File Upload and URL */}
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setUseUrlUpload(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                !useUrlUpload
                  ? "bg-beige-600 text-white"
                  : "bg-white text-beige-700 border border-beige-300 hover:bg-beige-50"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUseUrlUpload(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                useUrlUpload
                  ? "bg-beige-600 text-white"
                  : "bg-white text-beige-700 border border-beige-300 hover:bg-beige-50"
              }`}
            >
              Use Image URL
            </button>
          </div>

          {!useUrlUpload ? (
            // File Upload Mode
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
                  Max file size: 5MB. Accepted formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
          ) : (
            // URL Input Mode
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {imageUrlInput && (
                  <img
                    src={imageUrlInput}
                    alt="Preview"
                    className="object-cover w-24 h-24 border-4 rounded-full border-beige-200"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                {!imageUrlInput && avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="Current avatar"
                    className="object-cover w-24 h-24 border-4 rounded-full border-beige-200"
                  />
                )}
                {!imageUrlInput && !avatarPreview && (
                  <FaUserCircle className="w-24 h-24 text-beige-300" />
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    setAvatarChanged(true);
                  }}
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  className="block w-full px-3 py-2 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
                />
                <p className="mt-2 text-xs text-beige-500">
                  Enter a direct link to an image (JPG, PNG, GIF)
                </p>
              </div>
            </div>
          )}
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

          {/* Province/City */}
          <div className="mb-4">
            <label
              htmlFor="province"
              className="block mb-1 text-sm font-medium text-beige-800"
            >
              Province/City <span className="text-red-500">*</span>
            </label>
            <select
              id="province"
              {...register("province")}
              className="block w-full px-3 py-2 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="mt-1 text-sm text-red-600">
                {errors.province.message}
              </p>
            )}
          </div>

          {/* District & Ward in 2 columns */}
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
            {/* District */}
            <div>
              <label
                htmlFor="district"
                className="block mb-1 text-sm font-medium text-beige-800"
              >
                District <span className="text-red-500">*</span>
              </label>
              <select
                id="district"
                {...register("district")}
                className="block w-full px-3 py-2 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
                disabled={!selectedProvince}
              >
                <option value="">Select District</option>
                {districtOptions.map((district) => (
                  <option key={district.code} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.district.message}
                </p>
              )}
            </div>

            {/* Ward/Commune */}
            <div>
              <label
                htmlFor="ward"
                className="block mb-1 text-sm font-medium text-beige-800"
              >
                Ward/Commune <span className="text-red-500">*</span>
              </label>
              <select
                id="ward"
                {...register("ward")}
                className="block w-full px-3 py-2 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
                disabled={!selectedDistrict}
              >
                <option value="">Select Ward</option>
                {wardOptions.map((ward) => (
                  <option key={ward.code} value={ward.name}>
                    {ward.name}
                  </option>
                ))}
              </select>
              {errors.ward && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.ward.message}
                </p>
              )}
            </div>
          </div>

          {/* Street, House No. */}
          <div>
            <label
              htmlFor="street"
              className="block mb-1 text-sm font-medium text-beige-800"
            >
              Street, House No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="street"
              {...register("street")}
              className="block w-full px-3 py-2 border rounded-md shadow-sm border-beige-300 focus:outline-none focus:ring-beige-500 focus:border-beige-500 sm:text-sm"
              placeholder="e.g., 123 Nguyen Hue Street"
            />
            {errors.street && (
              <p className="mt-1 text-sm text-red-600">
                {errors.street.message}
              </p>
            )}
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
