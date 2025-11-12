import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Homepage } from "./components/Home/Homepage";
import { Allbooks } from "./components/Home/pages/Allbooks";
import { Allseries } from "./components/Home/pages/AllSeries";
import { AboutUs } from "./components/AboutUs/AboutUs";
import { QuestionAndAnswer } from "./components/Q&A/Question&Answer";
import { SignIn } from "./components/Auth/SignIn";
import { SignUp } from "./components/Auth/SignUp";
import { VerifyEmail } from "./components/Auth/VerifyEmail";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (!users.some((u: any) => u.username === "admin")) {
      users.push({ username: "admin", password: "Vuivui123", role: "admin" });
    }
    if (!users.some((u: any) => u.username === "staff")) {
      users.push({ username: "staff", password: "Staff123", role: "staff" });
    }
    localStorage.setItem("users", JSON.stringify(users));
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/allbooks" element={<Allbooks />} />
          <Route path="/allseries" element={<Allseries />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/qa" element={<QuestionAndAnswer />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          {/* Add other routes as needed */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
