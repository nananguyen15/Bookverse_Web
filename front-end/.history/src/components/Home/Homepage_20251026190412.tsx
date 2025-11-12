import { Navbar } from "../Navbar/Navbar";
import HeroSlider from "./HeroSlider";
import { heroBookGroups } from "../../data/books";
import { Footer } from "../Footer/Footer";
import { Somebooks } from "./Somebooks";
import { Someseries } from "./SomeSeries";
import { Categories } from "./Categories";

export function Homepage() {
  return (
    <div className="grid">
      <Navbar grid={/>
      <HeroSlider booksData={heroBookGroups} autoIntervalMs={5000} onGetStartedHref="/browse" />
      <Somebooks />
      <Someseries />
      <Categories />
      <Footer />
    </div>
  );
}
