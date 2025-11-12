import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";

export function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreed: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic đăng ký: lưu thông tin user
    // Giả sử dùng localStorage để mô phỏng database
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    users.push({ email: formData.email, password: formData.password });
    localStorage.setItem("users", JSON.stringify(users));
    
    console.log("Signing up with", formData);
    navigate("/verify-email"); // Chuyển đến trang xác thực
  };

  const imageContent = (
    <div className="z-10 text-center">
      <h2 className="mb-4 text-4xl font-bold font-heading">Capturing Moments, Creating Memories</h2>
      <p className="text-lg text-beige-200">Join our community to start your next reading adventure.</p>
    </div>
  );

  return (
    <AuthLayout imageContent={imageContent}>
      <div className="flex flex-col justify-center h-full max-w-md mx-auto">
        <h1 className="mb-2 text-4xl font-bold font-heading text-beige-900">Create an account</h1>
        <p className="mb-8 text-beige-600">
          Already have an account? <Link to="/signin" className="font-semibold hover:underline">Log in</Link>
        </p>
        
        <form onSubmit={handleSignUp}>
          <div className="flex gap-4 mb-4">
            <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500" required />
            <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500" required />
          </div>
          <div className="mb-4">
            <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500" required />
          </div>
          <div className="mb-4">
            <input type="password" name="password" placeholder="Enter your password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500" required />
          </div>
          <div className="flex items-center mb-6">
            <input type="checkbox" name="agreed" id="agreed" onChange={handleChange} className="w-4 h-4 mr-2 rounded text-beige-700 focus:ring-beige-500" required />
            <label htmlFor="agreed" className="text-sm text-beige-700">
              I agree to the <Link to="/terms" className="font-semibold hover:underline">Terms & Conditions</Link>
            </label>
          </div>
          <button type="submit" className="w-full py-3 font-semibold text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800">Create account</button>
        </form>

        <div className="my-6 text-center text-beige-500">Or register with</div>
        
        <div className="flex gap-4">
          <button className="flex-1 py-2 font-medium border rounded-lg border-beige-300 text-beige-800 hover:bg-beige-100">Google</button>
          <button className="flex-1 py-2 font-medium border rounded-lg border-beige-300 text-beige-800 hover:bg-beige-100">Facebook</button>
        </div>
      </div>
    </AuthLayout>
  );
}
