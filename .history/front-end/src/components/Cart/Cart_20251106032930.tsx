import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../Footer/Footer";

export function Cart() {
  const { cartDetails, updateQuantity, removeFromCart } = useCart();
  const { itemsWithDetails, subtotal, promotionDiscount, shippingFee, total } =
    cartDetails;

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 py-12 bg-beige-50 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-8 text-3xl font-bold text-center text-beige-900">
            Your Cart
          </h1>

          {itemsWithDetails.length === 0 ? (
            <div className="text-center">
              <p className="mb-4 text-lg text-beige-700">Your cart is empty.</p>
              <Link
                to="/allbooks"
                className="px-6 py-2 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="space-y-6 lg:col-span-2">
                {itemsWithDetails.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex gap-4 p-4 bg-white rounded-lg shadow-sm"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="object-cover w-24 h-32 rounded-md"
                    />
                    <div className="flex-grow">
                      <h2 className="font-bold text-beige-900">{item.title}</h2>
                      <p className="text-sm text-beige-600">
                        Price: ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.type,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="px-2 py-1 border rounded"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.type,
                              item.quantity + 1
                            )
                          }
                          className="px-2 py-1 border rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <p className="font-bold text-beige-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id, item.type)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="p-6 bg-white rounded-lg shadow-sm lg:col-span-1 h-fit">
                <h2 className="mb-4 text-xl font-bold text-beige-900">
                  Order Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Promotion (10%)</span>
                    <span>-${promotionDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>
                      {shippingFee === 0
                        ? "Free"
                        : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <Link to="/checkout">
                  <button className="w-full py-3 mt-6 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800">
                    Place Order
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
