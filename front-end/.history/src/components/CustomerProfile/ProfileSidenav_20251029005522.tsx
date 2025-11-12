import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const sidenavLinks = [
  { to: "/profile/my-account", label: "My Account" },
  { to: "/profile/orders", label: "My Orders" },
  { to: "/profile/reviews", label: "My Reviews" },
  { to: "/profile/notifications", label: "Notifications" },
];

export function ProfileSidenav() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("User");

  useEffect(() => {
    // Load profile data from localStorage
    const loadProfile = () => {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        if (profileData.avatarUrl) {
          setAvatarUrl(profileData.avatarUrl);
        }
        if (profileData.fullName) {
          setFullName(profileData.fullName);
        }
      }
    };

    loadProfile();

    // Listen for profile updates
    window.addEventListener("profileUpdated", loadProfile);

    return () => {
      window.removeEventListener("profileUpdated", loadProfile);
    };
  }, []);

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
        {sidenavLinks.map((link) => (
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
