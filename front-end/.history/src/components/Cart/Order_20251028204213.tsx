import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";

export function Order() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const foundOrder = orders.find((o: any) => o.orderId === orderId);
    setOrder(foundOrder);
  }, [orderId]);

  if (!order) {
    return <div>Loading order details or order not found...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-beige-50">
        <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 mb-4 text-green-600 bg-green-100 rounded-full">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-beige-900">Order Confirmed!</h1>
            <p className="mt-2 text-beige-600">Thank you for your order! Your books are on their way.</p>
          </div>

          <div className="py-6 my-6 border-t border-b border-beige-200">
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
            <div className="space-y-3 text-sm text-beige-700">
              <div className="flex justify-between"><span className="font-medium">Order ID:</span><span>{order.orderId}</span></div>
              <div className="flex justify-between"><span className="font-medium">Items:</span><span>{order.items.map((i: any) => i.title).join(', ')}</span></div>
              <div className="flex justify-between"><span className="font-medium">Total:</span><span className="font-bold">${order.summary.total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="font-medium">Delivery Time:</span><span>3-5 business days</span></div>
              <div className="flex justify-between"><span className="font-medium">Address:</span><span className="text-right">{order.shippingInfo.address}</span></div>
              <div className="flex justify-between"><span className="font-medium">Payment:</span><span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'VNPay'}</span></div>
            </div>
          </div>

          <div className="space-y-4">
            <Link to="/" className="flex items-center justify-center w-full py-3 font-semibold text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600">
              Back to Home
            </Link>
            <button className="w-full py-3 font-semibold text-red-500 transition-colors border-2 border-red-500 rounded-lg hover:bg-red-500 hover:text-white">
              Track Order
            </button>
          </div>
          
          <div className="flex justify-between mt-6 text-sm">
            <a href="#" className="text-blue-600 hover:underline">Need Help? Contact Us</a>
            <a href="#" className="text-blue-600 hover:underline">Reorder This</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
