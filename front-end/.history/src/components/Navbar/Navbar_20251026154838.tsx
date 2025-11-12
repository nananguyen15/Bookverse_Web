import { IoMdNotifications, IoMdSearch } from "react-icons/io";

export function Navbar() {
  const links: [string, string][] = [
    ["Books", "#"],
    ["Series", "#"],
    ["Category", "#"],
    ["About Us", "#"],
    ["Q&A", "#"],
  ];
  return (
    <nav className="flex flex-row items-center justify-between w-full px-10 py-3 bg-beige-100">
      {/* Brand text */}
      <h1 className="font-bold mr-7 text-beige-900 font-brand">
        <a href="#">BookVerse</a>
      </h1>

      {/* Navigation links */}
      <div className="flex-1">
        <ul className="flex flex-row gap-5">
          {links.map(([title, url]) => (
            <li key={title}>
              <a
                href={url}
                className="inline-block text-gray-800 transition-colors group hover:text-sky-600"
              >
                <span className="relative z-10">{title}</span>
                <span className="block max-w-0 group-hover:max-w-full transition-all duration-200 h-0.5 bg-sky-600 mt-1" />
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
            className="w-64 px-2 py-1 transition-all border-b-2 border-transparent outline-none focus:border-blue-500 hover:border-blue-400"
          />
          <button className="search-btn" aria-label="Search">
            <IoMdSearch />
          </button>
          <a href="#">
            <IoMdNotifications />
          </a>
          <div className="flex gap-2 ">
            <button className="px-3 py-1 transition-colors border rounded-md background-transparent border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white">
              <a href="#">Login</a>
            </button>
            <button className="px-3 py-1 transition-colors border rounded-md background-transparent border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white">
              <a href="#">Sign Up</a>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
