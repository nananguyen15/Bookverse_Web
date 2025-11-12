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
      '--book-gray-dark': 'rgb(84, 51, 16)',
      '--book-cream': 'rgb(248, 244, 225)',
      '--book-tan': 'rgb(175, 143, 111)',
      '--book-brown-md': 'rgb(116, 81, 45)',
    }}>
      <Navbar />
      <main className="bg-beige-50 text-beige-900">
        <AboutHero />
        <AboutStory />
        <AboutMission />
        <AboutTeam />
      </main>
      <Footer />
    </div>
  );
}