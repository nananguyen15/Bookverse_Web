import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authApi } from "../../api/endpoints/auth.api";

export function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    agreed: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (username: string) => {
    // Backend validates: ^[a-zA-Z0-9_]+$ with length 8-32
    const usernameRegex = /^[a-zA-Z0-9_]{8,32}$/;
    if (!usernameRegex.test(username)) {
      return "Username must be 8-32 characters, containing only letters, numbers, and underscores.";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format.";
    return "";
  };

  const validatePassword = (password: string) => {
    // Backend validates: ^[a-zA-Z0-9_]+$ with length 8-16
    const passwordRegex = /^[a-zA-Z0-9_]{8,16}$/;
    if (!passwordRegex.test(password)) {
      return "Password must be 8-16 characters, containing only letters, numbers, and underscores.";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    newErrors.username = validateUsername(formData.username);
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    if (!formData.agreed) newErrors.agreed = "You must agree to the terms.";

    // Remove empty errors
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // Call backend API to sign up
        const user = await authApi.signUp({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        console.log("✓ User registered successfully:", user);

        // Send OTP to email
        try {
          await authApi.sendOTP({
            email: formData.email,
            userId: user.id,
            tokenType: "LOGIN",
          });

          console.log("✓ OTP sent to email:", formData.email);

          // Navigate to verify email page with user data
          navigate("/verify-email", {
            state: {
              userId: user.id,
              email: formData.email,
              username: user.username,
            },
          });
        } catch (otpError: any) {
          console.error("❌ Failed to send OTP:", otpError);
          alert(
            `Account created successfully, but failed to send OTP. Please try signing in or contact support.`
          );
          navigate("/signin");
        }
      } catch (error: any) {
        console.error("❌ Sign up failed:", error);

        // Handle backend validation errors
        if (error.response?.data?.message) {
          const message = error.response.data.message;
          if (message.includes("USERNAME")) {
            setErrors({
              username: "Username already exists or invalid format",
            });
          } else if (message.includes("EMAIL")) {
            setErrors({ email: "Email already registered or invalid format" });
          } else if (message.includes("PASSWORD")) {
            setErrors({ password: "Password does not meet requirements" });
          } else {
            alert(`Sign up failed: ${message}`);
          }
        } else {
          alert("Sign up failed. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const inputClass =
    "w-full px-4 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500";

  const imageContent = (
    <div className="z-10 text-center">
      <h2 className="mb-4 text-4xl font-bold font-heading">
        Capturing Moments, Creating Memories
      </h2>
      <p className="text-lg text-beige-200">
        Join our community to start your next reading adventure.
      </p>
    </div>
  );

  return (
    <AuthLayout imageContent={imageContent}>
      <div className="flex flex-col justify-center h-full max-w-md mx-auto">
        <h1 className="mb-2 text-4xl font-bold font-heading text-beige-900">
          Create an account
        </h1>
        <p className="mb-8 text-beige-600">
          Already have an account?{" "}
          <Link to="/signin" className="font-semibold hover:underline">
            Log in
          </Link>
        </p>

        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-beige-800">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={inputClass}
              required
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-beige-800">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-beige-800">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
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
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>
          <div className="flex items-center mb-6">
          
          </div>
          {errors.agreed && (
            <p className="mb-4 text-sm text-red-500">{errors.agreed}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create account"}
          </button>
        </form>

        <div className="my-6 text-center text-beige-500">Or register with</div>

        <p className="mt-8 text-center text-beige-700">
          Already have an account?{" "}
          <Link to="/signin" className="font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
