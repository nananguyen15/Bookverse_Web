import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../api/endpoints/auth.api";

export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // 45 seconds cooldown

  useEffect(() => {
    // Get user data from navigation state
    const state = location.state as {
      userId?: string;
      email?: string;
      username?: string;
    };

    if (!state || !state.userId || !state.email) {
      navigate("/signup");
      return;
    }

    setUserId(state.userId);
    setEmail(state.email);
    setUsername(state.username || "");

    // Start countdown timer for OTP expiry (5 minutes)
    const expiryInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(expiryInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(expiryInterval);
  }, [navigate, location]);

  useEffect(() => {
    // Cooldown timer for resend button
    if (resendCooldown > 0) {
      const cooldownInterval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownInterval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(cooldownInterval);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP code.");
      return;
    }

    if (timeLeft <= 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.verifyOTP({
        userId: userId,
        email: email,
        code: otp,
        tokenType: "LOGIN",
      });

      console.log("✓ Email verified successfully");
      alert(
        `Email verified successfully! Welcome ${username}! You can now sign in.`
      );
      navigate("/signin");
    } catch (error: any) {
      console.error("❌ Verify OTP failed:", error);

      if (error.response?.data?.message) {
        const message = error.response.data.message;
        if (message.includes("expired")) {
          setError("OTP has expired. Please request a new one.");
        } else if (message.includes("Invalid OTP") || message.includes("code")) {
          setError("Invalid OTP code. Please try again.");
        } else {
          setError(message);
        }
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setIsLoading(true);

    try {
      await authApi.sendOTP({
        email: email,
        userId: userId,
        tokenType: "LOGIN",
      });

      console.log("✓ OTP resent to email:", email);
      alert(`A new OTP has been sent to ${email}`);

      // Reset timers
      setTimeLeft(300); // Reset to 5 minutes
      setResendCooldown(45); // 45 seconds cooldown before next resend
      setCanResend(false);
      setOtp(""); // Clear current OTP input
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-beige-50 text-beige-800">
      <div className="max-w-md p-10 bg-white rounded-lg shadow-xl">
        <svg
          className="w-24 h-24 mx-auto mb-6 text-beige-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <h1 className="mb-4 text-3xl font-bold font-heading">
          Verify Your Email
        </h1>
        <p className="mb-2 text-beige-600">We've sent a 6-digit OTP code to</p>
        <p className="mb-6 font-semibold text-beige-800">{email}</p>

        {timeLeft > 0 ? (
          <>
            <form onSubmit={handleVerify} className="mb-6">
              {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 mb-4 text-2xl tracking-widest text-center border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                maxLength={6}
                required
                disabled={isLoading}
              />
              <p className="mb-4 text-sm text-beige-600">
                Time remaining:{" "}
                <span className="font-semibold">{formatTime(timeLeft)}</span>
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </button>
            </form>

            <button
              onClick={handleResendOTP}
              disabled={isLoading || resendCooldown > 0}
              className="text-sm font-medium text-beige-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0
                ? `Resend OTP (wait ${resendCooldown}s)`
                : "Didn't receive the code? Resend OTP"}
            </button>
          </>
        ) : (
          <div className="mb-6">
            <p className="mb-4 text-red-500">OTP expired!</p>
            <button
              onClick={handleResendOTP}
              disabled={isLoading || resendCooldown > 0}
              className="w-full px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Sending..."
                : resendCooldown > 0
                  ? `Wait ${resendCooldown}s`
                  : "Resend OTP"}
            </button>
          </div>
        )}

        <Link
          to="/signup"
          className="block mt-6 text-sm text-beige-600 hover:underline"
        >
          Back to Sign Up
        </Link>
      </div>
    </div>
  );
}
