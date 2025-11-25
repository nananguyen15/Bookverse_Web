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
  FaBars,
  FaTimes,
} from "react-icons/fa";

export function StaffLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  // Persist sidebar state in localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('staffSidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [staffProfile, setStaffProfile] = useState({
    username: "Staff",
    avatarUrl: null as string | null,
  });

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('staffSidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

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
      <aside className={`flex flex-col bg-beige-900 text-beige-50 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'}`}>
        <div className={`flex items-center p-6 border-b border-beige-700 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <div className="flex items-center justify-between flex-1 mr-2">
              <Link to="/staff" className="text-2xl brand-text text-beige-50">
                BookVerse
              </Link>
              <NotificationDropdown />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-beige-300 hover:text-beige-50 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
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
                } ${!sidebarOpen && "justify-center"}`
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Account Menu */}
        <div className="border-t border-beige-700">
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className={`w-full flex items-center gap-3 p-4 transition-colors hover:bg-beige-800 ${!sidebarOpen && "justify-center"}`}
            >
              {staffProfile.avatarUrl ? (
                <img
                  src={staffProfile.avatarUrl}
                  alt="Staff Avatar"
                  className="object-cover w-10 h-10 border-2 rounded-full border-beige-700 shrink-0"
                />
              ) : (
                <FaUserCircle className="w-10 h-10 text-beige-400 shrink-0" />
              )}
              {sidebarOpen && (
                <div className="text-left overflow-hidden">
                  <p className="font-semibold text-beige-50 truncate">{staffProfile.username}</p>
                  <p className="text-xs text-beige-400 truncate">Staff Account</p>
                </div>
              )}
            </button>

            {showAccountMenu && (
              <div
                className="absolute bg-beige-800 border border-beige-700 rounded-lg shadow-xl overflow-hidden z-[9999]"
                style={{
                  ...(sidebarOpen
                    ? { bottom: '100%', marginBottom: '0.5rem', left: 0, right: 0 }
                    : { bottom: 0, left: '100%', marginLeft: '0.5rem', width: '12rem' }
                  )
                }}
              >
                <NavLink
                  to="/staff/my-notifications"
                  className="block px-4 py-3 text-beige-100 hover:bg-beige-700 transition-colors whitespace-nowrap"
                  onClick={() => setShowAccountMenu(false)}
                >
                  My Notifications
                </NavLink>
                <NavLink
                  to="/staff/my-account"
                  className="block px-4 py-3 text-beige-100 hover:bg-beige-700 transition-colors whitespace-nowrap"
                  onClick={() => setShowAccountMenu(false)}
                >
                  My Account
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-beige-100 hover:bg-beige-700 transition-colors whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Toggle Button (Mobile - when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-beige-900 text-beige-50 rounded-lg shadow-lg md:hidden"
          aria-label="Open sidebar"
        >
          <FaBars className="w-5 h-5" />
        </button>
      )}

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
