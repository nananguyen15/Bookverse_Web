import {NotiIcon} from './icon/Notifications';
export function Navbar() {
  return (
    <nav className="flex flex-row">
      <h1> <a href="#">BookVerse</a></h1>
      <div className="flex-start">
        <ul className="flex flex-row">
          <li><a href="#">Books</a></li>
          <li><a href="#">Series</a></li>
          <li><a href="#">Category</a></li>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Q&amp;A</a></li>
        </ul>
      </div>
      <div className="flex-end">
        <div>
          <input type="text" placeholder="Search books..." />
          <button>Search</button>
        </div>
        <div>
          <No
        </div>
        <div>
          <button>Login</button>
          <button>Sign Up</button>
        </div>

      </div>
    </nav>
  )
}