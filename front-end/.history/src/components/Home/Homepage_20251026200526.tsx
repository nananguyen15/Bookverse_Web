import { Navbar } from "../Navbar/Navbar";
import HeroSlider from "./HeroSlider";
import { heroBookGroups } from "../../data/books";
import { Footer } from "../Footer/Footer";
import { Somebooks } from "./Somebooks";
import { Someseries } from "./SomeSeries";
import { Categories } from "./Categories";

export function Homepage() {
  console.log("Homepage rendering...");
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Debug section - remove after testing */}
      <div className="p-4 bg-red-100 text-center">
        <p>Homepage is loading... If you see this, React is working!</p>
      </div>
      
      <HeroSlider 
        booksData={heroBookGroups} 
        autoIntervalMs={5000} 
        onGetStartedHref="/browse" 
      />
      <Somebooks />
      <Someseries />
      <Categories />
      <Footer />
    </div>
  );
}
