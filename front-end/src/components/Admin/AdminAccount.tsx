import { NavLink, Outlet } from "react-router-dom";
import { ManagementLayout } from "../Shared/Management/ManagementLayout";

const accountLinks = [
  { to: "profile", label: "My Profile" },
  { to: "change-password", label: "Change Password" },
];

export function AdminAccount() {
  return (
    <ManagementLayout>
      <div className="max-w-4xl mx-auto mt-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-beige-900">My Account</h2>
          <p className="mt-1 text-beige-600">
            Manage your admin account settings
          </p>
        </div>

        <div className="flex mb-6 border-b border-beige-200">
          {accountLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-3 -mb-px border-b-2 font-medium ${isActive
                  ? "border-beige-700 text-beige-900"
                  : "border-transparent text-beige-700 hover:text-beige-900 hover:border-beige-300"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div>
          <Outlet />
        </div>
      </div>
    </ManagementLayout>
  );
}
