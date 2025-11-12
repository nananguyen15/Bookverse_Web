import { IoMdNotifications, IoMdSearch } from "react-icons/io";
import clsx from "clsx";
import { CategoryDropdown } from "./CategoryDropdown";
import SearchSuggest from "../Search/SearchSuggest";

export function Navbar() {
  const baseButton =
    "flex items-center justify-center px-3 py-1 text-center transition-colors bg-transparent border rounded-md";
  const beigeButton =
    "border-beige-700 text-beige-700 hover:bg-beige-700 hover:text-white";
  const links: [string, string][] = [
    ["Books", "/allbooks"],
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
      </div>
      <div className="flex items-center gap-4">
        <SearchSuggest />
        <button className="p-2 text-beige-700 hover:text-beige-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button className="p-2 text-beige-700 hover:text-beige-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
