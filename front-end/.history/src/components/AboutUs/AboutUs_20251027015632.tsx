import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";
import { AboutHero } from "./AboutHero";
import { AboutStory } from "./AboutStory";
import { AboutMission } from "./AboutMission";
import { AboutTeam } from "./AboutTeam";

export function AboutUs() {
  return (
    <div style={{
      '--color-lightest': 'rgb(248, 244, 225)',
      '--color-light-mid': 'rgb(175, 143, 111)',
      '--color-mid-dark': 'rgb(116, 81, 45)',
      '--color-darkest': 'rgb(84, 51, 16)',
    }}>
      <Navbar />
      <main className="bg-[var(--color-lightest)] text-[var(--color-darkest)]">
        <AboutHero />
        <AboutStory />
        <AboutMission />
        <AboutTeam />
      </main>
      <Footer />
    </div>
  );
}