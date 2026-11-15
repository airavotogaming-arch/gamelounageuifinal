import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Activity, ArrowDownToLine, ArrowUpRight, CalendarDays, Check, ChevronRight,
  Clock3, Gamepad2, ImagePlus, MapPin, Search, Settings2, Sparkles, Trophy,
  Upload
} from 'lucide-react';
import SupportChatPanel, {
  type SupportChatMessage,
} from './SupportChatPanel';
import './secondary-page.css';

export type LauncherPage = 'Games' | 'Discover' | 'Activity' | 'Calendar' | 'Settings' | 'Support Chat' | 'Add library';
export type LauncherGame = { name: string; art: string };

type SecondaryPageProps = {
  page: LauncherPage;
  games: LauncherGame[];
  query: string;
  onQueryChange: (value: string) => void;
  onGameSelect: (name: string) => void;
  onAddGame: (name: string) => void;
  onAction: (message: string) => void;
  supportMessages: SupportChatMessage[];
  onSupportMessage: (text: string) => void;
  onClearSupportChat: () => void;
  backgroundId: string;
  onBackgroundChange: (id: string) => void;
  customBackgroundAvailable: boolean;
  onWallpaperUpload: (file: File) => void;
  animationsEnabled: boolean;
  onAnimationsChange: (enabled: boolean) => void;
};

const backgrounds = [
  { id: 'windows', name: 'Glass Horizon', detail: 'Soft daylight · Windows', swatch: 'windows' },
  { id: 'nebula', name: 'Nebula Drift', detail: 'Deep space · violet haze', swatch: 'nebula' },
  { id: 'midnight', name: 'Midnight Grid', detail: 'Low light · quiet contrast', swatch: 'midnight' },
  { id: 'aurora', name: 'Aurora Flow', detail: 'Northern light · teal glow', swatch: 'aurora' },
];

const sessions = [
  { day: 'TODAY', date: '14', month: 'NOV', title: 'Ranked duo night', time: '7:30 PM – 9:30 PM', place: 'Squad room · Station 04', accent: 'violet' },
  { day: 'FRI', date: '20', month: 'NOV', title: 'Community tournament', time: '6:00 PM – 8:00 PM', place: 'Main arena · 16 seats', accent: 'cyan' },
];

const safeId = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function SecondaryPage({
  page, games, query, onQueryChange, onGameSelect, onAddGame, onAction,
  supportMessages, onSupportMessage, onClearSupportChat,
  backgroundId, onBackgroundChange, customBackgroundAvailable, onWallpaperUpload,
  animationsEnabled, onAnimationsChange,
}: SecondaryPageProps) {
  const [newTitle, setNewTitle] = useState('');
  const [bookedSessions, setBookedSessions] = useState<string[]>([]);
  const wallpaperInput = useRef<HTMLInputElement>(null);
  const filteredGames = useMemo(
    () => games.filter((game) => game.name.toLowerCase().includes(query.trim().toLowerCase())),
    [games, query],
  );
  const trendingGames = useMemo(() => {
    const preferred = ['Valorant', 'GTA V', 'Fortnite', 'Call of Duty', 'Minecraft', 'EA FC 26'];
    return preferred.map((name) => games.find((game) => game.name.toLowerCase() === name.toLowerCase()))
      .filter((game): game is LauncherGame => Boolean(game)).slice(0, 4);
  }, [games]);

  const submitTitle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    onAddGame(title);
    setNewTitle('');
  };

  const handleWallpaper = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onWallpaperUpload(file);
    event.target.value = '';
  };

  const pageCopy: Record<LauncherPage, { eyebrow: string; title: string; description: string }> = {
    Games: { eyebrow: 'YOUR COLLECTION', title: 'The library', description: 'Every game in the lounge, ready when you are.' },
    Discover: { eyebrow: 'LOUNGE PULSE', title: 'Find your next', description: 'What players are loading into right now.' },
    Activity: { eyebrow: 'YOUR RECENT RUN', title: 'Play with purpose', description: 'A clear view of your time, rhythm, and recent wins.' },
    Calendar: { eyebrow: 'MAKE A PLAN', title: 'Good games ahead', description: 'Reserve a spot and give your next session a date.' },
    Settings: { eyebrow: 'MAKE IT YOURS', title: 'Set the scene', description: 'Choose a backdrop and tune the launcher to your pace.' },
    'Support Chat': { eyebrow: 'LOCAL DEMO INBOX', title: 'Support Chat', description: 'Write to the lounge admin in this browser-only demo.' },
    'Add library': { eyebrow: 'GROW YOUR LIBRARY', title: 'Bring a game in', description: 'Add a title to your local collection.' },
  };
  const copy = pageCopy[page];

  return (
    <section className={`secondary-page${animationsEnabled ? ' is-animated' : ' motion-off'}`} aria-labelledby="secondary-page-title" data-testid={`secondary-page-${safeId(page)}`}>
      <header className="secondary-head">
        <div className="secondary-heading">
          <span className="sp-eyebrow"><span className="sp-live-dot" />{copy.eyebrow}</span>
          <h1 id="secondary-page-title" data-testid="text-secondary-title">{copy.title}<span className="sp-title-period">.</span></h1>
          <p>{copy.description}</p>
        </div>
        <div className="sp-header-mark" aria-hidden="true"><span /><span /><span /></div>
      </header>

      {page === 'Games' && (
        <div className="sp-page-content sp-games-layout">
          <section className="sp-panel sp-library-panel">
            <div className="sp-panel-top">
              <div><span className="sp-kicker">READY TO PLAY</span><h2>All titles <span className="sp-count">{games.length.toString().padStart(2, '0')}</span></h2></div>
              <label className="sp-search">
                <Search size={15} aria-hidden="true" />
                <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search your library" aria-label="Search library games" data-testid="input-secondary-game-search" />
              </label>
            </div>
            {filteredGames.length ? (
              <div className="sp-game-grid" data-testid="grid-secondary-games">
                {filteredGames.map((game, index) => (
                  <button className="sp-game-card" type="button" key={`${game.name}-${game.art}`} onClick={() => onGameSelect(game.name)} data-testid={`secondary-game-${safeId(game.name)}`}>
                    <span className="sp-game-art" style={game.art ? { backgroundImage: `url("${game.art}")` } : undefined} aria-hidden="true">{game.art ? <span className="sp-play-mark"><ArrowUpRight size={16} /></span> : <span className="sp-game-initial">{game.name.slice(0, 2).toUpperCase()}</span>}</span>
                    <span className="sp-game-meta"><strong>{game.name}</strong><span>{index % 3 === 0 ? 'Recently played' : 'In your library'}</span></span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="sp-empty" data-testid="empty-secondary-games"><Search size={22} /><strong>No matches in this run.</strong><span>Try another title or clear your search.</span><button type="button" onClick={() => onQueryChange('')} data-testid="button-clear-secondary-search">Clear search</button></div>
            )}
          </section>
          <aside className="sp-side-rail">
            <section className="sp-panel sp-spotlight">
              <span className="sp-rail-index">01 / COLLECTION</span><Gamepad2 size={19} />
              <h3>More room for<br />good games.</h3><p>Found something missing? Add a title to your local library.</p>
              <button type="button" className="sp-link-action" onClick={() => onAction('Open Add library to bring a new title into your collection.')} data-testid="button-library-add-hint">Add a title <ChevronRight size={14} /></button>
            </section>
            <section className="sp-panel sp-mini-note"><span className="sp-note-label"><Clock3 size={13} /> RECENT ROTATION</span><strong>Built for your next session.</strong><span>Your library stays close, so your next pick is never far away.</span></section>
          </aside>
        </div>
      )}

      {page === 'Discover' && (
        <div className="sp-page-content sp-discover-layout">
          <section className="sp-discover-feature sp-panel" data-testid="panel-discover-feature">
            <div className="sp-feature-orbit" aria-hidden="true"><span /><span /><span /></div>
            <div className="sp-discover-copy"><span className="sp-kicker"><Sparkles size={13} /> THIS WEEK IN THE LOUNGE</span><h2>One more<br /><em>round?</em></h2><p>Fresh picks from the games your crew keeps coming back to.</p><button type="button" className="sp-button-primary" onClick={() => onAction('Trending games are ready to explore.')} data-testid="button-discover-trending">Explore what’s hot <ArrowUpRight size={15} /></button></div>
            <span className="sp-feature-serial">AIRAVOTO / DISCOVER 026</span>
          </section>
          <section className="sp-panel sp-trending-panel">
            <div className="sp-section-head"><div><span className="sp-kicker">COMMUNITY PICKS</span><h2>Trending now</h2></div><span className="sp-live-label"><span className="sp-live-dot" /> LIVE ROTATION</span></div>
            {trendingGames.length ? <div className="sp-trending-list">{trendingGames.map((game, index) => (
              <button className="sp-trend-row" key={game.name} type="button" onClick={() => onGameSelect(game.name)} data-testid={`button-trending-${safeId(game.name)}`}>
                <span className="sp-trend-rank">{String(index + 1).padStart(2, '0')}</span><span className="sp-trend-art" style={{ backgroundImage: `url("${game.art}")` }} /><span className="sp-trend-name"><strong>{game.name}</strong><small>{['Squads are queuing up', 'A lounge classic', 'Back on the leaderboard', 'Made for a late session'][index]}</small></span><span className="sp-trend-status">{index === 0 ? 'RISING' : 'POPULAR'}</span><ChevronRight size={15} />
              </button>
            ))}</div> : <div className="sp-empty"><Gamepad2 size={22} /><strong>Your next favorite is on its way.</strong><span>Add games to your library to see tailored picks here.</span></div>}
          </section>
          <div className="sp-discover-foot"><span><span className="sp-live-dot" /> Curated from lounge favorites</span><span>UPDATED TODAY <span className="sp-foot-rule" /></span></div>
        </div>
      )}

      {page === 'Activity' && (
        <div className="sp-page-content sp-activity-layout">
          <div className="sp-metric-row">
            <section className="sp-panel sp-metric-card sp-metric-primary"><span className="sp-kicker">PLAY TIME THIS WEEK</span><div className="sp-metric-value">18<span>h</span> 42<span>m</span></div><span className="sp-metric-caption"><span className="sp-up-mark">↗</span> 2h 16m more than last week</span><div className="sp-metric-spark" aria-hidden="true">{[32,54,42,72,51,85,66,100,72,89].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div></section>
            <section className="sp-panel sp-metric-card"><span className="sp-kicker">SESSIONS PLAYED</span><div className="sp-metric-value">12<span className="sp-metric-unit"> sessions</span></div><span className="sp-metric-caption">Across 4 different titles</span><div className="sp-metric-symbol"><Activity size={34} /></div></section>
            <section className="sp-panel sp-metric-card"><span className="sp-kicker">BEST STREAK</span><div className="sp-metric-value">04<span className="sp-metric-unit"> days</span></div><span className="sp-metric-caption">Your longest run this month</span><div className="sp-metric-symbol trophy-symbol"><Trophy size={34} /></div></section>
          </div>
          <div className="sp-activity-bottom">
            <section className="sp-panel sp-activity-chart">
              <div className="sp-section-head"><div><span className="sp-kicker">TIME WELL SPENT</span><h2>Your weekly rhythm</h2></div><span className="sp-chart-total">18h 42m <small>total</small></span></div>
              <div className="sp-chart" aria-label="Weekly playtime chart">
                <div className="sp-chart-guides"><span>5h</span><span>3h</span><span>1h</span><span>0</span></div>
                <div className="sp-chart-bars">{[{ day: 'M', value: 42 }, { day: 'T', value: 67 }, { day: 'W', value: 35 }, { day: 'T', value: 58 }, { day: 'F', value: 82 }, { day: 'S', value: 96 }, { day: 'S', value: 62 }].map((item, index) => <div className={`sp-chart-col${index === 5 ? ' is-current' : ''}`} key={`${item.day}-${index}`}><span className="sp-chart-tooltip">{Math.round(item.value * 3.1 / 100)}h {item.value % 60}m</span><i style={{ height: `${item.value}%` }} /><small>{item.day}</small></div>)}</div>
              </div>
            </section>
            <section className="sp-panel sp-performance"><span className="sp-kicker">A LITTLE CONTEXT</span><h2>Your sessions<br />are finding a rhythm.</h2><p>Most of your play happened after 6 PM. Friday was your longest run.</p><button type="button" className="sp-link-action" onClick={() => onAction('Activity summary · 18h 42m played across 12 sessions this week.')} data-testid="button-activity-summary">Full session summary <ChevronRight size={14} /></button><span className="sp-performance-watermark"><Activity size={62} /></span></section>
          </div>
        </div>
      )}

      {page === 'Calendar' && (
        <div className="sp-page-content sp-calendar-layout">
           <section className="sp-panel sp-calendar-intro"><div><span className="sp-kicker"><CalendarDays size={13} /> YOUR UPCOMING SESSIONS</span><h2>Make space<br />for the <em>good stuff.</em></h2><p>Pick a plan. We’ll keep your next lounge night in view.</p></div><div className="sp-calendar-date"><span>NOV</span><strong>2026</strong><div className="sp-date-orbit">14</div><small>SATURDAY</small></div></section>
          <section className="sp-session-list">
            {sessions.map((session) => {
              const isBooked = bookedSessions.includes(session.title);
              return <article className={`sp-panel sp-session-card accent-${session.accent}`} key={session.title} data-testid={`card-session-${safeId(session.title)}`}>
                <div className="sp-session-date"><span>{session.day}</span><strong>{session.date}</strong><small>{session.month}</small></div>
                <div className="sp-session-info"><span className="sp-session-tag">{session.accent === 'violet' ? 'SQUAD PLAY' : 'OPEN EVENT'}</span><h3>{session.title}</h3><p><Clock3 size={13} />{session.time}<span className="sp-session-divider" /><MapPin size={13} />{session.place}</p></div>
                <button type="button" className={isBooked ? 'sp-button-confirmed' : 'sp-button-primary'} onClick={() => { if (!isBooked) { setBookedSessions((current) => [...current, session.title]); onAction(`${session.title} added to your local schedule.`); } }} aria-pressed={isBooked} data-testid={`button-book-${safeId(session.title)}`}>{isBooked ? <><Check size={15} /> Added</> : <>Save my spot <ChevronRight size={15} /></>}</button>
              </article>;
            })}
            <button className="sp-calendar-cta" type="button" onClick={() => onAction('Your local calendar is up to date. More lounge sessions will appear here.')} data-testid="button-calendar-more"><span className="sp-cta-plus">+</span><span><strong>Need a different time?</strong><small>Ask the lounge team about a private session.</small></span><ChevronRight size={16} /></button>
          </section>
        </div>
      )}

      {page === 'Settings' && (
        <div className="sp-page-content sp-settings-layout">
          <section className="sp-panel sp-settings-wallpaper">
            <div className="sp-section-head"><div><span className="sp-kicker">DESKTOP ATMOSPHERE</span><h2>Pick a background</h2><p>Small shift, whole new mood.</p></div><span className="sp-settings-icon"><ImagePlus size={17} /></span></div>
            <div className="sp-wallpaper-grid">
              {backgrounds.map((background) => <button type="button" key={background.id} className={`sp-wallpaper-option swatch-${background.swatch}${backgroundId === background.id ? ' is-selected' : ''}`} onClick={() => onBackgroundChange(background.id)} aria-pressed={backgroundId === background.id} data-testid={`button-background-${background.id}`}><span className="sp-wallpaper-art"><i /><i /><i />{backgroundId === background.id && <span className="sp-selected-check"><Check size={13} /></span>}</span><span className="sp-wallpaper-name">{background.name}</span><span className="sp-wallpaper-detail">{background.detail}</span></button>)}
              {customBackgroundAvailable && <button type="button" className={`sp-wallpaper-option swatch-custom${backgroundId === 'custom' ? ' is-selected' : ''}`} onClick={() => onBackgroundChange('custom')} aria-pressed={backgroundId === 'custom'} data-testid="button-background-custom"><span className="sp-wallpaper-art"><ImagePlus size={19} />{backgroundId === 'custom' && <span className="sp-selected-check"><Check size={13} /></span>}</span><span className="sp-wallpaper-name">Your wallpaper</span><span className="sp-wallpaper-detail">Uploaded by you</span></button>}
            </div>
            <div className="sp-upload-row"><input ref={wallpaperInput} className="sp-hidden-input" type="file" accept="image/*" onChange={handleWallpaper} aria-label="Upload a custom wallpaper" data-testid="input-wallpaper-upload" /><div><strong>Bring your own backdrop</strong><span>JPG, PNG, or WEBP · stored locally by the launcher</span></div><button type="button" className="sp-button-outline" onClick={() => wallpaperInput.current?.click()} data-testid="button-upload-wallpaper"><Upload size={14} /> Upload wallpaper</button></div>
          </section>
          <section className="sp-panel sp-motion-setting"><div className="sp-motion-symbol"><Settings2 size={19} /></div><div className="sp-motion-copy"><span className="sp-kicker">MOVEMENT & FEEDBACK</span><h2>Quiet the motion</h2><p>Keep page and card transitions subtle—or switch them off entirely.</p></div><button type="button" className={`sp-toggle${animationsEnabled ? ' is-on' : ''}`} role="switch" aria-checked={animationsEnabled} aria-label="Enable interface animations" onClick={() => onAnimationsChange(!animationsEnabled)} data-testid="switch-animations"><span /></button><span className="sp-toggle-state">{animationsEnabled ? 'ON' : 'OFF'}</span></section>
          <div className="sp-settings-foot"><span><Check size={13} /> Settings apply immediately</span><span>YOUR SPACE, YOUR RULES</span></div>
        </div>
      )}

      {page === 'Support Chat' && (
        <div className="sp-page-content sp-chat-page">
          <SupportChatPanel
            messages={supportMessages}
            onSend={onSupportMessage}
            onClear={onClearSupportChat}
          />
        </div>
      )}

      {page === 'Add library' && (
        <div className="sp-page-content sp-add-layout">
          <section className="sp-panel sp-add-form-panel">
            <div className="sp-add-intro"><span className="sp-kicker">LOCAL COLLECTION</span><h2>Make it<br /><em>part of the lineup.</em></h2><p>Add a game by name. Your launcher will keep it close for the next time you’re ready to play.</p><div className="sp-add-mini-stat"><span className="sp-add-stat-mark"><Gamepad2 size={17} /></span><span><strong>{games.length} titles</strong><small>currently in your library</small></span></div></div>
            <form className="sp-add-form" onSubmit={submitTitle}>
              <label htmlFor="sp-new-game">GAME TITLE</label>
              <div className="sp-title-input-wrap"><Gamepad2 size={17} /><input id="sp-new-game" type="text" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="e.g. Hades II" autoComplete="off" required maxLength={80} data-testid="input-new-game-title" /></div>
              <span className="sp-field-hint">Use the title your lounge team will recognize.</span>
              <button type="submit" className="sp-button-primary sp-submit-add" disabled={!newTitle.trim()} data-testid="button-submit-new-game">Add to library <ArrowDownToLine size={15} /></button>
              <span className="sp-local-note"><Check size={13} /> Added titles are handled by your launcher.</span>
            </form>
          </section>
          <aside className="sp-add-side">
            <section className="sp-panel sp-add-tip"><span className="sp-tip-number">01</span><span className="sp-kicker">A QUICK NOTE</span><h3>One title at a time.</h3><p>Keep names clear and distinct. You can start playing as soon as it appears in your library.</p><span className="sp-tip-rule" /></section>
            <section className="sp-panel sp-add-next"><span className="sp-kicker">THEN WHAT?</span><strong>Pick your next move.</strong><button type="button" className="sp-link-action" onClick={() => onAction('Your game library is ready whenever you are.')} data-testid="button-add-library-done">Back to the collection <ChevronRight size={14} /></button></section>
          </aside>
        </div>
      )}
    </section>
  );
}

export default SecondaryPage;
