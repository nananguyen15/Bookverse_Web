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
            <h1 className="text-2xl font-bold mb-4">My Account</h1>
            <div className="flex border-b mb-4">
                {accountLinks.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `px-4 py-2 -mb-px border-b-2 ${isActive
                                ? "border-red-500 text-red-500"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
