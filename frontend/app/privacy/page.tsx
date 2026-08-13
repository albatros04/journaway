import { PageHero } from "@/components/page-templates";

export default function PrivacyPage() {
  return <main><PageHero eyebrow="Legal" title="Privacy" copy="How JournAway handles the information you share when planning a journey." /><article className="legal-content container"><nav className="legal-nav" aria-label="Legal pages"><a className="active" href="/privacy">Privacy</a><a href="/terms">Terms of use</a></nav><h2>Your information, handled with care.</h2><p>JournAway uses enquiry and booking information only to respond to travel requests and provide relevant trip support. We do not publish personal contact details.</p><h3>What we collect</h3><p>Details you voluntarily provide through forms, such as name, phone number, email address and trip requirements.</p><h3>How we use it</h3><p>To prepare travel options, answer enquiries and make booking support clearer. For questions about your data, please contact the JournAway team.</p></article></main>;
}
