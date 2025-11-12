import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export function VerifyEmail() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const otpData = JSON.parse(localStorage.getItem("pendingOTP") || "null");
    if (!otpData) {
      navigate("/signup");
      return;
    }

    setEmail(otpData.email);

    // Calculate time left
    const remaining = Math.max(
      0,
      Math.floor((otpData.expiry - new Date().getTime()) / 1000)
    );
    setTimeLeft(remaining);

    // Countdown timer
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          localStorage.removeItem("pendingOTP");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpData = JSON.parse(localStorage.getItem("pendingOTP") || "null");

    if (!otpData) {
      setError("OTP expired. Please sign up again.");
      return;
    }

    if (new Date().getTime() > otpData.expiry) {
      setError("OTP expired. Please sign up again.");
      localStorage.removeItem("pendingOTP");
      return;
    }

    if (otp !== otpData.otp) {
      setError("Invalid OTP. Please try again.");
      return;
    }

    // Verify successful - update user status
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: any) => u.email === otpData.email);
    if (userIndex !== -1) {
      users[userIndex].verified = true;
      localStorage.setItem("users", JSON.stringify(users));
    }

    localStorage.removeItem("pendingOTP");
    alert("Email verified successfully! You can now sign in.");
    navigate("/signin");
  };

  const handleResendOTP = () => {
    const otpData = JSON.parse(localStorage.getItem("pendingOTP") || "null");
    if (!otpData) return;

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpData = {
      email: otpData.email,
      otp: newOtp,
      expiry: new Date().getTime() + 5 * 60 * 1000,
    };
    localStorage.setItem("pendingOTP", JSON.stringify(newOtpData));
    setTimeLeft(300);

    console.log(`[MOCK EMAIL] Resending OTP to ${otpData.email}: ${newOtp}`);
    alert(
      `[DEVELOPMENT MODE]\nOTP mới đã được "gửi" đến email ${otpData.email}\n\nMã OTP mới của bạn là: ${newOtp}`
    );
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
              />
              <p className="mb-4 text-sm text-beige-600">
                Time remaining:{" "}
                <span className="font-semibold">{formatTime(timeLeft)}</span>
              </p>
              <button
                type="submit"
                className="w-full px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
              >
                Verify Email
              </button>
            </form>

            <button
              onClick={handleResendOTP}
              className="text-sm font-medium text-beige-700 hover:underline"
            >
              Didn't receive the code? Resend OTP
            </button>
          </>
        ) : (
          <div className="mb-6">
            <p className="mb-4 text-red-500">OTP expired!</p>
            <button
              onClick={handleResendOTP}
              className="w-full px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
            >
              Resend OTP
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
