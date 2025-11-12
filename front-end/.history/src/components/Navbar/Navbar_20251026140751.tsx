import { IoMdNotifications } from "react-icons/io";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3">
      {/* left: logo */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">
          <a href="#">BookVerse</a>
        </h1>
      </div>

      {/* center: menu (chiếm không gian và căn giữa) */}
      <div className="hidden md:flex flex-1 justify-center">
        <ul className="flex gap-6">
          {/* repeat pattern cho mỗi link: text + animated underline */}
          <li>
            <a
              href="#"
              className="relative group inline-block pb-1"
            >
              <span className="transition-colors duration-[1500ms] group-hover:text-current">
                Books
              </span>
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-current transform scale-x-0 origin-left transition-transform duration-[1500ms] group-hover:scale-x-100" />
            </a>
          </li>

          <li>
            <a href="#" className="relative group inline-block pb-1">
              <span className="transition-colors duration-[1500ms] group-hover:text-current">
                Series
              </span>
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-current transform scale-x-0 origin-left transition-transform duration-[1500ms] group-hover:scale-x-100" />
            </a>
          </li>

          <li>
            <a href="#" className="relative group inline-block pb-1">
              <span className="transition-colors duration-[1500ms] group-hover:text-current">
                Category
              </span>
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-current transform scale-x-0 origin-left transition-transform duration-[1500ms] group-hover:scale-x-100" />
            </a>
          </li>

          <li>
            <a href="#" className="relative group inline-block pb-1">
              <span className="transition-colors duration-[1500ms] group-hover:text-current">
                About Us
              </span>
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-current transform scale-x-0 origin-left transition-transform duration-[1500ms] group-hover:scale-x-100" />
            </a>
          </li>

          <li>
            <a href="#" className="relative group inline-block pb-1">
              <span className="transition-colors duration-[1500ms] group-hover:text-current">
                Q&amp;A
              </span>
              <span className="absolute left-0 bottom-0 h-[2px] w-full bg-current transform scale-x-0 origin-left transition-transform duration-[1500ms] group-hover:scale-x-100" />
            </a>
          </li>
        </ul>
      </div>

      {/* right: search + actions */}
      <div className="flex items-center space-x-4">
        {/* search box with underline for both input and icon */}
        <div className="flex items-center border-b-2 border-transparent hover:border-current focus-within:border-current transition-colors duration-300">
          <input
            type="text"
            placeholder="Search books..."
            className="bg-transparent outline-none px-2 py-1"
          />
          <button
            className="p-1 flex items-center justify-center"
            aria-label="Search"
          >
            {/* inline search icon (no external import) */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-current"
            >
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="11"
                cy="11"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* notification icon */}
        <IoMdNotifications className="text-xl" />

        {/* auth buttons */}
        <button className="px-3 py-1">Login</button>
        <button className="px-3 py-1 bg-blue-600 text-white rounded">Sign Up</button>
      </div>
    </nav>
  );
}
