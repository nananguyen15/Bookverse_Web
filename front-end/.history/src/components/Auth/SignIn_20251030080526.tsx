import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { GoogleLoginButton } from "../Auth/GoogleLoginButton";
import { useAuth } from "../../contexts/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Debug: Check and init users on component mount
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    console.log("Current users in localStorage:", users);

    if (users.length === 0 || !users.some((u: any) => u.username === "admin")) {
      const defaultUsers = [
        {
          username: "admin",
          email: "admin@bookverse.com",
          password: "Vuivui123@",
          role: "admin",
        },
        {
          username: "staff",
          email: "staff@bookverse.com",
          password: "Staff123@",
          role: "staff",
        },
      ];
      localStorage.setItem("users", JSON.stringify(defaultUsers));
      console.log("Initialized default users:", defaultUsers);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("Attempting login with username:", username, password);

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    console.log("Available users:", users);

    const user = users.find(
      (u: any) => u.username === username && u.password === password
    );

    console.log("Found user:", user);

    if (user) {
      const mockToken = `token-for-${user.username}`;
      console.log("Logging in with token:", mockToken, "role:", user.role);
      login(mockToken, user.role, user.username);

      // Điều hướng dựa trên vai trò
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "staff") {
        navigate("/staff");
      } else {
        navigate("/");
      }
    } else {
      setError("Invalid username or password.");
    }
  };

  const inputClass =
    "w-full px-4 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500";

  const imageContent = (
    <div className="z-10 text-center">
      <h2 className="mb-4 text-4xl font-bold font-heading">
        Welcome to BookVerse
      </h2>
      <p className="text-lg text-beige-200">
        Effortlessly manage your reading journey and discover new worlds.
      </p>
    </div>
  );

  // Debug function to force initialize users
  const handleInitUsers = () => {
    const defaultUsers = [
      {
        username: "admin",
        email: "admin@bookverse.com",
        password: "Vuivui123@",
        role: "admin",
      },
      {
        username: "staff",
        email: "staff@bookverse.com",
        password: "Staff123@",
        role: "staff",
      },
    ];
    localStorage.setItem("users", JSON.stringify(defaultUsers));
    alert("Users initialized! Try logging in with admin / Vuivui123@");
    console.log("Force initialized users:", defaultUsers);
  };

  return (
    <AuthLayout imageContent={imageContent}>
      <div className="flex flex-col justify-center h-full max-w-md mx-auto">
        <h1 className="mb-2 text-4xl font-bold font-heading text-beige-900">
          Welcome Back
        </h1>
        <p className="mb-8 text-beige-600">
          Enter your username and password to access your account.
        </p>

        <form onSubmit={handleLogin}>
          {error && (
            <p className="mb-4 text-sm text-center text-red-500">{error}</p>
          )}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-beige-800">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-beige-800">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute -translate-y-1/2 right-3 top-1/2 text-beige-600 hover:text-beige-800"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center text-sm text-beige-700">
              <input
                type="checkbox"
                className="w-4 h-4 mr-2 rounded text-beige-700 focus:ring-beige-500"
              />
              Remember Me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-beige-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
          >
            Log In
          </button>
        </form>

        <div className="my-6 text-center text-beige-500">Or Login With</div>

        <div className="flex gap-4">
          <GoogleLoginButton />
          {/* <FacebookLoginButton /> */}
          <button className="flex-1 py-2 font-medium border rounded-lg border-beige-300 text-beige-800 hover:bg-beige-100">
            Facebook
          </button>
        </div>

        <p className="mt-8 text-center text-beige-700">
          Don't Have An Account?{" "}
          <Link to="/signup" className="font-semibold hover:underline">
            Register Now.
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
