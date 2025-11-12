import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "./components/Home/Homepage";
import { Allbooks } from "./components/Home/pages/Allbooks";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/allbooks" element={<Allbooks />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
