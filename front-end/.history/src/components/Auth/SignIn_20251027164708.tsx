import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { GoogleLoginButton } from "../Auth/GoogleLoginButton";
// import { FacebookLoginButton } from "./FacebookLoginButton";

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};
    if (!validateEmail(email)) newErrors.email = "Invalid email format.";
    if (!validatePassword(password))
      newErrors.password = "Password must be at least 8 characters.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Proceed with login
      console.log("Logging in with", { email, password });
      navigate("/");
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
          Enter your email and password to access your account.
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-beige-800">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-beige-800">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
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
