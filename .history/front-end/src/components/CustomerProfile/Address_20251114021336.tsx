import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { provinces, districts, wards } from "vietnam-provinces";
import { usersApi } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const addressSchema = z.object({
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  ward: z.string().min(1, "Ward is required"),
  street: z.string().min(1, "Street address is required"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

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

export function Address() {
  const { user, updateUser } = useAuth();
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
  });

  const selectedProvince = watch("province");
  const selectedDistrict = watch("district");

  const [districtOptions, setDistrictOptions] = useState<District[]>([]);
  const [wardOptions, setWardOptions] = useState<Ward[]>([]);

  useEffect(() => {
    if (selectedProvince) {
      const provinceData = provinces.find((p) => p.name === selectedProvince);
      if (provinceData) {
        const filteredDistricts = districts.filter(
          (d) => d.province_code === provinceData.code
        );
        setDistrictOptions(filteredDistricts);
        setWardOptions([]);
        setValue("district", "");
        setValue("ward", "");
      }
    } else {
      setDistrictOptions([]);
      setWardOptions([]);
    }
  }, [selectedProvince, setValue]);

  useEffect(() => {
    if (selectedDistrict) {
      const districtData = districts.find((d) => d.name === selectedDistrict);
      if (districtData) {
        const filteredWards = wards.filter(
          (w) => w.district_code === districtData.code
        );
        setWardOptions(filteredWards);
        setValue("ward", "");
      }
    } else {
      setWardOptions([]);
    }
  }, [selectedDistrict, setValue]);

  // Load user address from API on mount
  useEffect(() => {
    const loadAddress = async () => {
      try {
        setLoading(true);
        const userInfo = await usersApi.getMyInfo();
        const fullAddress = userInfo.address || "";
        setCurrentAddress(fullAddress);

        // Parse address if it exists
        if (fullAddress) {
          const parts = fullAddress.split(", ");
          if (parts.length >= 4) {
            reset({
              street: parts[0],
              ward: parts[1],
              district: parts[2],
              province: parts[3],
            });
          }
        }
      } catch (error) {
        console.error("Failed to load address:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAddress();
  }, [reset]);



  const onSubmit = async (data: AddressFormValues) => {
    try {
      // Format address as: "street, ward, district, province"
      const fullAddress = `${data.street}, ${data.ward}, ${data.district}, ${data.province}`;

      await usersApi.updateMyInfo({ address: fullAddress });
      setCurrentAddress(fullAddress);

      // Update AuthContext
      if (user) {
        updateUser({ ...user, address: fullAddress });
      }

      // Dispatch event for other components
      window.dispatchEvent(new Event("userProfileUpdated"));

      alert("Address saved successfully!");
    } catch (error) {
      console.error("Failed to save address:", error);
      alert("Failed to save address. Please try again.");
    }
  };



  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <p className="text-beige-600">Loading address...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-3xl font-bold text-beige-900">My Address</h2>

      <div className="mb-8">
        <h3 className="mb-4 text-xl font-semibold text-beige-800">
          {currentAddress ? "Update Address" : "Add Address"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
            >
              <option value="">Select Province</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="mt-1 text-sm text-red-600">
                {errors.province.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
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
                <p className="mt-1 text-sm text-red-600">
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
                className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.ward.message}
                </p>
              )}
            </div>
          </div>

          <div>
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
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
              placeholder="e.g., 123 Nguyen Hue Street"
            />
            {errors.street && (
              <p className="mt-1 text-sm text-red-600">
                {errors.street.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 font-bold text-white rounded-md bg-beige-700 hover:bg-beige-800"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>

      {currentAddress && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-beige-800">
            Current Address
          </h3>
          <div className="p-4 border rounded-lg border-beige-200 bg-beige-50">
            <p className="text-sm text-beige-700">{currentAddress}</p>
          </div>
        </div>
      )}
    </div>
  );
}
