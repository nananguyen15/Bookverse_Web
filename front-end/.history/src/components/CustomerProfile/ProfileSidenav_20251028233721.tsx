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
    <div className="w-64 p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-4 mb-6">
        <img
          src="https://via.placeholder.com/64"
          alt="User Avatar"
          className="w-16 h-16 rounded-full"
        />
        <div>
          <p className="font-semibold">Nguyen Nhi</p>
          <p className="text-sm text-gray-500">Level: Silver</p>
        </div>
      </div>
      <nav className="space-y-2">
        {sidenavLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-red-500 text-white"
                  : "hover:bg-gray-100"
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
