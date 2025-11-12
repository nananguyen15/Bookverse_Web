import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "./components/Home/Homepage";
import { Allbooks } from "./components/Home/pages/Allbooks";
import { Allseries } from "./components/Home/pages/AllSeries";
import { AboutUs } from "./components/AboutUs/AboutUs";
import { QuestionAndAnswer } from "./components/Q&A/Question&Answer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/books" element={<Allbooks />} />
        <Route path="/series" element={<Allseries />} />
        {/* Add other routes as needed */}
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/faq" element={<QuestionAndAnswer />} />
        
      </Routes>
    </Router>
  );
}

export default App;
