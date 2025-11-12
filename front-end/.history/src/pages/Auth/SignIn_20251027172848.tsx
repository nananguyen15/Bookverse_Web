import { useAuth } from '../../contexts/AuthContext';
// ... các import khác

export function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  // ...

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // ... logic xác thực
    // Giả sử thành công, bạn có một token
    const mockToken = "your_jwt_token_here";
    login(mockToken);
    navigate("/"); // Chuyển về trang chủ
  };

  // ...
}
