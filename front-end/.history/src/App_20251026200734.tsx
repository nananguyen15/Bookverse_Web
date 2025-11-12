import { Homepage } from "./components/Home/Homepage";

function App() {
  return (
    <div style={{ margin: 0, padding: 0 }}>
      <div style={{ backgroundColor: "yellow", padding: "10px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
          APP.TSX IS RENDERING - If you see this, React is working!
        </p>
      </div>
      <Homepage />
    </div>
  );
}

export default App;
