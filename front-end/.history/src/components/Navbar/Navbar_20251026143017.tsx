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
    <nav className="flex flex-row w-full px-10 py-3">
      <h1 className="text-xl font-bold mr-7">
        <a href="#">BookVerse</a>
      </h1>
      <div className="flex-start">
        <ul className="flex flex-row gap-5">
          {links.map(([title, url]) => (
            <li key={title}>
              <a
                href={url}
                className="group inline-block text-gray-800 hover:text-sky-600 transition-colors"
              >
                <span className="relative z-10">{title}</span>
                <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-sky-600 mt-1" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Right section: Search Notifications */}
      <div className="flex justify-end gap-4">
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search books..." className="" />
          <button className="search-btn" aria-label="Search">
            <IoMdSearch />
          </button>
          <IoMdNotifications />
          <div className="flex gap-2">
            <button className="px-3 py-1">
              <a href="#">Login</a>
            </button>
            <button className="px-3 py-1">
              <a href="#">Sign Up</a>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
