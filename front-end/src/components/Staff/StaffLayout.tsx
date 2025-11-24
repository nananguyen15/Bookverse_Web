import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usersApi } from "../../api";
import { NotificationDropdown } from "../layout/Navbar/NotificationDropdown";
import {
  FaBook,
  FaTags,
  FaShoppingCart,
  FaStar,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";

export function StaffLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [staffProfile, setStaffProfile] = useState({
    username: "Staff",
    avatarUrl: null as string | null,
  });

  useEffect(() => {
    // Load staff profile from API
    const loadProfile = async () => {
      try {
        const userInfo = await usersApi.getMyInfo();
        setStaffProfile({
          username: userInfo.name || userInfo.username,
          avatarUrl: userInfo.image || null,
        });
      } catch (error) {
        console.error("Failed to load staff profile:", error);
      }
    };

    loadProfile();

    // Listen for profile updates
    window.addEventListener("staffProfileUpdated", loadProfile);

    return () => {
      window.removeEventListener("staffProfileUpdated", loadProfile);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const navItems = [
    { to: "/staff/books", icon: FaBook, label: "Books" },
    { to: "/staff/authors", icon: FaUserCircle, label: "Authors" },
    { to: "/staff/publishers", icon: FaBook, label: "Publishers" },
    { to: "/staff/sup-categories", icon: FaTags, label: "Parent Categories" },
    { to: "/staff/sub-categories", icon: FaTags, label: "Sub Categories" },
    { to: "/staff/orders", icon: FaShoppingCart, label: "Orders" },
    { to: "/staff/reviews", icon: FaStar, label: "Reviews" },
    { to: "/staff/notifications", icon: FaBell, label: "Notifications" },
  ];

  return (
    <div className="flex h-screen bg-beige-50">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-beige-900 text-beige-50">
        <div className="p-6 border-b border-beige-700">
          <div className="flex items-center justify-between">
            <Link to="/staff" className="text-2xl brand-text text-beige-50">
              BookVerse
            </Link>
            <NotificationDropdown />
          </div>
          <p className="mt-1 text-sm text-beige-300">Staff Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
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

        {/* Account Menu */}
        <div className="relative p-4 border-t border-beige-700">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center w-full gap-3 px-4 py-3 transition-colors rounded-lg hover:bg-beige-800"
          >
            {staffProfile.avatarUrl ? (
              <img
                src={staffProfile.avatarUrl}
                alt="Staff Avatar"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <FaUserCircle className="w-8 h-8" />
            )}
            <div className="flex-1 text-left">
              <p className="font-medium">{staffProfile.username}</p>
              <p className="text-sm text-beige-300">Staff Account</p>
            </div>
          </button>

          {showAccountMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg overflow-hidden">
              <NavLink
                to="/staff/my-notifications"
                className="block px-4 py-3 text-beige-900 hover:bg-beige-100 transition-colors"
                onClick={() => setShowAccountMenu(false)}
              >
                My Notifications
              </NavLink>
              <NavLink
                to="/staff/my-account"
                className="block px-4 py-3 text-beige-900 hover:bg-beige-100 transition-colors"
                onClick={() => setShowAccountMenu(false)}
              >
                My Account
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-beige-50">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
