import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function GoogleLoginButton() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Google login successful:", tokenResponse);

      const token = tokenResponse.access_token;
      login(token, "user");

      // Chuyển hướng về trang chủ sau khi đăng nhập thành công
      navigate("/");
    },
    onError: () => {
      console.error("Google Login Failed");
    },
  });

  return (
    <button
      onClick={() => handleLogin()}
      className="flex-1 py-2 font-medium border rounded-lg border-beige-300 text-beige-800 hover:bg-beige-100"
    >
      Google
    </button>
  );
}
