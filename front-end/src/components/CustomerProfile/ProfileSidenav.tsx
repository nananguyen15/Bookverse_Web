import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { usersApi } from "../../api";

const sidenavLinks = [
  { to: "/profile/my-account", label: "My Account", roles: ["customer", "staff", "admin"] },
  { to: "/profile/orders", label: "My Orders", roles: ["customer"] },
  { to: "/profile/reviews", label: "My Reviews", roles: ["customer"] },
  { to: "/profile/notifications", label: "Notifications", roles: ["customer", "staff", "admin"] },
];

export function ProfileSidenav() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("User");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userInfo = await usersApi.getMyInfo();
        setFullName(userInfo.name || user.username || "User");
        setAvatarUrl(userInfo.image || null);
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="h-fit bg-white rounded-lg shadow-md sticky top-4 p-6">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-beige-200 rounded-full"></div>
          <div className="mt-4 h-4 bg-beige-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-fit bg-white rounded-lg shadow-md sticky top-4">
      <div className="p-6 border-b border-beige-200">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="object-cover w-16 h-16 border-4 rounded-full border-beige-200"
            />
          ) : (
            <FaUserCircle className="w-16 h-16 text-beige-300" />
          )}
          <div>
            <p className="font-semibold text-beige-900">{fullName}</p>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {sidenavLinks
          .filter((link) => !user?.role || link.roles.includes(user.role.toLowerCase()))
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-md transition-colors font-medium ${isActive
                  ? "bg-beige-700 text-white"
                  : "text-beige-800 hover:bg-beige-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
      </nav>
    </div>
  );
}
