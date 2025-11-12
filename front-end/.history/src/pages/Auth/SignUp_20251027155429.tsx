import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "/>Auth/AuthLayout";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function SignUp() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-beige-50 text-beige-800">
        <div className="max-w-md p-10 bg-white rounded-lg shadow-xl">
          <svg className="w-24 h-24 mx-auto mb-6 text-beige-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h1 className="mb-4 text-3xl font-bold font-heading">Sign Up</h1>
          <p className="mb-8 text-beige-600">
            Create an account to get started.
          </p>
          <Link
            to="/"
            className="px-6 py-2 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800"
          >
            Back to Home
          </Link>
          <div className="my-6 text-center text-beige-500">Or register with</div>
          <div className="flex gap-4">
            <GoogleLoginButton />
            <button className="flex-1 py-2 font-medium border rounded-lg border-beige-300 text-beige-800 hover:bg-beige-100">Facebook</button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}