export const primaryNav = [{ label: "Home", href: "/" }, { label: "About Us", href: "/about-us" }, { label: "Tours", href: "/tours" }, { label: "Hotels", href: "/hotels" }, { label: "Vehicle Rental", href: "/vehicle-rental" }];

export const services = [
  { label: "Travel & Tour Planning", href: "/services/travel-planning", description: "Tailored itineraries and transparent trip planning." },
  { label: "Vehicle Booking Services", href: "/services/vehicle-booking", description: "The right vehicle for every route and group size." },
  { label: "Local Transportation", href: "/services/local-transport", description: "Comfortable city travel and local sightseeing." },
  { label: "Airport Transfers", href: "/services/airport-transfer", description: "Reliable arrival and departure transfers." },
  { label: "Outstation Travel", href: "/services/outstation-travel", description: "Road trips shaped around your timing." },
  { label: "Bus & Tempo Services", href: "/services/bus-tempo", description: "Flexible group travel across India." },
  { label: "Corporate Transportation", href: "/services/corporate-transport", description: "Dependable movement for teams and events." },
  { label: "Event & Group Travel", href: "/services/group-travel", description: "Thoughtful logistics for every shared journey." }
];

export const destinations = [
  { slug: "ladakh", name: "Ladakh", subtitle: "High passes & mountain roads", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1100&q=85" },
  { slug: "pangong-lake", name: "Pangong Lake", subtitle: "High-altitude Himalayan stillness", image: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Pangong_Lake%2C_Ladakh%2C_India_02.jpg" },
  { slug: "pahalgam", name: "Pahalgam", subtitle: "Kashmir's river valleys", image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1100&q=85" },
  { slug: "gulmarg", name: "Gulmarg", subtitle: "Alpine meadows & snow peaks", image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=1100&q=85" }
];

export function getDestinationBySlug(slug: string) { return destinations.find(destination => destination.slug === slug); }

export const showcaseTours = [
  { slug: "leh-ladakh-explorer", destination: "Ladakh, India", name: "Leh Ladakh Explorer", duration: "6D / 5N", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1100&q=85" },
  { slug: "pangong-nubra-trail", destination: "Pangong Lake, Ladakh", name: "Pangong & Nubra Trail", duration: "7D / 6N", image: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Pangong_Lake%2C_Ladakh%2C_India_02.jpg" },
  { slug: "kashmir-valley-escape", destination: "Kashmir, India", name: "Kashmir Valley Escape", duration: "5D / 4N", image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1100&q=85" }
];

export function getTourBySlug(slug: string) { return showcaseTours.find(tour => tour.slug === slug); }

export const categoryLabels = ["Adventure", "Mountains", "Honeymoon", "Family"];
