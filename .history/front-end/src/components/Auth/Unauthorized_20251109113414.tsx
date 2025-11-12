import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function Unauthorized() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-beige-50">
      <div className="max-w-md p-8 text-center bg-white rounded-lg shadow-xl">
        <svg
          className="w-24 h-24 mx-auto mb-6 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        <h1 className="mb-4 text-3xl font-bold text-beige-900 font-heading">
          Access Denied
        </h1>

        <p className="mb-2 text-beige-600">
          You don't have permission to access this page.
        </p>

        {user && (
          <p className="mb-6 text-sm text-beige-500">
            Your current role:{" "}
            <span className="font-semibold">{user.role}</span>
          </p>
        )}

        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
          >
            Go to Homepage
          </Link>

          <button
            onClick={logout}
            className="block w-full px-6 py-3 font-semibold transition-colors border rounded-lg text-beige-700 border-beige-700 hover:bg-beige-50"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
