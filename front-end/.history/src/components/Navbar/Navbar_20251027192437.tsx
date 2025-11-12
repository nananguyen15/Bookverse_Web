import { useState } from "react";
import { IoMdNotifications } from "react-icons/io";
import clsx from "clsx";
import SearchSuggest from "../Search/SearchSuggest";
import { CategoryDropdown } from "./CategoryDropdown";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const baseButton =
    "flex items-center justify-center px-3 py-1 text-center transition-colors bg-transparent border rounded-md whitespace-nowrap";
  const beigeButton =
    "border-beige-700 text-beige-700 hover:bg-beige-700 hover:text-white";
  const links: [string, string][] = [
    ["Books", "/books"],
    ["Series", "/series"],
    ["About Us", "/about-us"],
    ["Q&A", "/faq"],
  ];

  return (
    <nav className="flex flex-row items-center justify-between px-16 py-3 bg-beige-50">
      {/* Brand text */}
      <h1 className="brand-text mr-7">
        <Link to="/">BookVerse</Link>
      </h1>

      {/* Navigation links */}
      <div className="flex-1">
        <ul className="flex flex-row items-center gap-5">
          {links.map(([title, url]) => (
            <li key={title}>
              <Link
                to={url}
                className="inline-block text-gray-800 transition-colors group hover:text-beige-900 font-heading"
              >
                <span className="relative z-10">{title}</span>
                <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-beige-300 mt-1" />
              </Link>
            </li>
          ))}
          <li>
            <CategoryDropdown />
          </li>
        </ul>
      </div>

      {/* Right section: Search + Notifications + Cart + Auth*/}
      <div className="flex items-center gap-4">
        <SearchSuggest />
        <Link to={isAuthenticated ? "/notifications" : "/signin"}>
          <IoMdNotifications className="w-7 h-7 text-beige-700" />
        </Link>
        <Link to={isAuthenticated ? "/cart" : "/signin"}>
          <svg
            className="w-6 h-6 text-beige-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </Link>

        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-10 h-10 overflow-hidden border-2 rounded-full border-beige-300"
            >
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=User`}
                alt="User Avatar"
              />
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 z-50 w-48 mt-2 bg-white rounded-md shadow-lg">
                <ul className="py-1">
                  <li>
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-beige-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Account
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-beige-100"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-3">
            <Link to="/signin" className={clsx(baseButton, beigeButton)}>
              Sign In
            </Link>
            <Link to="/signup" className={clsx(baseButton, beigeButton)}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
