import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";
import HeroSlider from "./HeroSlider";
import { heroBookGroups } from "../../data/books";

export function Homepage() {
  return (
    <div>
      <Navbar />
      <HeroSlider booksData={heroBookGroups} autoIntervalMs={5000} onGetStartedHref="/browse" />
      <Footer />
    </div>
  );
}
