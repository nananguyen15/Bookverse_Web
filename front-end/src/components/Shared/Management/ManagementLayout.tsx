import { useState, useEffect, ReactNode } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { usersApi } from "../../../api";
import {
  FaChartBar,
  FaBook,
  FaTags,
  FaShoppingCart,
  FaStar,
  FaBullhorn,
  FaBell,
  FaUsers,
  FaUserTie,
  FaUserCircle,
  FaUserEdit,
  FaBuilding,
  FaFolderOpen,
  FaBars,
  FaTimes,
} from "react-icons/fa";

interface ManagementLayoutProps {
  children: ReactNode;
}

export function ManagementLayout({ children }: ManagementLayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [userProfile, setUserProfile] = useState({
    username: "User",
    name: "User",
    avatarUrl: null as string | null,
  });

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setShowAccountMenu(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowAccountMenu(false);
    }, 300); // 300ms delay before hiding
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userInfo = await usersApi.getMyInfo();
        setUserProfile({
          username: userInfo.username,
          name: userInfo.name || userInfo.username,
          avatarUrl: userInfo.image || null,
        });
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    loadProfile();

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
    { to: "/admin/authors", icon: FaUserEdit, label: "Authors" },
    { to: "/admin/publishers", icon: FaBuilding, label: "Publishers" },
    { to: "/admin/sup-categories", icon: FaFolderOpen, label: "Parent Categories" },
    { to: "/admin/sub-categories", icon: FaTags, label: "Sub Categories" },
    { to: "/admin/orders", icon: FaShoppingCart, label: "Orders" },
    { to: "/admin/reviews", icon: FaStar, label: "Reviews" },
    { to: "/admin/promotions", icon: FaBullhorn, label: "Promotions" },
    { to: "/admin/notifications", icon: FaBell, label: "Notifications" },
  ];

  return (
    <div className="flex h-screen bg-beige-50">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-beige-900 text-beige-50 transition-all duration-300 relative ${sidebarOpen ? "w-64" : "w-0 md:w-20"
          }`}
      >
        {/* Row 1: Brand */}
        <div className={`flex items-center p-6 border-b border-beige-700 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <Link to="/admin" className="flex items-center gap-2">
              <span className="brand-text text-beige-50 text-2xl">
                BookVerse
              </span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-beige-300 hover:text-beige-50 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>

        {/* Row 2: Navigation (flex-1) */}
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

        {/* Row 3: User Profile */}
        <div className="border-t border-beige-700">
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`w-full flex items-center gap-3 p-4 transition-colors hover:bg-beige-800 ${!sidebarOpen && "justify-center"
                }`}
            >
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="object-cover w-10 h-10 border-2 rounded-full border-beige-700 shrink-0"
                />
              ) : (
                <FaUserCircle className="w-10 h-10 text-beige-400 shrink-0" />
              )}
              {sidebarOpen && (
                <div className="text-left overflow-hidden">
                  <p className="font-semibold text-beige-50 truncate">{userProfile.name}</p>
                  <p className="text-xs text-beige-400 truncate">@{userProfile.username}</p>
                </div>
              )}
            </button>

            {/* Hover Menu */}
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
                <Link
                  to="/admin/my-account"
                  className="block px-4 py-3 text-beige-100 hover:bg-beige-700 transition-colors whitespace-nowrap"
                  onClick={() => setShowAccountMenu(false)}
                >
                  My Account
                </Link>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
