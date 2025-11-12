import { Link } from "react-router-dom";

export function VerifyEmail() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-beige-50 text-beige-800">
      <div className="p-10 bg-white rounded-lg shadow-xl max-w-md">
        <svg className="w-24 h-24 mx-auto mb-6 text-beige-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h1 className="mb-4 text-3xl font-bold font-heading">Verify Your Email</h1>
        <p className="mb-8 text-beige-600">
          We've sent a verification link to your email address. Please check your inbox and click the link to complete your registration.
        </p>
        <Link
          to="/"
          className="px-6 py-2 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
