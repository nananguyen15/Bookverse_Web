import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const sidenavLinks = [
  { to: "/profile/my-account", label: "My Account" },
  { to: "/profile/orders", label: "My Orders" },
  { to: "/profile/reviews", label: "My Reviews" },
  { to: "/profile/notifications", label: "Notifications" },
];

export function ProfileSidenav() {
  return (
    <div className="h-fit bg-white rounded-lg shadow-md sticky top-4">
      <div className="p-6 border-b border-beige-200">
        <div className="flex items-center gap-4">
          <img
            src="https://api.dicebear.com/7.x/initials/svg?seed=User"
            alt="User Avatar"
            className="w-16 h-16 border-4 rounded-full border-beige-200"
          />
          <div>
            <p className="font-semibold text-beige-900">Nguyen Nhi</p>
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
