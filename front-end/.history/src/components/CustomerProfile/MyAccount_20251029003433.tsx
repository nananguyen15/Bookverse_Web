import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const accountLinks = [
    { to: "personal-info", label: "Personal Information" },
    { to: "address", label: "Address" },
    { to: "change-password", label: "Change Password" },
];

export function MyAccount() {
    return (
        <div>
            <h1 className="mb-6 text-3xl font-bold text-beige-900">My Account</h1>
            <div className="flex mb-6 border-b border-beige-200">
                {accountLinks.map(link => (
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
    );
}
