import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { usersApi } from "../../api";

const staffNavLinks = [
  { to: "/staff/my-account", label: "My Account" },
  { to: "/staff/books", label: "Manage Books" },
  { to: "/staff/authors", label: "Manage Authors" },
  { to: "/staff/publishers", label: "Manage Publishers" },
  { to: "/staff/categories", label: "Manage Categories" },
  { to: "/staff/orders", label: "Manage Orders" },
  { to: "/staff/reviews", label: "Manage Reviews" },
  { to: "/staff/notifications", label: "Notification Management" },
];

export function StaffSidenav() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("Staff");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userInfo = await usersApi.getMyInfo();
        setFullName(userInfo.name || user.username || "Staff");
        setAvatarUrl(userInfo.image || null);
      } catch (error) {
        console.error("Failed to load staff profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener("staffProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("staffProfileUpdated", handleProfileUpdate);
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
              alt="Staff Avatar"
              className="object-cover w-16 h-16 border-4 rounded-full border-beige-200"
            />
          ) : (
            <FaUserCircle className="w-16 h-16 text-beige-300" />
          )}
          <div>
            <p className="font-semibold text-beige-900">{fullName}</p>
            <p className="text-sm text-beige-600">Staff Member</p>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {staffNavLinks.map((link) => (
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
