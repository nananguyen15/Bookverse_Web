import { IoMdNotifications, IoMdSearch } from "react-icons/io";

export function Navbar() {
  return (
    <nav className="flex flex-row w-full px-10 py-3">
      <h1 className="text-xl font-bold">
        <a href="#">BookVerse</a>
      </h1>
      <div className="flex-start">
        <ul className="flex flex-row gap-5">
          <li>
            <a className="nav-link" href="#">Books</a>
          </li>
          <li>
            <a className="nav-link" href="#">Series</a>
          </li>
          <li>
            <a className="nav-link" href="#">Category</a>
          </li>
          <li>
            <a className="nav-link" href="#">About Us</a>
          </li>
          <li>
            <a className="nav-link" href="#">Q&amp;A</a>
          </li>
        </ul>
      </div>
      <div className="items-end">
        <div>
          <input type="text" placeholder="Search books..." className="" />
          <button>Search</button>
          <IoMdNotifications />
          <div className="gap">
            <button>
              <a href="#">Login</a>
            </button>
            <button>
              <a href="#">Sign Up</a>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
