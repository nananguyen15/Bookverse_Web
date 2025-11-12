import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";
import { AboutHero } from "./AboutHero";
import { AboutStory } from "./AboutStory";
import { AboutMission } from "./AboutMission";
import { AboutTeam } from "./AboutTeam";

export function AboutUs() {
  return (
    <div>
      <Navbar />
      <main className="bg-beige-50 text-beige-900">
        <AboutHero />
        <AboutStory />
        <AboutMission />
        <AboutTeam />
      </main>
      <Footer className="bg-linear-to-t from-beige-900 via-beige-800 to-beige-500" />
    </div>
  );
}