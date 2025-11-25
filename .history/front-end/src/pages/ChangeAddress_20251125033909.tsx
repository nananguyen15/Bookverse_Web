import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderApi } from "../api";
import type { OrderResponse } from "../types";
import { canChangeAddress } from "../utils/orderHelpers";
import { provinces, districts, wards } from "vietnam-provinces";

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

export function ChangeAddress() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [street, setStreet] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [districtOptions, setDistrictOptions] = useState<District[]>([]);
  const [wardOptions, setWardOptions] = useState<Ward[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const orderData = await orderApi.getOrderById(Number(id));

      // Check if address can be changed
      if (!canChangeAddress(orderData.status)) {
        alert("Address cannot be changed for this order status");
        navigate(`/order/${id}`);
        return;
      }

      setOrder(orderData);

      // Parse address (format: "street, ward, district, province")
      if (orderData.address) {
        const addressParts = orderData.address.split(",").map((part) => part.trim());
        if (addressParts.length === 4) {
          const [streetAddr, wardName, districtName, provinceName] = addressParts;
          setStreet(streetAddr);
          setProvince(provinceName);
          // District and ward will be set after options are loaded
          setTimeout(() => {
            setDistrict(districtName);
            setTimeout(() => {
              setWard(wardName);
            }, 100);
          }, 100);
        }
      }
    } catch (error) {
      console.error("Failed to load order:", error);
      alert("Failed to load order details. Please try again.");
      navigate("/my-account/orders");
    } finally {
      setLoading(false);
    }
  };

  // Update district options when province changes
  useEffect(() => {
    if (province) {
      const provinceData = provinces.find((p) => p.name === province);
      if (provinceData) {
        const filteredDistricts = districts.filter(
          (d) => d.province_code === provinceData.code
        );
        setDistrictOptions(filteredDistricts);
        if (!district) {
          setWardOptions([]);
        }
      }
    } else {
      setDistrictOptions([]);
      setWardOptions([]);
      setDistrict("");
      setWard("");
    }
  }, [province, district]);

  // Update ward options when district changes
  useEffect(() => {
    if (district) {
      const districtData = districts.find((d) => d.name === district);
      if (districtData) {
        const filteredWards = wards.filter(
          (w) => w.district_code === districtData.code
        );
        setWardOptions(filteredWards);
        if (!ward) {
          setWard("");
        }
      }
    } else {
      setWardOptions([]);
      setWard("");
    }
  }, [district, ward]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!order) return;

    // Validation
    if (!street.trim()) {
      setError("Street address is required");
      return;
    }

    if (!province) {
      setError("Province is required");
      return;
    }

    if (!district) {
      setError("District is required");
      return;
    }

    if (!ward) {
      setError("Ward is required");
      return;
    }

    // Build full address
    const fullAddress = `${street.trim()}, ${ward}, ${district}, ${province}`;

    if (fullAddress === order.address) {
      setError("New address must be different from current address");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await orderApi.changeMyOrderAddress(order.id, { address: fullAddress });

      alert("Address updated successfully!");
      navigate(`/order/${order.id}`);
    } catch (error) {
      console.error("Failed to update address:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to update address. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-b-2 rounded-full animate-spin border-beige-700"></div>
          <p className="mt-4 text-beige-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-beige-200 p-8">
          <h1 className="text-2xl font-bold text-beige-900 mb-6">
            Change Shipping Address
          </h1>

          {/* Order Info */}
          <div className="bg-beige-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Order ID</p>
                <p className="font-semibold text-gray-900">#{order.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-semibold text-gray-900">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Current Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Address
            </label>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700">{order.address}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Province */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province/City <span className="text-red-500">*</span>
              </label>
              <select
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setError("");
                }}
                disabled={submitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">Select Province/City</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setError("");
                }}
                disabled={submitting || !province}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">Select District</option>
                {districtOptions.map((d) => (
                  <option key={d.code} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ward <span className="text-red-500">*</span>
              </label>
              <select
                value={ward}
                onChange={(e) => {
                  setWard(e.target.value);
                  setError("");
                }}
                disabled={submitting || !district}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">Select Ward</option>
                {wardOptions.map((w) => (
                  <option key={w.code} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Street */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => {
                  setStreet(e.target.value);
                  setError("");
                }}
                disabled={submitting}
                placeholder="House number, street name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige-500 focus:border-beige-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-red-400 mr-2 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Address can only be changed while the order is in
                PENDING status.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(`/order/${order.id}`)}
                disabled={submitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-beige-700 text-white rounded-lg hover:bg-beige-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Address"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
