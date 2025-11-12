import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaChartBar,
  FaBook,
  FaLayerGroup,
  FaTags,
  FaShoppingCart,
  FaStar,
  FaBullhorn,
  FaBell,
  FaUsers,
  FaUserTie,
  FaUserCircle,
} from "react-icons/fa";

export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [adminProfile, setAdminProfile] = useState({
    username: "Admin",
    avatarUrl: null as string | null,
  });

  useEffect(() => {
    // Load admin profile
    const loadProfile = () => {
      const profile = localStorage.getItem("adminProfile");
      if (profile) {
        const data = JSON.parse(profile);
        setAdminProfile(data);
      }
    };

    loadProfile();

    // Listen for profile updates
    window.addEventListener("adminProfileUpdated", loadProfile);

    return () => {
      window.removeEventListener("adminProfileUpdated", loadProfile);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const navItems = [
    { to: "/admin", icon: FaChartBar, label: "Statistics" },
    { to: "/admin/customers", icon: FaUsers, label: "Customers" },
    { to: "/admin/staff", icon: FaUserTie, label: "Staff" },
    { to: "/admin/books", icon: FaBook, label: "Books" },
    { to: "/admin/series", icon: FaLayerGroup, label: "Series" },
    { to: "/admin/categories", icon: FaTags, label: "Categories" },
    { to: "/admin/orders", icon: FaShoppingCart, label: "Orders" },
    { to: "/admin/reviews", icon: FaStar, label: "Reviews" },
    { to: "/admin/promotions", icon: FaBullhorn, label: "Promotions" },
    { to: "/admin/notifications", icon: FaBell, label: "Notifications" },
  ];

  return (
    <div className="flex h-screen bg-beige-50">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-beige-900 text-beige-50">
        <div className="p-6 border-b border-beige-700">
          <Link to="/admin" className="text-2xl brand-text text-beige-50">
            BookVerse
          </Link>
          <p className="mt-1 text-sm text-beige-300">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-beige-700 text-white"
                    : "text-beige-300 hover:bg-beige-800 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-beige-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 transition-colors rounded-lg text-beige-300 hover:bg-beige-800 hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="px-8 py-4 bg-white border-b border-beige-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-beige-900">
              Admin Dashboard
            </h1>

            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                onMouseEnter={() => setShowAccountMenu(true)}
                className="flex items-center gap-3 px-4 py-2 transition-colors rounded-lg hover:bg-beige-50"
              >
                {adminProfile.avatarUrl ? (
                  <img
                    src={adminProfile.avatarUrl}
                    alt="Admin Avatar"
                    className="object-cover w-10 h-10 border-2 rounded-full border-beige-300"
                  />
                ) : (
                  <FaUserCircle className="w-10 h-10 text-beige-400" />
                )}
                <div className="text-left">
                  <p className="font-semibold text-beige-900">
                    {adminProfile.username}
                  </p>
                  <p className="text-xs text-beige-600">Administrator</p>
                </div>
              </button>

              {showAccountMenu && (
                <div
                  className="absolute right-0 z-50 w-48 py-2 mt-2 bg-white border rounded-lg shadow-lg border-beige-200"
                  onMouseLeave={() => setShowAccountMenu(false)}
                >
                  <Link
                    to="/admin/my-account"
                    onClick={() => setShowAccountMenu(false)}
                    className="block px-4 py-2 transition-colors text-beige-700 hover:bg-beige-50"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left transition-colors text-beige-700 hover:bg-beige-50"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
