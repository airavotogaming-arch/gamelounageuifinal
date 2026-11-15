import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import './_group.css';

const slides = [
  {
    id: 'welcome',
    label: 'Welcome to your lounge',
    title: <>WELCOME<br />BACK, PLAYER_007</>,
    line: 'Your games and next session are ready.',
    action: 'Explore Games',
  },
  {
    id: 'valorant',
    label: 'From your library',
    title: 'VALORANT',
    line: 'A favorite is ready when you are.',
    game: '/__mockup/images/airavoto-valorant.png',
  },
  {
    id: 'gta-v',
    label: 'Ready to play',
    title: 'GRAND THEFT AUTO V',
    line: 'Your next session starts here.',
    game: '/__mockup/images/airavoto-gta.png',
    action: 'Play Now',
  },
];

export function WelcomeGames() {
  const [active, setActive] = useState(0);
  const slide = slides[active];
  const step = (direction: number) => setActive((index) => (index + direction + slides.length) % slides.length);

  return (
    <div className="af-extract">
      <section className="af-feature" aria-label="Welcome and featured games">
        {slide.game ? (
          <div className="af-game-visual" key={slide.game}>
            <img src={slide.game} alt="" />
          </div>
        ) : (
          <div className="af-welcome-orbit" key={slide.id} aria-hidden="true"><span className="af-welcome-mark">A</span></div>
        )}
        <div className="af-feature-copy">
          <span className="af-eyebrow">{slide.label}</span>
          <h1>{slide.title}</h1>
          <p>{slide.line}</p>
          {slide.action && <button className="af-feature-cta" type="button" onClick={() => step(1)}>{slide.action}{slide.action === 'Play Now' && <Play size={10} fill="currentColor" />}</button>}
        </div>
        <button className="af-carousel-control af-carousel-control--prev" type="button" aria-label="Previous featured slide" onClick={() => step(-1)}><ChevronLeft size={17} /></button>
        <button className="af-carousel-control af-carousel-control--next" type="button" aria-label="Next featured slide" onClick={() => step(1)}><ChevronRight size={17} /></button>
        <div className="af-dots" aria-label="Featured slide pagination">
          {slides.map((item, index) => <button key={item.id} className={`af-dot${active === index ? ' is-active' : ''}`} type="button" aria-label={`Show featured slide ${index + 1}`} aria-current={active === index} onClick={() => setActive(index)} />)}
        </div>
      </section>
    </div>
  );
}
