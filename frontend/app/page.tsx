import { CinematicHero } from "@/components/cinematic-hero";
import { JourneySearch } from "@/components/forms";
import { CabServiceSection, DestinationShowcase, FeaturedJourney, FinalCta, PopularTours, TravelExperiences, WhyJournAway } from "@/components/homepage-sections";

export default function Home() {
  return <main className="homepage"><CinematicHero /><section className="discovery-wrap"><div className="container"><JourneySearch /></div></section><section className="home-intro"><div className="container"><p className="eyebrow">Your travel partner</p><h2>Scenery first. The rest, made <em>easy.</em></h2><p>Explore immersive tours and plan reliable road travel through JournAway, all from one thoughtful starting point.</p></div></section><PopularTours /><DestinationShowcase /><TravelExperiences /><CabServiceSection /><FeaturedJourney /><WhyJournAway /><FinalCta /></main>;
}
