const stories = [
  {
    place: "Cinque Terre",
    country: "Italy",
    date: "12—17 May, 2026",
    image:
      "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1000&q=85",
    tone: "gold",
  },
  {
    place: "The High Atlas",
    country: "Morocco",
    date: "28 Mar—02 Apr, 2026",
    image:
      "https://images.unsplash.com/photo-1489493887464-892be6d1daae?auto=format&fit=crop&w=1000&q=85",
    tone: "rust",
  },
  {
    place: "Koya-san",
    country: "Japan",
    date: "03—07 Feb, 2026",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=85",
    tone: "forest",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="home">
        <nav className="nav shell" aria-label="Primary navigation">
          <a className="wordmark" href="#home" aria-label="Journaway home">
            journaway<span>°</span>
          </a>
          <div className="nav-links">
            <a href="#stories">Stories</a>
            <a href="#how-it-works">How it works</a>
          </div>
          <a className="nav-cta" href="#begin">Start a journal <span>↗</span></a>
        </nav>

        <div className="hero-copy shell">
          <p className="eyebrow light">For those who notice</p>
          <h1>Keep the places<br />that change you.</h1>
          <p className="hero-intro">A quieter way to collect the landscapes, meals, wrong turns, and small moments that make a journey yours.</p>
          <a className="button button-light" href="#begin">Begin a new story <span>→</span></a>
        </div>

        <div className="hero-bottom shell">
          <p>Scroll to wander</p>
          <span className="scroll-line" aria-hidden="true" />
          <p>01 <span>/</span> 04</p>
        </div>
      </section>

      <section className="intro shell" id="how-it-works">
        <div className="intro-kicker">
          <span className="sun" aria-hidden="true">✦</span>
          <p>Memories deserve<br />more than a camera roll.</p>
        </div>
        <div className="intro-copy">
          <h2>A home for the feeling<br />of being away.</h2>
          <p>Journaway helps you make sense of the places you’ve been—one photo, one thought, one beautifully imperfect story at a time.</p>
          <a className="text-link" href="#begin">Discover the ritual <span>→</span></a>
        </div>
      </section>

      <section className="featured shell" id="stories">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Latest entries</p>
            <h2>Postcards from<br />somewhere else.</h2>
          </div>
          <a className="text-link desktop-link" href="#all-stories">View all stories <span>→</span></a>
        </div>
        <div className="story-grid">
          {stories.map((story, index) => (
            <article className={`story story-${index + 1}`} key={story.place}>
              <a href="#begin" className="story-image" aria-label={`Read ${story.place} journal`}>
                <img src={story.image} alt="" />
                <span className={`story-mark ${story.tone}`}>{index === 0 ? "12" : index === 1 ? "05" : "03"}</span>
                <span className="read-story">Read story <b>↗</b></span>
              </a>
              <div className="story-meta"><span>{story.date}</span><span>{story.country}</span></div>
              <h3>{story.place}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="ritual">
        <div className="ritual-image" role="img" aria-label="A traveler looking over a mountain range" />
        <div className="ritual-copy shell">
          <p className="eyebrow light">A practice, not a feed</p>
          <h2>Go slower.<br /><em>Remember</em> deeper.</h2>
          <p>Build a private record of your life in motion. There are no trends to chase—only a place to return to.</p>
          <a className="button button-light" href="#begin">Make it yours <span>→</span></a>
        </div>
        <p className="ritual-caption">Photo notes, maps, and the moments between.</p>
      </section>

      <section className="begin shell" id="begin">
        <p className="eyebrow">Your next chapter</p>
        <h2>Where will you<br /><em>remember</em> next?</h2>
        <a className="button button-dark" href="mailto:hello@journaway.example">Start your journal <span>→</span></a>
      </section>

      <footer className="footer shell">
        <a className="wordmark" href="#home">journaway<span>°</span></a>
        <p>© 2026 Journaway. Made for the in-between.</p>
        <div><a href="#privacy">Privacy</a><a href="#instagram">Instagram</a></div>
      </footer>
    </main>
  );
}
