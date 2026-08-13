import { HotelRequestForm } from "@/components/forms";
import { PageHero } from "@/components/page-templates";

export default function HotelsPage() {
  return <main><PageHero eyebrow="Hotel booking" title="A stay that fits the journey." copy="Tell us where and when you want to stay. JournAway will help you explore suitable hotel options for your trip." image="https://upload.wikimedia.org/wikipedia/commons/f/fd/Pangong_Lake%2C_Ladakh%2C_India_02.jpg" /><section className="section container hotel-layout"><div><p className="eyebrow">Plan your stay</p><h2>Choose the destination. We’ll help with the rest.</h2><p>Share your travel dates and preferences to request hotel options for your journey. Availability and final booking details are confirmed directly with the JournAway team.</p></div><div className="form-panel glass-panel"><HotelRequestForm /></div></section></main>;
}
