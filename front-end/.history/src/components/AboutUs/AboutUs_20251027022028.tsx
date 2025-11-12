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
      <main className="bg- text-[var(--color-darkest)]">
        <AboutHero />
        <AboutStory />
        <AboutMission />
        <AboutTeam />
      </main>
      <Footer />
    </div>
  );
}