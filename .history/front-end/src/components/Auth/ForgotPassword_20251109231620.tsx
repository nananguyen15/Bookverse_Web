import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { authApi } from "../../api/endpoints/auth.api";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiryTime, setOtpExpiryTime] = useState(0); // 5 minutes countdown in seconds

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const cooldownInterval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(cooldownInterval);
    }
  }, [resendCooldown]);

  // 5-minute countdown timer for OTP expiry
  useEffect(() => {
    if (otpExpiryTime > 0) {
      const expiryInterval = setInterval(() => {
        setOtpExpiryTime((prev) => {
          if (prev <= 1) {
            clearInterval(expiryInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(expiryInterval);
    }
  }, [otpExpiryTime]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // Backend validates: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9_]+ with length 8-16
    // Must have at least: 1 lowercase, 1 uppercase, 1 digit
    // Only allows: letters, numbers, and underscores
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9_]{8,16}$/;
    return passwordRegex.test(password);
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtp("");
    setError("");
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
      // Step 1: Check if email exists and get userId
      console.log("🔍 Step 1: Checking email exists...", email);
      const fetchedUserId = await authApi.getUserIdByEmail(email);
      console.log("✓ Step 1: Got userId:", fetchedUserId);
      setUserId(fetchedUserId);

      // Step 2: Send OTP for reset password
      console.log("📧 Step 2: Sending OTP with data:", {
        email,
        tokenType: "RESET_PASSWORD",
        userId: fetchedUserId,
      });
      await authApi.sendOTPResetPassword({
        email,
        tokenType: "RESET_PASSWORD",
        userId: fetchedUserId,
      });

      console.log("✓ OTP sent successfully to email:", email);
      alert(
        `OTP has been sent to ${email}. Please check your email. The code will expire in 5 minutes.`
      );

      // Start countdown timers
      setResendCooldown(45); // 45 seconds cooldown for resend
      setOtpExpiryTime(300); // 5 minutes = 300 seconds for OTP expiry

      setStep("otp");
    } catch (error: unknown) {
      console.error("❌ Request OTP failed:", error);
      const err = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      if (err.response?.data?.message) {
        const message = err.response.data.message;
        if (message.includes("wait")) {
          setError("Please wait before requesting another code.");
        } else if (
          message.includes("not found") ||
          err.response?.status === 404
        ) {
          setError("Email address not found. Please check and try again.");
        } else {
          setError(message);
        }
      } else {
        setError("Failed to send OTP. Please check your email and try again.");
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

    if (otpExpiryTime <= 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      // Move to password step - actual verification happens when user submits new password
      console.log("✓ OTP entered, proceeding to password reset");
      setStep("password");
    } catch (error: unknown) {
      console.error("❌ Verify OTP failed:", error);
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message) {
        const message = err.response.data.message;
        if (message.includes("expired")) {
          setError("OTP has expired. Please request a new one.");
        } else if (
          message.includes("Invalid OTP") ||
          message.includes("code")
        ) {
          setError("Invalid OTP code. Please try again.");
        } else {
          setError(message);
        }
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
        "Password must be 8-16 characters with at least 1 uppercase letter, 1 lowercase letter, and 1 digit. Only letters, numbers, and underscores allowed."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (otpExpiryTime <= 0) {
      setError("OTP has expired. Please start over and request a new code.");
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP and reset password in one API call
      await authApi.verifyAndResetPassword({
        userId,
        email,
        code: otp,
        tokenType: "RESET_PASSWORD",
        newPassword,
      });

      alert(
        "Password reset successfully! Please log in with your new password."
      );
      navigate("/signin");
    } catch (error: unknown) {
      console.error("❌ Reset password failed:", error);
      const err = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      if (err.response?.data?.message) {
        const message = err.response.data.message;
        if (message.includes("expired")) {
          setError(
            "OTP has expired. Please start over and request a new code."
          );
        } else if (
          message.includes("Invalid OTP") ||
          message.includes("code")
        ) {
          setError("Invalid OTP code. Please check and try again.");
        } else if (message.includes("password")) {
          setError(message);
        } else {
          setError(message);
        }
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      setError(
        `Please wait ${resendCooldown} seconds before requesting another code.`
      );
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Resend OTP using the stored userId
      await authApi.sendOTPResetPassword({
        email,
        tokenType: "RESET_PASSWORD",
        userId,
      });

      console.log("✓ OTP resent to email:", email);
      alert(
        `A new OTP has been sent to ${email}. The code will expire in 5 minutes.`
      );

      // Reset timers
      setResendCooldown(45);
      setOtpExpiryTime(300); // Reset to 5 minutes
      setOtp("");
    } catch (error: unknown) {
      console.error("❌ Resend OTP failed:", error);
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message) {
        const message = err.response.data.message;
        if (message.includes("wait")) {
          setError("Please wait before requesting another code.");
        } else {
          setError(message);
        }
      } else {
        setError("Failed to resend OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500";

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
          {step === "email" &&
            "Enter your email to receive a verification code."}
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
            {/* Display email with edit option */}
            <div className="mb-4 p-3 bg-beige-50 rounded-lg border border-beige-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-beige-600 mb-1">Verification code sent to:</p>
                  <p className="text-sm font-medium text-beige-900">{email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="ml-3 text-sm font-semibold text-beige-700 hover:text-beige-900 hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

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
                disabled={isLoading}
              />
              {otpExpiryTime > 0 ? (
                <p className="mt-2 text-sm text-beige-600">
                  Code expires in:{" "}
                  <span className="font-semibold text-orange-600">
                    {formatTime(otpExpiryTime)}
                  </span>
                </p>
              ) : (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  Code has expired. Please request a new one.
                </p>
              )}
              <p className="mt-2 text-sm text-beige-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={
                    isLoading || resendCooldown > 0 || otpExpiryTime <= 0
                  }
                  className="font-semibold text-beige-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Resend (wait ${resendCooldown}s)`
                    : otpExpiryTime <= 0
                    ? "Resend"
                    : "Resend"}
                </button>
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading || otpExpiryTime <= 0}
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
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-beige-600 hover:text-beige-800"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-beige-600">
                8-16 characters with at least 1 uppercase, 1 lowercase, 1 digit, and underscore only
              </p>
            </div>
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium text-beige-800">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-beige-600 hover:text-beige-800"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
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
