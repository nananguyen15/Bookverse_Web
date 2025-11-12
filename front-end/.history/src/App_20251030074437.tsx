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
import { AdminLayout } from "./components/Admin/AdminLayout";
import { StatisticDashboard } from "./components/Admin/StatisticDashboard";
import { BookManagement } from "./components/Admin/BookManagement";
import { AdminAccount } from "./components/Admin/AdminAccount";
import { CateManagement } from "./components/Admin/CateManagement";
import { SeriesManagement } from "./components/Admin/SeriesManagement";
import { CustomerManagement } from "./components/Admin/CustomerManagement";
import { StaffManagement } from "./components/Admin/StaffManagement";
import { OrderManagement } from "./components/Admin/OrderManagement";
import { ManageReview } from "./components/Admin/ManageReview";
import { Promotion } from "./components/Admin/Promotion";
import { NotificationManagement } from "./components/Admin/NotificationManagement";
import { StaffLayout } from "./components/Staff/StaffLayout";
import { StaffAccount } from "./components/Staff/StaffAccount";
import { StaffProfile } from "./components/Staff/StaffProfile";
import { StaffChangePassword } from "./components/Staff/StaffChangePassword";
import { BookManagement as StaffBookManagement } from "./components/Shared/BookManagement";
import { SeriesManagement as StaffSeriesManagement } from "./components/Shared/SeriesManagement";
import { CateManagement as StaffCateManagement } from "./components/Shared/CateManagement";
import { OrderManagement as StaffOrderManagement } from "./components/Shared/OrderManagement";
import { ManageReview as StaffManageReview } from "./components/Shared/ManageReview";
import { NotificationManagement as StaffNotificationManagement } from "./components/Shared/NotificationManagement";
import { initializeAdminData } from "./utils/initAdminData";

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
initializeAdminData(); // Initialize books and categories

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

            {/* Staff Routes */}
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<Navigate to="my-account" replace />} />
              <Route path="my-account" element={<StaffAccount />}>
                <Route index element={<StaffProfile />} />
                <Route path="personal-info" element={<StaffProfile />} />
                <Route path="change-password" element={<StaffChangePassword />} />
              </Route>
              <Route path="books" element={<StaffBookManagement />} />
              <Route path="series" element={<StaffSeriesManagement />} />
              <Route path="categories" element={<StaffCateManagement />} />
              <Route path="orders" element={<StaffOrderManagement />} />
              <Route path="reviews" element={<StaffManageReview />} />
              <Route path="notifications" element={<StaffNotificationManagement />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<StatisticDashboard />} />
              <Route path="statistics" element={<StatisticDashboard />} />
              <Route path="books" element={<BookManagement />} />
              <Route path="series" element={<SeriesManagement />} />
              <Route path="categories" element={<CateManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="staff" element={<StaffManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="reviews" element={<ManageReview />} />
              <Route path="promotions" element={<Promotion />} />
              <Route
                path="notifications"
                element={<NotificationManagement />}
              />
              <Route path="my-account" element={<AdminAccount />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
