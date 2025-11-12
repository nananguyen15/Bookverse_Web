import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Homepage } from "./components/Home/Homepage";
import { Allbooks } from "./components/Home/pages/Allbooks";
import { Allseries } from "./components/Home/pages/Allseries";
import { AboutUs } from "./components/AboutUs/AboutUs";
import { QuestionAndAnswer } from "./components/Q&A/Question&Answer";
import { SignIn } from "./components/Auth/SignIn";
import { SignUp } from "./components/Auth/SignUp";
import { VerifyEmail } from "./components/Auth/VerifyEmail";
import { ProductDetail } from "./pages/ProductDetail";
import { CartProvider } from "./contexts/CartContext";
import { Cart } from "./components/Cart/Cart";
import { Payment } from "./components/Cart/Payment";
import { Order } from "./components/Cart/Order";
import { OrderConfirmation } from "./components/Cart/OrderConfirmation";
import { MyAccount } from "./components/CustomerProfile/MyAccount";
import { CustomerProfile } from "./components/CustomerProfile/CustomerProfile";
import { Profile } from "./components/CustomerProfile/Profile";
import { Address } from "./components/CustomerProfile/Address";
import { ChangePassword } from "./components/CustomerProfile/ChangePassword";
import { OrderHistory } from "./components/CustomerProfile/OrderHistory";
import { ReviewHistory } from "./components/CustomerProfile/ReviewHistory";
import { Notifications } from "./components/CustomerProfile/Notifications";

// Khởi tạo users một lần khi app load
const initializeDefaultUsers = () => {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  if (!users.some((u: any) => u.username === "admin")) {
    users.push({
      username: "admin",
      email: "admin@bookverse.com",
      password: "Vuivui123@",
      role: "admin",
    });
  }
  if (!users.some((u: any) => u.username === "staff")) {
    users.push({
      username: "staff",
      email: "staff@bookverse.com",
      password: "Staff123@",
      role: "staff",
    });
  }
  localStorage.setItem("users", JSON.stringify(users));
};

initializeDefaultUsers();

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/allbooks" element={<Allbooks />} />
            <Route path="/books" element={<Allbooks />} />
            <Route path="/allseries" element={<Allseries />} />
            <Route path="/series" element={<Allseries />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/qa" element={<QuestionAndAnswer />} />
            <Route path="/faq" element={<QuestionAndAnswer />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/:type/:id/:slug?" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Payment />} />
            <Route
              path="/order-confirmed/:orderId"
              element={<OrderConfirmation />}
            />
            <Route path="/order/:orderId" element={<Order />} />

            <Route path="/profile" element={<CustomerProfile />}>
              <Route index element={<Navigate to="my-account" replace />} />
              <Route path="my-account" element={<MyAccount />}>
                <Route index element={<Profile />} />
                <Route path="personal-info" element={<Profile />} />
                <Route path="address" element={<Address />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
              <Route path="orders" element={<OrderHistory />} />
              <Route path="reviews" element={<ReviewHistory />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
            
            
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
