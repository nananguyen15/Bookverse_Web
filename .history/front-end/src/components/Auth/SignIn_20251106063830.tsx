import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { GoogleLoginButton } from "../Auth/GoogleLoginButton";
import { useAuth } from "../../contexts/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authApi } from "../../api/endpoints/auth.api";

export function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting login with username:", username);
      
      // Call backend API to authenticate
      const authResponse = await authApi.signIn({
        username,
        password,
      });

      if (!authResponse.authenticated || !authResponse.token) {
        setError("Invalid username or password.");
        return;
      }

      console.log("✓ Authentication successful, token:", authResponse.token);

      // Get user info with the token
      // Store token in localStorage first so apiClient can use it
      localStorage.setItem("token", authResponse.token);
      
      const userInfo = await authApi.getMyInfo();
      console.log("✓ User info:", userInfo);

      // Login with token and role
      login(authResponse.token, userInfo.role, userInfo.username);

      // Navigate based on role
      if (userInfo.role === "ADMIN") {
        navigate("/admin");
      } else if (userInfo.role === "STAFF") {
        navigate("/staff");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      
      if (error.response?.status === 401) {
        setError("Invalid username or password.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Login failed. Please try again.");
      }
      
      // Clear token on error
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
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
            disabled={isLoading}
            className="w-full py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <div className="my-6 text-center text-beige-500">Or Login With</div>

        <div className="flex gap-4">
          <GoogleLoginButton />
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
