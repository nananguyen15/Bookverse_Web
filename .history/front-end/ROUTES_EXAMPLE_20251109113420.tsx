// Example: How to setup protected routes in your App.tsx or router file

import { Routes, Route, Navigate } from "react-router-dom";
import {
  ProtectedRoute,
  AdminRoute,
  StaffRoute,
  CustomerRoute,
  AdminOrStaffRoute,
} from "./components/Auth/ProtectedRoute";
import { Unauthorized } from "./components/Auth/Unauthorized";

// Auth Pages
import { SignIn } from "./components/Auth/SignIn";
import { SignUp } from "./components/Auth/SignUp";
import { VerifyEmail } from "./components/Auth/VerifyEmail";
import { ForgotPassword } from "./components/Auth/ForgotPassword";

// Public Pages
import { Home } from "./components/Home/Home";
import { Books } from "./components/Books/Books";
import { ProductDetail } from "./pages/ProductDetail";
import { AboutUs } from "./components/AboutUs/AboutUs";
import { QA } from "./components/Q&A/QA";

// Customer Pages
import { Cart } from "./components/Cart/Cart";
import { Order } from "./components/Cart/Order";
import { CustomerProfile } from "./components/CustomerProfile/CustomerProfile";

// Staff Pages
import { StaffLayout } from "./components/Staff/StaffLayout";

// Admin Pages
import { AdminLayout } from "./components/Admin/AdminLayout";

function AppRoutes() {
  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      {/* Không cần login, ai cũng vào được */}
      <Route path="/" element={<Home />} />
      <Route path="/books" element={<Books />} />
      <Route path="/books/:id" element={<ProductDetail />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/faq" element={<QA />} />
      <Route path="/search" element={<SearchResults />} />

      {/* ==================== AUTH ROUTES ==================== */}
      {/* Các trang authentication */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ==================== PROTECTED ROUTES ==================== */}
      {/* Cần login, nhưng không giới hạn role */}

      {/* Profile - Tất cả user đã login */}
      <Route
        path="/profile/*"
        element={
          <ProtectedRoute>
            <CustomerProfile />
          </ProtectedRoute>
        }
      />

      {/* ==================== CUSTOMER ONLY ROUTES ==================== */}
      {/* Chỉ CUSTOMER mới vào được */}

      {/* Cart */}
      <Route
        path="/cart"
        element={
          <CustomerRoute>
            <Cart />
          </CustomerRoute>
        }
      />

      {/* Order */}
      <Route
        path="/order"
        element={
          <CustomerRoute>
            <Order />
          </CustomerRoute>
        }
      />

      {/* Order Confirmation */}
      <Route
        path="/order-confirmation"
        element={
          <CustomerRoute>
            <OrderConfirmation />
          </CustomerRoute>
        }
      />

      {/* ==================== STAFF ONLY ROUTES ==================== */}
      {/* Chỉ STAFF mới vào được */}

      <Route
        path="/staff/*"
        element={
          <StaffRoute>
            <StaffLayout />
          </StaffRoute>
        }
      />

      {/* ==================== ADMIN ONLY ROUTES ==================== */}
      {/* Chỉ ADMIN mới vào được */}

      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      />

      {/* ==================== ADMIN OR STAFF ROUTES ==================== */}
      {/* ADMIN hoặc STAFF đều vào được */}

      <Route
        path="/manage/*"
        element={
          <AdminOrStaffRoute>
            <ManagementPanel />
          </AdminOrStaffRoute>
        }
      />

      {/* ==================== 404 NOT FOUND ==================== */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default AppRoutes;

// ==================== USAGE EXAMPLES ====================

// 1. Navbar với conditional rendering theo role
import { useAuth } from "./contexts/AuthContext";

function Navbar() {
  const { isAuthenticated, user, userRole, logout } = useAuth();

  return (
    <nav>
      {/* Public links - Ai cũng thấy */}
      <Link to="/">Home</Link>
      <Link to="/books">Books</Link>
      <Link to="/about">About</Link>

      {/* Authenticated links */}
      {isAuthenticated ? (
        <>
          {/* Customer only */}
          {userRole === "CUSTOMER" && (
            <>
              <Link to="/cart">Cart</Link>
              <Link to="/order">My Orders</Link>
            </>
          )}

          {/* Staff only */}
          {userRole === "STAFF" && <Link to="/staff">Staff Panel</Link>}

          {/* Admin only */}
          {userRole === "ADMIN" && <Link to="/admin">Admin Panel</Link>}

          {/* Admin or Staff */}
          {["ADMIN", "STAFF"].includes(userRole!) && (
            <Link to="/manage">Management</Link>
          )}

          {/* All authenticated users */}
          <Link to="/profile">Profile</Link>

          {/* Avatar with dropdown */}
          <div className="avatar-dropdown">
            <img src={user?.image || "/default-avatar.png"} alt="avatar" />
            <div className="dropdown">
              <p>{user?.username}</p>
              <p>Role: {userRole}</p>
              <button onClick={logout}>Logout</button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Not authenticated */}
          <Link to="/signin">Sign In</Link>
          <Link to="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
}

// 2. Component với conditional features theo role
function BookCard({ book }) {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <div className="book-card">
      <h3>{book.title}</h3>
      <p>{book.price}</p>

      {/* Public actions */}
      <Link to={`/books/${book.id}`}>View Details</Link>

      {/* Customer actions */}
      {isAuthenticated && userRole === "CUSTOMER" && (
        <button onClick={() => addToCart(book.id)}>Add to Cart</button>
      )}

      {/* Staff actions */}
      {isAuthenticated && ["ADMIN", "STAFF"].includes(userRole!) && (
        <>
          <button onClick={() => editBook(book.id)}>Edit</button>
          <button onClick={() => deleteBook(book.id)}>Delete</button>
        </>
      )}
    </div>
  );
}

// 3. Redirect based on role sau login
function handleLoginSuccess(token, user) {
  // Save to AuthContext
  login(token, user);

  // Navigate theo role
  switch (user.role) {
    case "ADMIN":
      navigate("/admin");
      break;
    case "STAFF":
      navigate("/staff");
      break;
    case "CUSTOMER":
      navigate("/"); // hoặc '/profile'
      break;
    default:
      navigate("/");
  }
}

// 4. Check permission trong component
function DeleteButton({ itemId }) {
  const { userRole } = useAuth();

  // Chỉ ADMIN mới được delete
  if (userRole !== "ADMIN") {
    return null; // Hoặc return disabled button
  }

  return <button onClick={() => deleteItem(itemId)}>Delete</button>;
}

// 5. Programmatic navigation với permission check
function navigateToPage(page) {
  const { isAuthenticated, userRole } = useAuth();

  // Check authentication
  if (!isAuthenticated) {
    alert("Please login first");
    navigate("/signin");
    return;
  }

  // Check role
  const requiredRoles = {
    "/admin": ["ADMIN"],
    "/staff": ["STAFF"],
    "/manage": ["ADMIN", "STAFF"],
    "/cart": ["CUSTOMER"],
  };

  const required = requiredRoles[page];
  if (required && !required.includes(userRole!)) {
    alert(`This page requires role: ${required.join(" or ")}`);
    navigate("/unauthorized");
    return;
  }

  // OK, navigate
  navigate(page);
}
