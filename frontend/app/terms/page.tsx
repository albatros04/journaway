import { PageHero } from "@/components/page-templates";

export default function TermsPage() {
  return <main><PageHero eyebrow="Legal" title="Terms of use" copy="A simple guide to using JournAway’s travel-planning services." /><article className="legal-content container"><nav className="legal-nav" aria-label="Legal pages"><a href="/privacy">Privacy</a><a className="active" href="/terms">Terms of use</a></nav><h2>Clear travel planning.</h2><p>Tour, vehicle and package availability may change. A booking is confirmed only after the JournAway team has provided final details and confirmation.</p><h3>Travel information</h3><p>Travellers are responsible for reviewing trip details, required documents and applicable conditions before confirmation.</p><h3>Enquiries</h3><p>Sending an enquiry does not create a booking or payment obligation. It helps our team understand the journey you would like to plan.</p></article></main>;
}
