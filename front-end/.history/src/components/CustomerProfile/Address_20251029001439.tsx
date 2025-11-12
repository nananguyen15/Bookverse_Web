import React, { useState, useEffect } from "react";
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
          (w) => w.parent_code === districtData.code
        );
        setWardOptions(filteredWards);
        setValue("ward", "");
      }
    } else {
      setWardOptions([]);
    }
  }, [selectedDistrict, setValue]);

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
    setIsFormVisible(false);
  };

  const handleEdit = (address: AddressType) => {
    setEditingAddress(address);
    reset(address);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== id);
    setAddresses(updatedAddresses);
    saveAddressesToLocalStorage(updatedAddresses);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    reset({
      fullName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      street: "",
    });
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setEditingAddress(null);
    reset();
    setIsFormVisible(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
        {!isFormVisible && (
          <button
            onClick={handleAddNew}
            className="px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Add New Address
          </button>
        )}
      </div>

      {isFormVisible && (
        <div className="p-6 mb-8 bg-gray-50 rounded-lg shadow">
          <h3 className="mb-4 text-xl font-semibold">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  {...register("fullName")}
                  className="block w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm"
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
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register("phone")}
                  className="block w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm"
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
                className="block text-sm font-medium text-gray-700"
              >
                Province/City
              </label>
              <select
                id="province"
                {...register("province")}
                className="block w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm"
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
                  className="block text-sm font-medium text-gray-700"
                >
                  District
                </label>
                <select
                  id="district"
                  {...register("district")}
                  className="block w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm"
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
                  className="block text-sm font-medium text-gray-700"
                >
                  Ward/Commune
                </label>
                <select
                  id="ward"
                  {...register("ward")}
                  className="block w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm"
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
                className="block text-sm font-medium text-gray-700"
              >
                Street, House No.
              </label>
              <input
                type="text"
                id="street"
                {...register("street")}
                className="block w-full px-3 py-2 mt-1 border-gray-300 rounded-md shadow-sm"
                placeholder="e.g., 123 Nguyen Hue Street"
              />
              {errors.street && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                {editingAddress ? "Save Changes" : "Save Address"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{address.fullName}</p>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                  <p className="text-sm text-gray-600">
                    {`${address.street}, ${address.ward}, ${address.district}, ${address.province}`}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
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
          ))
        ) : (
          <p className="text-center text-gray-500">
            You haven't added any addresses yet.
          </p>
        )}
      </div>
    </div>
  );
}
