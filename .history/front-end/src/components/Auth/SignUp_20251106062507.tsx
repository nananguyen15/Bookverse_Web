import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { GoogleLoginButton } from "../Auth/GoogleLoginButton";
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
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username))
      return "Username can only contain letters and numbers.";
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.some((user) => user.username === username))
      return "Username already exists.";
    return "";
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^0[3-9]\d{8}$/;
    return phoneRegex.test(phone)
      ? ""
      : "Invalid Vietnamese phone number. It must be 10 digits, start with 0, and the second digit must be from 3 to 9.";
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format.";

    // Check if email already exists
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.some((user) => user.email === email)) {
      return "Email already registered.";
    }
    return "";
  };

  const validatePassword = (password: string) => {
    // Sửa lại validation: ít nhất 8 ký tự, có chữ hoa, chữ thường, số, và ký tự đặc biệt
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      return "Password must be at least 8 characters, include uppercase, lowercase, number, and special character (@$!%*?&#).";
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

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    newErrors.username = validateUsername(formData.username);
    newErrors.phone = validatePhone(formData.phone);
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    if (!formData.agreed) newErrors.agreed = "You must agree to the terms.";
    // Remove empty errors
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Proceed with signup
      const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
      const newUser: User = {
        username: formData.username,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: "user",
        verified: false, // Thêm trường verified
      };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      // Store OTP for verification (expire in 5 minutes)
      const otpData = {
        email: formData.email,
        otp: otp,
        expiry: new Date().getTime() + 5 * 60 * 1000, // 5 phút
      };
      localStorage.setItem("pendingOTP", JSON.stringify(otpData));

      console.log(`[MOCK EMAIL] Sending OTP to ${formData.email}: ${otp}`);
      alert(
        `[DEVELOPMENT MODE]\nOTP đã được "gửi" đến email ${formData.email}\n\nMã OTP của bạn là: ${otp}\n\n(Trong production, mã này sẽ được gửi qua email thực)`
      );

      navigate("/verify-email");
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
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
              required
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
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
            <input
              type="checkbox"
              name="agreed"
              id="agreed"
              checked={formData.agreed}
              onChange={handleChange}
              className="w-4 h-4 mr-2 rounded text-beige-700 focus:ring-beige-500"
              required
            />
            <label htmlFor="agreed" className="text-sm text-beige-700">
              I agree to the{" "}
              <Link to="/terms" className="font-semibold hover:underline">
                Terms & Conditions
              </Link>
            </label>
          </div>
          {errors.agreed && (
            <p className="mb-4 text-sm text-red-500">{errors.agreed}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
          >
            Create account
          </button>
        </form>

        <div className="my-6 text-center text-beige-500">Or register with</div>

        <div className="flex gap-4">
          <GoogleLoginButton />
          <button className="flex-1 py-2 font-medium border rounded-lg border-beige-300 text-beige-800 hover:bg-beige-100">
            Facebook
          </button>
        </div>

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
