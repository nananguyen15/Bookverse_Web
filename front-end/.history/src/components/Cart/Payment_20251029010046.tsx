import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCart } from "../../contexts/CartContext";
import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";
import { provinces, districts, wards } from "vietnam-provinces";

const shippingSchema = z.object({
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

type ShippingFormValues = z.infer<typeof shippingSchema>;

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

export function Payment() {
  const navigate = useNavigate();
  const { cartDetails, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [districtOptions, setDistrictOptions] = useState<District[]>([]);
  const [wardOptions, setWardOptions] = useState<Ward[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
  });

  const selectedProvince = watch("province");
  const selectedDistrict = watch("district");

  // Update district options when province changes
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

  // Update ward options when district changes
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

  const onSubmit = (data: ShippingFormValues) => {
    const orderId = `BV-${Date.now()}`;
    const newOrder = {
      orderId,
      items: cartDetails.itemsWithDetails,
      summary: { ...cartDetails },
      shippingInfo: data,
      paymentMethod,
      status: "Preparing",
      orderDate: new Date().toISOString(),
    };

    // Save order
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Save shipping address to user addresses
    const addresses = JSON.parse(localStorage.getItem("userAddresses") || "[]");
    const addressExists = addresses.some(
      (addr: ShippingFormValues & { id: string }) =>
        addr.fullName === data.fullName &&
        addr.phone === data.phone &&
        addr.province === data.province &&
        addr.district === data.district &&
        addr.ward === data.ward &&
        addr.street === data.street
    );

    if (!addressExists) {
      const newAddress = {
        id: `addr-${Date.now()}`,
        ...data,
      };
      addresses.push(newAddress);
      localStorage.setItem("userAddresses", JSON.stringify(addresses));
    }

    clearCart();
    navigate(`/order-confirmed/${orderId}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-12 bg-beige-50 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-8 text-3xl font-bold text-center text-beige-900">
            Checkout
          </h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-12 lg:grid-cols-2"
          >
            {/* Shipping Address */}
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-beige-900">Shipping Address</h2>
              <div className="space-y-4">
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
                    Street Address
                  </label>
                  <textarea
                    id="street"
                    {...register("street")}
                    className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm border-beige-300 focus:ring-beige-500 focus:border-beige-500"
                    rows={3}
                    placeholder="01 dien bien phu, vinh quang"
                  ></textarea>
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.street.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order & Payment */}
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Your Order</h2>
              <div className="space-y-2">
                {cartDetails.itemsWithDetails.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.title} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <hr className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Promotion Discount (10%)</span>
                  <span>-${cartDetails.promotionDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {cartDetails.shippingFee === 0
                      ? "Free"
                      : `$${cartDetails.shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${cartDetails.total.toFixed(2)}</span>
                </div>
              </div>

              <h2 className="mt-6 mb-4 text-xl font-bold">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-md cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mr-3"
                  />
                  <span>Ship COD (Cash on Delivery)</span>
                </label>
                <label className="flex items-center p-3 border rounded-md cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="vnpay"
                    checked={paymentMethod === "vnpay"}
                    onChange={() => setPaymentMethod("vnpay")}
                    className="mr-3"
                  />
                  <span>VNPay QR</span>
                </label>
              </div>

              {paymentMethod === "vnpay" && (
                <div className="flex flex-col items-center p-4 mt-4 border-2 border-dashed rounded-lg">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example"
                    alt="QR Code"
                    className="w-40 h-40"
                  />
                  <p className="mt-2 text-sm text-center">
                    Scan this QR code with your banking app to pay.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 mt-6 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
              >
                Place Order
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
