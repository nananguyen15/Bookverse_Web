import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "..s";
import { GoogleLoginButton } from "./GoogleLoginButton";
// import { FacebookLoginButton } from "./FacebookLoginButton";

export function SignIn() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-beige-50 text-beige-800">
      <div className="max-w-md p-10 bg-white rounded-lg shadow-xl">
        <svg className="w-24 h-24 mx-auto mb-6 text-beige-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h1 className="mb-4 text-3xl font-bold font-heading">Sign In</h1>
        <p className="mb-8 text-beige-600">
          Sign in to your account to continue.
        </p>
        <div className="my-6 text-center text-beige-500">Or Login With</div>
        
        <div className="flex gap-4">
          <GoogleLoginButton />
          {/* <FacebookLoginButton /> */}
          <button className="flex-1 py-2 font-medium border rounded-lg border-beige-300 text-beige-800 hover:bg-beige-100">Facebook</button>
        </div>

        <p className="mt-8 text-center text-beige-700">
          Don't have an account? <Link to="/signup" className="text-beige-600">Sign up</Link>
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