import { AboutHero } from "./AboutHero";
import { AboutStory } from "./AboutStory";
import { AboutMission } from "./AboutMission";
import { AboutTeam } from "./AboutTeam";

export function AboutUs() {
  return (
    <div className="bg-beige-50 text-beige-900">
      <AboutHero />
      <AboutStory />
      <AboutMission />
      <AboutTeam />
    </div>
  );
}
