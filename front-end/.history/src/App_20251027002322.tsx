import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "./components/Home/Homepage";
import { Allbooks } from "./components/Home/pages/Allbooks";
import { AllSeries } from "./components/Home/pages/AllSeries";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/allbooks" element={<Allbooks />} />
        {/* <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/series/:id" element={<SeriesDetail />} /> */}
        <Route path="/series" element={<AllSeries />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
