import { Button } from "@/components/ui";

export default function NotFound() {
  return <main className="not-found-page"><section className="container"><p className="eyebrow">A small detour</p><h1>Looks like this journey took a wrong turn.</h1><p>The page you’re looking for is not part of the published JournAway route map.</p><div className="button-row"><Button href="/">Back home</Button><Button href="/tours" variant="secondary">Explore tours</Button></div></section></main>;
}
