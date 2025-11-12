import { useAuth } from '../../contexts/AuthContext';
// ... các import khác

export function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  // ...

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // ... logic xác thực
    // Giả sử thành công, bạn có một token và role
    const mockToken = "your_jwt_token_here";
    const userRole = "user"; // hoặc "admin", "staff"
    login(mockToken, userRole);
    navigate("/"); // Chuyển về trang chủ
  };

  // ...
}
