import { Navbar } from "../Navbar/Navbar";
import { Somebooks } from "./Somebooks";
import { Footer } from "../Footer/Footer";

export function Homepage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {/* Test section with inline styles */}
      <div style={{ padding: "20px", backgroundColor: "#ff0000", color: "#fff" }}>
        <h1 style={{ fontSize: "24px" }}>HOMEPAGE IS LOADING</h1>
      </div>
      
      <Navbar />
      
      <div style={{ padding: "20px", backgroundColor: "#00ff00" }}>
        <p style={{ color: "#000", fontSize: "20px" }}>Green section before Somebooks</p>
      </div>
      
      <Somebooks />
      
      <div style={{ padding: "20px", backgroundColor: "#0000ff" }}>
        <p style={{ color: "#fff", fontSize: "20px" }}>Blue section after Somebooks</p>
      </div>
      
      <Footer />
    </div>
  );
}
