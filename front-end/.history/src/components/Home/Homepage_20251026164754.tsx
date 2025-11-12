import { Navbar } from "../Navbar/Navbar";

export function Homepage() {
  return (
    <div>
      <Navbar />
      
      <div>
        <h1>Find your next book</h1>
        <p>Our most popular and trending books are just a click away.</p>
        <button>Explore Now</button>
      </div>
      {/* Right section */}
      <div>
        <div>
          <img src="/img/0be18eee57c4e60176ed68afbaf6b257.jpg" alt="Popular Books" />
        </div>
      </div>
    </div>
  );
}
