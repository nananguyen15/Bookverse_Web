import { Navbar } from "../Navbar/Navbar";
import HeroSlider from "./HeroSlider";
import { heroBookGroups } from "../../data/books";
import { Footer } from "../Footer/Footer";

export function Homepage() {
  return (
    <div className="flex">
      <Navbar />
      <HeroSlider booksData={heroBookGroups} autoIntervalMs={5000} onGetStartedHref="/browse" />
      <Footer className="justify-center" />
    </div>
  );
}
