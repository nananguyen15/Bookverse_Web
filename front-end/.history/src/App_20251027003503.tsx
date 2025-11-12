import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "./components/Home/Homepage";
import { Allbooks } from "./components/Home/pages/Allbooks";
import { Allseries } from "./components/Home/pages/Allseries";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/books" element={<Allbooks />} />
        <Route path="/series" element={<Allseries />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
