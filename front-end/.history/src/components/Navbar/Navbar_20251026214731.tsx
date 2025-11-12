import { IoMdNotifications, IoMdSearch } from "react-icons/io";
import clsx from "clsx";
import { CategoryDropdown } from "./CategoryDropdown";

export function Navbar() {
  const baseButton =
    "flex items-center justify-center px-3 py-1 text-center transition-colors bg-transparent border rounded-md";
  const beigeButton =
    "border-beige-700 text-beige-700 hover:bg-beige-700 hover:text-white";
  const links: [string, string][] = [
    ["Books", "#"],
    ["Series", "#"],
    ["Category", "#"],
    ["About Us", "#"],
    ["Q&A", "#"],
  ];
  return (
    <nav className="flex flex-row items-center justify-between px-16 py-3 bg-beige-50">
      {/* Brand text */}
      <h1 className="brand-text mr-7">
        <a href="#">BookVerse</a>
      </h1>

      {/* Navigation links */}
      <div className="flex-1">
        <ul className="flex flex-row gap-5">
          {links.map(([title, url]) => (
            <li key={title}>
              <a
                href={url}
                className="inline-block text-gray-800 transition-colors group hover:text-beige-900 font-heading"
              >
                <span className="relative z-10">{title}</span>
                <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-beige-300 mt-1" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Right section: Search + Notifications + Cart + Auth*/}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search books..."
            className="w-64 px-2 py-1 transition-all border-b-2 border-transparent outline-none hover:border-beige-500"
          />
          <button className="search-btn" aria-label="Search">
            <IoMdSearch className="mr-3 w-7 h-7 text-beige-700" />
          </button>
          <a href="#">
            <IoMdNotifications className="mr-3 w-7 h-7 text-beige-700" />
          </a>
          <div className="flex gap-3">
            {/* Dùng thẻ <a> thay vì <button>, style như button */}
            <a href="/login" className={clsx(baseButton, beigeButton)}>
              Login
            </a>
            <a href="/signup" className={clsx(baseButton, beigeButton)}>
              Sign Up
            </a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <a href="/" className="font-medium transition-colors text-beige-900 hover:text-beige-700">Books</a>
          <a href="/series" className="font-medium transition-colors text-beige-900 hover:text-beige-700">Series</a>
          <CategoryDropdown />
          <a href="/about" className="font-medium transition-colors text-beige-900 hover:text-beige-700">About Us</a>
          <a href="/qa" className="font-medium transition-colors text-beige-900 hover:text-beige-700">Q&A</a>
        </div>
      </div>
    </nav>
  );
}
