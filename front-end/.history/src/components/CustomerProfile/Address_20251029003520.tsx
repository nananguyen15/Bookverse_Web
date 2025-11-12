import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { provinces, districts, wards } from "vietnam-provinces";

const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^0[3-9]\d{8}$/, "Invalid Vietnamese phone number"),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  ward: z.string().min(1, "Ward is required"),
  street: z.string().min(1, "Street address is required"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressType extends AddressFormValues {
  id: string;
}

interface District {
  code: string;
  name: string;
  parent_code: string;
}

interface Ward {
  code: string;
  name: string;
  parent_code: string;
}

export function Address() {
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(
    null
  );

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
          (d) => d.parent_code === provinceData.code
        );
        setDistrictOptions(filteredDistricts);
        setWardOptions([]);
        // Don't reset if we're editing and the district is valid
        if (!editingAddress) {
          setValue("district", "");
          setValue("ward", "");
        }
      }
    } else {
      setDistrictOptions([]);
      setWardOptions([]);
    }
  }, [selectedProvince, setValue, editingAddress]);

  useEffect(() => {
    if (selectedDistrict) {
      const districtData = districts.find((d) => d.name === selectedDistrict);
      if (districtData) {
        const filteredWards = wards.filter(
          (w) => w.parent_code === districtData.code
        );
        setWardOptions(filteredWards);
        // Don't reset if we're editing and the ward is valid
        if (!editingAddress) {
          setValue("ward", "");
        }
      }
    } else {
      setWardOptions([]);
    }
  }, [selectedDistrict, setValue, editingAddress]);

  // Load addresses from localStorage on mount
  useEffect(() => {
    const savedAddresses = JSON.parse(
      localStorage.getItem("userAddresses") || "[]"
    );
    setAddresses(savedAddresses);
  }, []);

  const saveAddressesToLocalStorage = (updatedAddresses: AddressType[]) => {
    localStorage.setItem("userAddresses", JSON.stringify(updatedAddresses));
  };

  const onSubmit = (data: AddressFormValues) => {
    if (editingAddress) {
      // Update existing address
      const updatedAddresses = addresses.map((addr) =>
        addr.id === editingAddress.id ? { ...addr, ...data } : addr
      );
      setAddresses(updatedAddresses);
      saveAddressesToLocalStorage(updatedAddresses);
      setEditingAddress(null);
    } else {
      // Add new address
      const newAddress = { ...data, id: `addr-${Date.now()}` };
      const updatedAddresses = [...addresses, newAddress];
      setAddresses(updatedAddresses);
      saveAddressesToLocalStorage(updatedAddresses);
    }
    reset();
  };

  const handleEdit = (address: AddressType) => {
    setEditingAddress(address);
    reset(address);
    
    // Load districts for the selected province
    const provinceData = provinces.find((p) => p.name === address.province);
    if (provinceData) {
      const filteredDistricts = districts.filter(
        (d) => d.parent_code === provinceData.code
      );
      setDistrictOptions(filteredDistricts);
      
      // Load wards for the selected district
      const districtData = districts.find((d) => d.name === address.district);
      if (districtData) {
        const filteredWards = wards.filter(
          (w) => w.parent_code === districtData.code
        );
        setWardOptions(filteredWards);
      }
    }
  };

  const handleDelete = (id: string) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== id);
    setAddresses(updatedAddresses);
    saveAddressesToLocalStorage(updatedAddresses);
  };

  const handleCancel = () => {
    setEditingAddress(null);
    reset();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-3xl font-bold text-beige-900">My Address</h2>

      <div className="mb-8">
        <h3 className="mb-4 text-xl font-semibold text-beige-800">
          {editingAddress ? "Edit Address" : addresses.length > 0 ? "Update Address" : "Add New Address"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">
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
                className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

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

          <div className="flex justify-end space-x-3">
            {editingAddress && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 font-medium border rounded-md text-beige-700 bg-white border-beige-300 hover:bg-beige-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 font-bold text-white rounded-md bg-beige-700 hover:bg-beige-800"
            >
              {editingAddress ? "Save Changes" : "Save Address"}
            </button>
          </div>
        </form>
      </div>

      {addresses.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-beige-800">Saved Addresses</h3>
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="p-4 border rounded-lg border-beige-200 bg-beige-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-beige-900">{address.fullName}</p>
                    <p className="text-sm text-beige-700">{address.phone}</p>
                    <p className="text-sm text-beige-700">
                      {`${address.street}, ${address.ward}, ${address.district}, ${address.province}`}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-sm font-medium text-beige-700 hover:text-beige-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}