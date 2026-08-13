import { EnquiryForm } from "@/components/forms";
import { PageHero } from "@/components/page-templates";
import { SupportingCta } from "@/components/supporting-sections";

export default function ContactPage() {
  return <main>
    <PageHero eyebrow="Plan with JournAway" title="Tell us where you want to go." copy="Share a destination, date, route or idea. We’ll help make the next step clearer." image="https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=2200&q=85" />
    <section className="section contact-section"><div className="container contact-layout"><aside className="contact-intro"><p className="eyebrow">Trip planning & enquiries</p><h2>Travel starts with a good conversation.</h2><p>Use the form for tours, road travel, hotel support or a custom journey idea. Your route can begin with as much—or as little—detail as you have.</p><address className="contact-methods"><div className="contact-note"><span>Location</span><strong>Ambala, Haryana, India</strong></div><div className="contact-note"><span>Website</span><a href="https://journaway.in">journaway.in</a></div></address></aside><div className="form-panel glass-panel"><p className="eyebrow">Send an enquiry</p><h2>Tell us about the journey.</h2><EnquiryForm /></div></div></section>
    <SupportingCta eyebrow="Travel ideas welcome" title="A tour, a stay or a road journey—start here." copy="Explore the travel services available through JournAway, then send the details that matter to you." />
  </main>;
}
