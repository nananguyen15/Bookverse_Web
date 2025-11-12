import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Homepage } from "./components/Home/Homepage";
import { Allbooks } from "./components/Home/pages/Allbooks";
import { Allseries } from "./components/Home/pages/Allseries";
import { AboutUs } from "./components/AboutUs/AboutUs";
import { QuestionAndAnswer } from "./components/Q&A/Question&Answer";
import { SignIn } from "./components/Auth/SignIn";
import { SignUp } from "./components/Auth/SignUp";
import { VerifyEmail } from "./components/Auth/VerifyEmail";

// Khởi tạo users một lần khi app load
const initializeDefaultUsers = () => {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  if (!users.some((u: any) => u.username === "admin")) {
    users.push({
      username: "admin",
      email: "admin@bookverse.com",
      password: "Vuivui123@",
      role: "admin",
    });
  }
  if (!users.some((u: any) => u.username === "staff")) {
    users.push({
      username: "staff",
      email: "staff@bookverse.com",
      password: "Staff123@",
      role: "staff",
    });
  }
  localStorage.setItem("users", JSON.stringify(users));
};

initializeDefaultUsers();

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/allbooks" element={<Allbooks />} />
          <Route path="/books" element={<Allbooks />} />
          <Route path="/allseries" element={<Allseries />} />
          <Route path="/series" element={<Allseries />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/qa" element={<QuestionAndAnswer />} />
          <Route path="/faq" element={<QuestionAndAnswer />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
