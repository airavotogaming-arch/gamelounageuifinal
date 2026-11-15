import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import './_group.css';

const slides = [
  { label: 'Featured game', title: <>LEAGUE <span>OF</span><br />LEGENDS</>, line: 'Play. Compete. Win.' },
  { label: 'Featured game', title: <>APEX<br />LEGENDS</>, line: 'Drop in. Stand out.' },
  { label: 'Featured game', title: <>VALORANT</>, line: 'Precision wins rounds.' },
];

export function Current() {
  const [active, setActive] = useState(0);
  const slide = slides[active];
  const step = (direction: number) => setActive((index) => (index + direction + slides.length) % slides.length);

  return (
    <div className="af-extract">
      <section className="af-feature" aria-label="Current featured game">
        <div className="af-feature-art" style={{ backgroundImage: 'url("/__mockup/images/airavoto-league-art.png")' }} />
        <div className="af-feature-copy">
          <span className="af-eyebrow">{slide.label}</span>
          <h1>{slide.title}</h1>
          <p>{slide.line}</p>
          <button className="af-feature-cta" type="button" onClick={() => step(1)}>Play Now <Play size={10} fill="currentColor" /></button>
        </div>
        <button className="af-carousel-control af-carousel-control--prev" type="button" aria-label="Previous featured game" onClick={() => step(-1)}><ChevronLeft size={17} /></button>
        <button className="af-carousel-control af-carousel-control--next" type="button" aria-label="Next featured game" onClick={() => step(1)}><ChevronRight size={17} /></button>
        <div className="af-dots" aria-label="Featured game pagination">
          {slides.map((item, index) => <button key={item.line} className={`af-dot${active === index ? ' is-active' : ''}`} type="button" aria-label={`Show featured game ${index + 1}`} aria-current={active === index} onClick={() => setActive(index)} />)}
        </div>
      </section>
    </div>
  );
}
