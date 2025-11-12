import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function UserDropdown() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="w-10 h-10 overflow-hidden border-2 rounded-full border-beige-300"
      >
        {/* Replace with actual user avatar if available */}
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=User`}
          alt="User Avatar"
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg"
          onMouseLeave={() => setIsOpen(false)}
        >
          <ul className="py-1">
            <li>
              <Link
                to="/profile/my-account"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-beige-100"
                onClick={() => setIsOpen(false)}
              >
                My Account
              </Link>
            </li>
            <li>
              <Link
                to="/profile/orders"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-beige-100"
                onClick={() => setIsOpen(false)}
              >
                My Orders
              </Link>
            </li>
            <li>
              <Link
                to="/profile/reviews"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-beige-100"
                onClick={() => setIsOpen(false)}
              >
                My Reviews
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-beige-100"
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
