import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { 
  FaChartBar, FaBook, FaLayerGroup, FaTags, FaShoppingCart, 
  FaStar, FaBullhorn, FaBell, FaUsers, FaUserTie, FaUserCircle 
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
    const profile = localStorage.getItem("adminProfile");
    if (profile) {
      const data = JSON.parse(profile);
      setAdminProfile(data);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const navItems = [
    { to: "/admin/dashboard", icon: FaChartBar, label: "Dashboard" },
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
      <aside className="w-64 bg-beige-900 text-beige-50 flex flex-col">
        <div className="p-6 border-b border-beige-700">
          <Link to="/admin/dashboard" className="brand-text text-beige-50 text-2xl">
            BookVerse
          </Link>
          <p className="text-beige-300 text-sm mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-beige-300 hover:bg-beige-800 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-beige-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-beige-900">
              Admin Dashboard
            </h1>

            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                onMouseEnter={() => setShowAccountMenu(true)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-beige-50 transition-colors"
              >
                {adminProfile.avatarUrl ? (
                  <img
                    src={adminProfile.avatarUrl}
                    alt="Admin Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-beige-300"
                  />
                ) : (
                  <FaUserCircle className="w-10 h-10 text-beige-400" />
                )}
                <div className="text-left">
                  <p className="font-semibold text-beige-900">{adminProfile.username}</p>
                  <p className="text-xs text-beige-600">Administrator</p>
                </div>
              </button>

              {showAccountMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-beige-200 py-2 z-50"
                  onMouseLeave={() => setShowAccountMenu(false)}
                >
                  <Link
                    to="/admin/my-account"
                    onClick={() => setShowAccountMenu(false)}
                    className="block px-4 py-2 text-beige-700 hover:bg-beige-50 transition-colors"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-beige-700 hover:bg-beige-50 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
