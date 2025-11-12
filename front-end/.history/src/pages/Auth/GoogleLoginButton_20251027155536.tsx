import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

export function GoogleLoginButton() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Google login successful:", tokenResponse);

      // Trong thực tế, bạn sẽ gửi access_token này đến backend để xác thực
      // và nhận lại một JWT token của riêng ứng dụng bạn.
      // Ở đây, chúng ta mô phỏng việc lưu token.
      const expiration = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 giờ
      const token = tokenResponse.access_token;
      localStorage.setItem(
        "authToken",
        JSON.stringify({ value: token, expiration, type: "google" })
      );

      // Chuyển hướng về trang chủ sau khi đăng nhập thành công
      navigate("/");
    },
    onError: () => {
      console.error("Google Login Failed");
    },
  });

  return (
    <button
      onClick={() => login()}
      className="flex-1 py-2 font-medium border rounded-lg border-beige-300 text-beige-800 hover:bg-beige-100"
    >
      Google
    </button>
  );
}
