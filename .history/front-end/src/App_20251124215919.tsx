import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Homepage } from "./components/Home/Homepage";
import { Allbooks } from "./components/Home/pages/Allbooks";
import { AboutUs } from "./components/AboutUs/AboutUs";
import { QuestionAndAnswer } from "./components/Q&A/Question&Answer";
import { SignIn } from "./components/Auth/SignIn";
import { SignUp } from "./components/Auth/SignUp";
import { VerifyEmail } from "./components/Auth/VerifyEmail";
import { ForgotPassword } from "./components/Auth/ForgotPassword";
import { ProductDetail } from "./pages/ProductDetail";
import { CartProvider } from "./contexts/CartContext";
import { Cart } from "./components/Cart/Cart";
import { Payment } from "./components/Cart/Payment";
import { Order } from "./components/Cart/Order";
import { OrderConfirmed } from "./components/Cart/OrderConfirmed";
import { CustomerOnlyRoute } from "./components/Auth/CustomerOnlyRoute";
import { AdminOnlyRoute } from "./components/Auth/AdminOnlyRoute";
import { StaffOnlyRoute } from "./components/Auth/StaffOnlyRoute";
import { MyAccount } from "./components/CustomerProfile/MyAccount";
import { CustomerProfile } from "./components/CustomerProfile/CustomerProfile";
import { Profile } from "./components/CustomerProfile/Profile";
import { Address } from "./components/CustomerProfile/Address";
import { ChangePassword } from "./components/CustomerProfile/ChangePassword";
import { OrderHistory } from "./components/CustomerProfile/OrderHistory";
import { MyReviews } from "./components/CustomerProfile/MyReviews";
import { Notifications } from "./components/CustomerProfile/Notifications";
import { StatisticDashboard } from "./components/Admin/StatisticDashboard";
import { AdminAccount } from "./components/Admin/AdminAccount";
import { NotificationManagement } from "./components/Admin/NotificationManagement";

// New Management Components
import { CustomerManagementNew } from "./components/Admin/CustomerManagementNew";
import { StaffManagementNew } from "./components/Admin/StaffManagementNew";
import { BookManagementNew } from "./components/Admin/BookManagementNew";
import { AuthorManagementNew } from "./components/Admin/AuthorManagementNew";
import { PublisherManagementNew } from "./components/Admin/PublisherManagementNew";
import { SupCategoryManagementNew } from "./components/Admin/SupCategoryManagementNew";
import { SubCategoryManagementNew } from "./components/Admin/SubCategoryManagementNew";
import { OrderManagementNew } from "./components/Admin/OrderManagementNew";
import { ManageReviewNew } from "./components/Admin/ManageReviewNew";
import { PromotionManagementNew } from "./components/Admin/PromotionManagementNew";
import { StaffLayout } from "./components/Staff/StaffLayout";
import { StaffAccount } from "./components/Staff/StaffAccount";
import { StaffProfile } from "./components/Staff/StaffProfile";
import { StaffChangePassword } from "./components/Staff/StaffChangePassword";
import { CompletePayment } from "./components/Payment/CompletePayment";
import { OrderDetails } from "./pages/OrderDetails";
import { ChangeAddress } from "./pages/ChangeAddress";
import { VNPayReturn } from "./pages/VNPayReturn";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/allbooks" element={<Allbooks />} />
            <Route path="/books" element={<Allbooks />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/qa" element={<QuestionAndAnswer />} />
            <Route path="/faq" element={<QuestionAndAnswer />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/:type/:id/:slug?" element={<ProductDetail />} />

            {/* Customer-only routes */}
            <Route path="/cart" element={<CustomerOnlyRoute><Cart /></CustomerOnlyRoute>} />
            <Route path="/order" element={<CustomerOnlyRoute><Payment /></CustomerOnlyRoute>} />
            <Route path="/order-confirmed" element={<CustomerOnlyRoute><OrderConfirmed /></CustomerOnlyRoute>} />
            <Route path="/order-confirmed/:orderId" element={<CustomerOnlyRoute><OrderConfirmed /></CustomerOnlyRoute>} />
            <Route path="/complete-payment/:orderId" element={<CustomerOnlyRoute><CompletePayment /></CustomerOnlyRoute>} />
            <Route path="/order/:orderId" element={<CustomerOnlyRoute><Order /></CustomerOnlyRoute>} />
            <Route path="/order/:id" element={<CustomerOnlyRoute><OrderDetails /></CustomerOnlyRoute>} />
            <Route path="/order/:id/change-address" element={<CustomerOnlyRoute><ChangeAddress /></CustomerOnlyRoute>} />

            {/* VNPay Payment Return Handler */}
            <Route path="/payment/vnpay/return" element={<VNPayReturn />} />

            <Route path="/profile" element={<CustomerProfile />}>
              <Route index element={<Navigate to="my-account" replace />} />
              <Route path="my-account" element={<MyAccount />}>
                <Route index element={<Profile />} />
                <Route path="personal-info" element={<Profile />} />
                <Route path="address" element={<Address />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
              <Route path="orders" element={<OrderHistory />} />
              <Route path="reviews" element={<MyReviews />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={<StaffOnlyRoute><StaffLayout /></StaffOnlyRoute>}>
              <Route index element={<Navigate to="my-account" replace />} />
              <Route path="my-account" element={<StaffAccount />}>
                <Route index element={<StaffProfile />} />
                <Route path="personal-info" element={<StaffProfile />} />
                <Route
                  path="change-password"
                  element={<StaffChangePassword />}
                />
              </Route>
              <Route path="books" element={<BookManagementNew />} />
              <Route path="authors" element={<AuthorManagementNew />} />
              <Route path="publishers" element={<PublisherManagementNew />} />
              <Route path="sup-categories" element={<SupCategoryManagementNew />} />
              <Route path="sub-categories" element={<SubCategoryManagementNew />} />
              <Route path="orders" element={<OrderManagementNew />} />
              <Route path="reviews" element={<ManageReviewNew />} />
              <Route path="my-notifications" element={<Notifications />} />
              <Route path="notifications" element={<NotificationManagement noLayout={true} />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminOnlyRoute><StatisticDashboard /></AdminOnlyRoute>} />
            <Route path="/admin/statistics" element={<AdminOnlyRoute><StatisticDashboard /></AdminOnlyRoute>} />
            <Route path="/admin/customers" element={<AdminOnlyRoute><CustomerManagementNew /></AdminOnlyRoute>} />
            <Route path="/admin/staff" element={<AdminOnlyRoute><StaffManagementNew /></AdminOnlyRoute>} />
            <Route path="/admin/books" element={<AdminOnlyRoute><BookManagementNew /></AdminOnlyRoute>} />
            <Route path="/admin/authors" element={<AdminOnlyRoute><AuthorManagementNew /></AdminOnlyRoute>} />
            <Route path="/admin/publishers" element={<AdminOnlyRoute><PublisherManagementNew /></AdminOnlyRoute>} />
            <Route path="/admin/sup-categories" element={<AdminOnlyRoute><SupCategoryManagementNew /></AdminOnlyRoute>} />
            <Route path="/admin/sub-categories" element={<AdminOnlyRoute><SubCategoryManagementNew /></AdminOnlyRoute>} />
            <Route path="/admin/orders" element={<AdminOnlyRoute><OrderManagementNew /></AdminOnlyRoute>} />
            <Route path="/admin/reviews" element={<AdminOnlyRoute><ManageReviewNew /></AdminOnlyRoute>} />
            <Route path="/admin/promotions" element={<AdminOnlyRoute><PromotionManagementNew /></AdminOnlyRoute>} />
            <Route path="/admin/notifications" element={<AdminOnlyRoute><NotificationManagement /></AdminOnlyRoute>} />
            <Route path="/admin/my-notifications" element={<AdminOnlyRoute><Notifications /></AdminOnlyRoute>} />
            <Route path="/admin/my-account" element={<AdminOnlyRoute><AdminAccount /></AdminOnlyRoute>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
