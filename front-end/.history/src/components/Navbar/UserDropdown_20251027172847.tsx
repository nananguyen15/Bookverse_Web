import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-beige-300">
        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=User`} alt="User Avatar" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
          <ul className="py-1">
            <li>
              <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-beige-100">My Account</Link>
            </li>
            <li>
              <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-beige-100">
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
