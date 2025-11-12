import { Navbar } from "../Navbar/Navbar";
import HeroSlider from "./HeroSlider";
import { heroBookGroups } from "../../data/books";
import { Footer } from "../Footer/Footer";
import { Somebooks } from "./Somebooks";
import { Someseries } from "./SomeSeries";
import { Categories } from "./Categories";

export function Homepage() {
  return (
    <div className="grid w-full">
      <Navbar />
      <HeroSlider
        booksData={heroBookGroups}
        autoIntervalMs={5000}
        onGetStartedHref="/browse"
      />
      <Somebooks />
      <Someseries />
      <Footer />

    </div>
  );
}
