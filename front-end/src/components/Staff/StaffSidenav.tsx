import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const staffNavLinks = [
  { to: "/staff/my-account", label: "My Account" },
  { to: "/staff/books", label: "Manage Books" },
  { to: "/staff/series", label: "Manage Series" },
  { to: "/staff/categories", label: "Manage Categories" },
  { to: "/staff/orders", label: "Manage Orders" },
  { to: "/staff/reviews", label: "Manage Reviews" },
  { to: "/staff/notifications", label: "Notifications" },
];

export function StaffSidenav() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("Staff");

  useEffect(() => {
    // Load staff profile from users localStorage
    const loadProfile = () => {
      if (user?.username) {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const staffUser = users.find((u: any) => u.username === user.username);

        if (staffUser) {
          setFullName(staffUser.fullName || staffUser.username);
          setAvatarUrl(staffUser.avatarUrl || null);
        }
      }
    };

    loadProfile();

    // Listen for profile updates
    window.addEventListener("staffProfileUpdated", loadProfile);

    return () => {
      window.removeEventListener("staffProfileUpdated", loadProfile);
    };
  }, [user]);

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
              `block px-4 py-3 rounded-md transition-colors font-medium ${
                isActive
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
