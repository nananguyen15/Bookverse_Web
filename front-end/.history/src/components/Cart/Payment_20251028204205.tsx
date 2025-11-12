import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";

export function Payment() {
  const navigate = useNavigate();
  const { cartDetails, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `BV-${Date.now()}`;
    const newOrder = {
      orderId,
      items: cartDetails.itemsWithDetails,
      summary: { ...cartDetails },
      shippingInfo,
      paymentMethod,
      status: "preparing",
      orderDate: new Date().toISOString(),
    };

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    clearCart();
    navigate(`/order-confirmed/${orderId}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-12 bg-beige-50 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-8 text-3xl font-bold text-center text-beige-900">Checkout</h1>
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Shipping Address */}
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <input type="text" required onChange={e => setShippingInfo({...shippingInfo, fullName: e.target.value})} className="w-full px-3 py-2 mt-1 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone Number</label>
                  <input type="tel" required onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})} className="w-full px-3 py-2 mt-1 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Address</label>
                  <textarea required onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} className="w-full px-3 py-2 mt-1 border rounded-md" rows={3}></textarea>
                </div>
              </div>
            </div>

            {/* Order & Payment */}
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Your Order</h2>
              <div className="space-y-2">
                {cartDetails.itemsWithDetails.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.title} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <hr className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${cartDetails.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{cartDetails.shippingFee === 0 ? 'Free' : `$${cartDetails.shippingFee.toFixed(2)}`}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>${cartDetails.total.toFixed(2)}</span></div>
              </div>

              <h2 className="mt-6 mb-4 text-xl font-bold">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-md cursor-pointer">
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="mr-3" />
                  <span>Ship COD (Cash on Delivery)</span>
                </label>
                <label className="flex items-center p-3 border rounded-md cursor-pointer">
                  <input type="radio" name="payment" value="vnpay" checked={paymentMethod === "vnpay"} onChange={() => setPaymentMethod("vnpay")} className="mr-3" />
                  <span>VNPay QR</span>
                </label>
              </div>

              {paymentMethod === "vnpay" && (
                <div className="flex flex-col items-center p-4 mt-4 border-2 border-dashed rounded-lg">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example" alt="QR Code" className="w-40 h-40" />
                  <p className="mt-2 text-sm text-center">Scan this QR code with your banking app to pay.</p>
                </div>
              )}

              <button type="submit" className="w-full py-3 mt-6 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800">
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
