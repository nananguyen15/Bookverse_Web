import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "./components/Home/Homepage";
import { Allbooks } from "./components/Home/pages/Allbooks";
import { Allseries } from "./components/Home/pages/AllSeries";
import { AboutUs } from "./components/AboutUs/AboutUs";
import { QuestionAndAnswer } from "./components/Q&A/Question&Answer";
import { SignIn } from "./components/Auth/SignIn";
import { SignUp } from "./components/Auth/SignUp";
import { VerifyEmail } from "./components/Auth/VerifyEmail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/books" element={<Allbooks />} />
        <Route path="/series" element={<Allseries />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/faq" element={<QuestionAndAnswer />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
