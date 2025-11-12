import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { authApi } from "../../api/endpoints/auth.api";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // Backend validates: ^[a-zA-Z0-9_]+$ with length 8-16
    const passwordRegex = /^[a-zA-Z0-9_]{8,16}$/;
    return passwordRegex.test(password);
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email });
      alert(`OTP has been sent to ${email}. Please check your email.`);
      setStep("otp");
    } catch (error: any) {
      console.error("❌ Request OTP failed:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await authApi.verifyOTP({ email, otp });
      if (isValid) {
        setStep("password");
      } else {
        setError("Invalid or expired OTP. Please try again.");
      }
    } catch (error: any) {
      console.error("❌ Verify OTP failed:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be 8-16 characters, containing only letters, numbers, and underscores."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email,
        otp,
        newPassword,
      });
      alert("Password reset successfully! Please log in with your new password.");
      navigate("/signin");
    } catch (error: any) {
      console.error("❌ Reset password failed:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500";

  const imageContent = (
    <div className="z-10 text-center">
      <h2 className="mb-4 text-4xl font-bold font-heading">
        Forgot Your Password?
      </h2>
      <p className="text-lg text-beige-200">
        Don't worry! We'll help you reset it in just a few steps.
      </p>
    </div>
  );

  return (
    <AuthLayout imageContent={imageContent}>
      <div className="flex flex-col justify-center h-full max-w-md mx-auto">
        <h1 className="mb-2 text-4xl font-bold font-heading text-beige-900">
          Reset Password
        </h1>
        <p className="mb-8 text-beige-600">
          {step === "email" && "Enter your email to receive a verification code."}
          {step === "otp" && "Enter the 6-digit code sent to your email."}
          {step === "password" && "Create a new password for your account."}
        </p>

        {error && (
          <p className="mb-4 text-sm text-center text-red-500">{error}</p>
        )}

        {step === "email" && (
          <form onSubmit={handleRequestOTP}>
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium text-beige-800">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium text-beige-800">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className={inputClass}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
              <p className="mt-2 text-sm text-beige-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  className="font-semibold text-beige-700 hover:underline"
                >
                  Resend
                </button>
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-beige-800">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium text-beige-800">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="Confirm new password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-beige-700">
          Remember your password?{" "}
          <Link to="/signin" className="font-semibold hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
