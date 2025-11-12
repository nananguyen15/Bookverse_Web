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
      // Step 1: Check if email exists and get userId
      const fetchedUserId = await authApi.getUserIdByEmail(email);
      setUserId(fetchedUserId);

      // Step 2: Send OTP for reset password
      await authApi.sendOTPResetPassword({
        email,
        tokenType: "RESET_PASSWORD",
        userId: fetchedUserId,
      });

      console.log("✓ OTP sent to email:", email);
      alert(`OTP has been sent to ${email}. Please check your email. The code will expire in 5 minutes.`);

      // Start countdown timers
      setResendCooldown(45); // 45 seconds cooldown for resend
      setOtpExpiryTime(300); // 5 minutes = 300 seconds for OTP expiry

      setStep("otp");
    } catch (error: unknown) {
      console.error("❌ Request OTP failed:", error);
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message) {
        const message = err.response.data.message;
        if (message.includes("wait")) {
          setError("Please wait before requesting another code.");
        } else if (message.includes("not found") || err.response?.status === 404) {
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

      alert(
        "Password reset successfully! Please log in with your new password."
      );
      navigate("/signin");
    } catch (error: any) {
      console.error("❌ Reset password failed:", error);
      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (message.includes("not found") || message.includes("404")) {
          setError(
            "Reset password endpoint not implemented yet. Please contact support."
          );
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
      await authApi.forgotPassword({ email });

      console.log("✓ OTP resent to email:", email);
      alert(`A new OTP has been sent to ${email}`);

      // Reset cooldown
      setResendCooldown(45);
      setOtp("");
    } catch (error: any) {
      console.error("❌ Resend OTP failed:", error);
      if (error.response?.data?.message) {
        const message = error.response.data.message;
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
              <p className="mt-2 text-sm text-beige-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading || resendCooldown > 0}
                  className="font-semibold text-beige-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Resend (wait ${resendCooldown}s)`
                    : "Resend"}
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
