import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { UserDropdown } from "./UserDropdown";
import { IoMdNotifications } from "react-icons/io";
import { FaShoppingCart } from "react-icons/fa";
import SearchSuggest from "../Search/SearchSuggest";
import { CategoryDropdown } from "./CategoryDropdown";
import { NotificationDropdown } from "./NotificationDropdown";

export function Navbar() {
  const { isAuthenticated } = useAuth();

  const links: [string, string][] = [
    ["Books", "/books"],
    ["Series", "/series"],
    ["About Us", "/about-us"],
    ["Q&A", "/faq"],
  ];

  const authStyle =
    "px-4 py-2 text-sm font-semibold border rounded-md text-beige-700 border-beige-700 hover:bg-beige-700 hover:text-white whitespace-nowrap";

  return (
    <nav className="flex flex-row items-center justify-between px-16 py-3 bg-beige-50">
      <h1 className="mr-8 brand-text">
        <Link to="/">BookVerse</Link>
      </h1>

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

      <div className="flex items-center gap-5">
        <SearchSuggest />

        {isAuthenticated ? (
          <>
            <NotificationDropdown />
            <Link
              to="/cart"
              className="relative text-beige-700 hover:text-beige-900"
            >
              <FaShoppingCart className="w-6 h-6" />
              {/* Add cart count here if available */}
            </Link>
            <UserDropdown />
          </>
        ) : (
          <div className="flex gap-3">
            <Link to="/signin" className={authStyle}>
              Sign In
            </Link>
            <Link to="/signup" className="{authStyle}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
