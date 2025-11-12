import { IoMdNotifications } from "react-icons/io";

export function Navbar() {
  return (
    <nav className="flex flex-row">
      <h1>
        <a href="#">BookVerse</a>
      </h1>
      <div className="flex-start">
        <ul className="flex flex-row gap-5">
          <li>
            <a href="#">Books</a>
          </li>
          <li>
            <a href="#">Series</a>
          </li>
          <li>
            <a href="#">Category</a>
          </li>
          <li>
            <a href="#">About Us</a>
          </li>
          <li>
            <a href="#">Q&amp;A</a>
          </li>
        </ul>
      </div>
      <div className="">
        <div>
          <input type="text" placeholder="Search books..." class/>
          <button>Search</button>
          <IoMdNotifications />
          <button>Login</button>
          <button>Sign Up</button>
        </div>
      </div>
    </nav>
  );
}
