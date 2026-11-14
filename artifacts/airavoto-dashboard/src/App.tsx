import { type CSSProperties, type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Activity, Bell, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  Clock3, Coffee, Compass, Gamepad2, Gift, Headphones,
  Home as HomeIcon, Menu, Monitor, Pause, Play, Plus, Search, Settings, Shield,
  ShoppingBag, Sparkles, TrendingUp, Trophy, X
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import wallpaper from '@assets/image_1794675192538.png';
import SecondaryPage, {
  type LauncherGame,
  type LauncherPage,
} from '@/components/launcher/SecondaryPage';

const queryClient = new QueryClient();

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: HomeIcon },
  { label: 'Games', path: '/games', icon: Gamepad2 },
  { label: 'Discover', path: '/discover', icon: Compass },
  { label: 'Activity', path: '/activity', icon: Activity },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Rewards', path: '/rewards', icon: Gift },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Support', path: '/support', icon: Headphones },
  { label: 'Add library', path: '/add-library', icon: Plus },
] as const;

const DEFAULT_GAMES: LauncherGame[] = [
  { name: 'Valorant', art: '/artwork/game-valorant.png' },
  { name: 'GTA V', art: '/artwork/game-gta.png' },
  { name: 'Fortnite', art: '/artwork/game-fortnite.png' },
  { name: 'Minecraft', art: '/artwork/game-minecraft.png' },
  { name: 'Call of Duty', art: '/artwork/game-cod.png' },
  { name: 'EA FC 26', art: '/artwork/game-eafc.png' },
  { name: 'Among Us', art: '/artwork/game-among-us.png' },
  { name: 'Steam', art: '/artwork/game-steam.png' },
  { name: 'Discord', art: '/artwork/game-discord.png' },
  { name: 'Spotify', art: '/artwork/game-spotify.png' },
  { name: 'Roblox', art: '/artwork/game-roblox.png' },
  { name: 'Netflix', art: '/artwork/game-netflix.png' },
];

const BACKGROUND_PRESETS = [
  { id: 'windows', style: `url(${wallpaper})` },
  {
    id: 'nebula',
    style: 'radial-gradient(ellipse at 68% 38%,rgba(122,43,228,.78),transparent 42%),radial-gradient(ellipse at 22% 82%,rgba(27,67,173,.72),transparent 40%),linear-gradient(135deg,#070c2b,#18134a 58%,#080b22)',
  },
  {
    id: 'midnight',
    style: 'radial-gradient(ellipse at 72% 34%,rgba(35,103,197,.7),transparent 38%),linear-gradient(135deg,#061127,#102858 56%,#061024)',
  },
  {
    id: 'aurora',
    style: 'radial-gradient(ellipse at 22% 42%,rgba(40,209,181,.55),transparent 36%),radial-gradient(ellipse at 75% 30%,rgba(105,75,230,.7),transparent 38%),linear-gradient(135deg,#071b35,#0d3150 55%,#08142f)',
  },
] as const;

function getSavedGames(): LauncherGame[] {
  try {
    const saved = localStorage.getItem('airavoto-custom-games');
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (game: unknown) =>
          typeof game === 'object' &&
          game !== null &&
          'name' in game &&
          typeof game.name === 'string' &&
          'art' in game &&
          typeof game.art === 'string',
      )
    ) {
      return parsed as LauncherGame[];
    }
  } catch {
    // Ignore corrupt optional demo data and start with the built-in library.
  }
  return [];
}

function Home() {
  const navItems = NAV_ITEMS;
  const features = [
    { label: 'Featured game', title: <>League <span>of</span><br />Legends</>, line: 'Play. Compete. Win.' },
    { label: 'Featured game', title: <>Apex<br />Legends</>, line: 'Drop in. Stand out.' },
    { label: 'Featured game', title: <>Valorant</>, line: 'Precision wins rounds.' },
  ];
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [featureIndex, setFeatureIndex] = useState(0);
  const [seconds, setSeconds] = useState(() => Number(localStorage.getItem('airavoto-session-seconds')) || 4997);
  const [paused, setPaused] = useState(false);
  const [popover, setPopover] = useState('');
  const [notice, setNotice] = useState('');
  const [client, setClient] = useState('PC Client');
  const [customGames, setCustomGames] = useState<LauncherGame[]>(getSavedGames);
  const [customWallpaper, setCustomWallpaper] = useState(
    () => localStorage.getItem('airavoto-custom-wallpaper') || '',
  );
  const [backgroundId, setBackgroundId] = useState(() => {
    const saved = localStorage.getItem('airavoto-background-id');
    if (
      saved === 'custom' &&
      localStorage.getItem('airavoto-custom-wallpaper')
    ) {
      return 'custom';
    }
    return BACKGROUND_PRESETS.some((preset) => preset.id === saved)
      ? saved!
      : 'windows';
  });
  const [animationsEnabled, setAnimationsEnabled] = useState(
    () => localStorage.getItem('airavoto-animations') !== 'false',
  );
  const activeNav =
    navItems.find((item) => item.path === location)?.label ?? 'Home';
  const isHome = activeNav === 'Home';
  const games = [...customGames, ...DEFAULT_GAMES];
  const filteredGames = games.filter((game) => game.name.toLowerCase().includes(query.toLowerCase()));
  const selectedBackground =
    backgroundId === 'custom' && customWallpaper
      ? `url("${customWallpaper}")`
      : BACKGROUND_PRESETS.find((preset) => preset.id === backgroundId)?.style ??
        `url(${wallpaper})`;
  const time = `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setSeconds((value) => {
      const next = value + 1;
      localStorage.setItem('airavoto-session-seconds', String(next));
      return next;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [paused]);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('[data-testid="input-game-search"]')?.focus();
      }
      if (event.key === 'Escape') setPopover('');
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  const inform = (message: string) => { setNotice(message); setPopover(''); };
  const togglePopover = (name: string) => setPopover((current) => current === name ? '' : name);
  const cycleFeature = (step: number) => setFeatureIndex((index) => (index + step + features.length) % features.length);
  const currentFeature = features[featureIndex];
  const handleNavigate = (path: string) => {
    setLocation(path);
    setPopover('');
  };
  const handleBackgroundChange = (id: string) => {
    if (
      id !== 'custom' &&
      !BACKGROUND_PRESETS.some((preset) => preset.id === id)
    ) {
      inform('That background is not available.');
      return;
    }
    if (id === 'custom' && !customWallpaper) {
      inform('Upload a wallpaper first to use your custom background.');
      return;
    }
    setBackgroundId(id);
    try {
      localStorage.setItem('airavoto-background-id', id);
      inform('Background updated.');
    } catch {
      inform('Background updated for this session.');
    }
  };
  const handleWallpaperUpload = (file: File) => {
    const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
      inform('Choose a PNG, JPG, or WebP image.');
      return;
    }
    if (file.size > 2_500_000) {
      inform('Choose a wallpaper smaller than 2.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        inform('This wallpaper could not be read.');
        return;
      }
      setCustomWallpaper(reader.result);
      setBackgroundId('custom');
      try {
        localStorage.setItem('airavoto-custom-wallpaper', reader.result);
        localStorage.setItem('airavoto-background-id', 'custom');
        inform('Custom wallpaper applied and saved.');
      } catch {
        inform('Custom wallpaper applied for this session.');
      }
    };
    reader.onerror = () => inform('This wallpaper could not be read.');
    reader.readAsDataURL(file);
  };
  const handleAnimationsChange = (enabled: boolean) => {
    setAnimationsEnabled(enabled);
    try {
      localStorage.setItem('airavoto-animations', String(enabled));
    } catch {
      inform('Animation preference updated for this session.');
    }
  };
  const handleAddGame = (rawName: string) => {
    const name = rawName.trim();
    if (!name) {
      inform('Enter a game or app name first.');
      return;
    }
    if (games.some((game) => game.name.toLowerCase() === name.toLowerCase())) {
      inform(`${name} is already in your library.`);
      return;
    }
    const updated = [{ name, art: '' }, ...customGames];
    setCustomGames(updated);
    try {
      localStorage.setItem('airavoto-custom-games', JSON.stringify(updated));
      inform(`${name} added to your library.`);
    } catch {
      inform(`${name} added for this session.`);
    }
  };

  return (
    <div
      className={`launcher ${animationsEnabled ? 'motion-on' : 'motion-off'}`}
      style={{ '--wallpaper': selectedBackground } as CSSProperties}
    >
      <div className="dashboard">
        <header className="topbar">
          <div className="brand" data-testid="brand-airavoto">
            <div className="brand-mark" aria-hidden="true" />
            <div><div className="brand-title">Airavoto</div><div className="brand-sub">Gaming Launcher</div></div>
          </div>
          <label className="searchbox">
            <Search size={15} aria-hidden="true" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search games, apps, or anything..." aria-label="Search games and apps" data-testid="input-game-search" />
            <span className="shortcut">Ctrl + K</span>
          </label>
          <div className="top-actions">
            <button className="pill-btn" onClick={() => togglePopover('client')} aria-label="Select client" data-testid="button-client">
              <Monitor size={17} color="#dc66ff" /><span>{client}<small style={{display:'block',fontSize:8,fontWeight:400}}>Gaming Lounge</small></span><ChevronDown size={12} />
            </button>
            <button className="pill-btn profile-button" onClick={() => togglePopover('profile')} aria-label="Open profile" data-testid="button-profile">
              <span className="avatar" aria-hidden="true" /><span className="profile-name">Player_007<small><Shield size={9} style={{display:'inline',verticalAlign:'-1px'}} /> Pro Member</small></span><ChevronDown size={12} />
            </button>
            <button className="icon-button" aria-label="Notifications" onClick={() => togglePopover('notifications')} data-testid="button-notifications"><Bell size={15}/><span className="badge">3</span></button>
            <button className="icon-button" aria-label="Minimize launcher" onClick={() => inform('Launcher is ready to minimize.')} data-testid="button-minimize"><Menu size={14}/></button>
            <button className="icon-button" aria-label="Close launcher panel" onClick={() => inform('Airavoto is still running in the background.')} data-testid="button-close"><X size={14}/></button>
          </div>
        </header>
        <nav className="sidebar" aria-label="Main navigation">
          {navItems.map(({ label, path, icon: Icon }) => <button key={label} className={`nav-icon ${activeNav === label ? 'active' : ''}`} title={label} aria-label={label} aria-pressed={activeNav === label} onClick={() => handleNavigate(path)} data-testid={`nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={17}/></button>)}
        </nav>
        <main className={`main-grid ${isHome ? 'is-home' : 'is-secondary'}`}>
          {isHome ? <>
          <section className="feature glass" aria-label="Featured game">
            <div className="feature-art" />
            <div className="feature-copy">
              <span className="eyebrow" data-testid="text-feature-label">{currentFeature.label}</span>
              <h1 data-testid="text-feature-title">{currentFeature.title}</h1>
              <p>{currentFeature.line}</p>
              <button className="primary-btn" onClick={() => inform(`${featureIndex === 0 ? 'League of Legends' : featureIndex === 1 ? 'Apex Legends' : 'Valorant'} selected to play`)} data-testid="button-play-now">Play Now <Play size={10} fill="currentColor" style={{display:'inline',marginLeft:4,verticalAlign:'-1px'}}/></button>
            </div>
            <button className="carousel-control prev" onClick={() => cycleFeature(-1)} aria-label="Previous featured game" data-testid="button-feature-previous"><ChevronLeft size={17}/></button>
            <button className="carousel-control next" onClick={() => cycleFeature(1)} aria-label="Next featured game" data-testid="button-feature-next"><ChevronRight size={17}/></button>
            <div className="dots" aria-label="Featured game pagination">{features.map((feature, index) => <button key={feature.line} className={`dot ${index === featureIndex ? 'on' : ''}`} aria-label={`Show featured game ${index + 1}`} aria-current={index === featureIndex} onClick={() => setFeatureIndex(index)} data-testid={`button-feature-dot-${index + 1}`} />)}</div>
          </section>
          <section className="session glass" aria-label="Current session">
            <Clock3 className="tiny-clock" size={15}/>
            <div className="section-kicker"><span className="purple-dot"/>Current Session</div>
            <div className="timer" data-testid="text-session-timer">{time}</div>
            <button className="primary-btn pause" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Resume session timer' : 'Pause session timer'} data-testid="button-session-toggle">{paused ? <Play size={11} fill="currentColor"/> : <Pause size={11} fill="currentColor"/>} &nbsp;{paused ? 'Resume' : 'Pause'}</button>
          </section>
          <section className="week-card glass">
            <div className="card-heading"><span><TrendingUp size={13} color="#d849ff" style={{display:'inline',verticalAlign:'-3px'}}/> Weekly Activity</span><button onClick={() => inform('Weekly activity · 18h 42m across 7 days')} data-testid="button-activity-details">View Details <ChevronRight size={11} style={{display:'inline',verticalAlign:'-2px'}}/></button></div>
            <div className="bars" data-testid="chart-weekly-activity">{[42,69,34,57,85,65,79].map((height,index)=><div className="bar-col" key={index}><div className="bar" style={{height:`${height}%`}}/><span>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][index]}</span></div>)}</div>
          </section>
          <section className="stats-card glass">
            <div className="card-heading"><span><Activity size={13} color="#d849ff" style={{display:'inline',verticalAlign:'-3px'}}/> Your Stats</span></div>
            <div className="stat-pair"><div><div className="stat-value" data-testid="text-win-rate">66%</div><div className="stat-label">Win Rate</div></div><div className="stat-split"/><div><div className="stat-value" data-testid="text-kd">3.15</div><div className="stat-label">K/D</div></div></div>
            <button className="text-action" onClick={() => inform('Your stats · 66% win rate · 3.15 K/D')} data-testid="button-stats-details">View Stats <ChevronRight size={10} style={{display:'inline',verticalAlign:'-2px'}}/></button>
          </section>
          <section className="perform-card glass">
            <div className="card-heading"><span><Trophy size={13} color="#d849ff" style={{display:'inline',verticalAlign:'-3px'}}/> Top Performances</span><button onClick={() => inform('Top performances · your best recent matches')} data-testid="button-performances-details">See All <ChevronRight size={11} style={{display:'inline',verticalAlign:'-2px'}}/></button></div>
            <div className="performers" data-testid="list-top-performances">{[1, 2, 3].map((number) => <div key={number} className={`performer ${['one', 'two', 'three'][number - 1]}`} title="Champion performance" style={{ backgroundImage: `url(/artwork/performance-${number}.png)` }} />)}</div>
          </section>
          <section className="ad-card glass">
            <span className="eyebrow" style={{position:'absolute',right:9,top:8,padding:'2px 6px',fontSize:8}}>Ad</span>
            <div className="ad-art" aria-hidden="true"><img src="/artwork/ps5.png" alt="" /></div>
            <div className="ad-copy"><div className="ad-title">Advertisement</div><div style={{fontSize:15}}>◉</div><h3>PlayStation 5</h3><p>Next Gen Gaming</p><button className="primary-btn" onClick={() => inform('PlayStation 5 · Learn more')} data-testid="button-learn-more">Learn More <ChevronRight size={10} style={{display:'inline',verticalAlign:'-2px'}}/></button></div>
          </section>
          <section className="all-games glass">
              <div className="card-heading"><span><Gamepad2 size={14} color="#d849ff" style={{display:'inline',verticalAlign:'-3px'}}/> All Games</span><button onClick={() => togglePopover('library')} data-testid="button-all-games">See All <ChevronRight size={11} style={{display:'inline',verticalAlign:'-2px'}}/></button></div>
            <div className="game-grid" data-testid="grid-all-games">
              {filteredGames.length ? filteredGames.slice(0, 12).map((game) => <button key={game.name} className="game-tile" title={`Open ${game.name}`} onClick={() => inform(`${game.name} selected`)} data-testid={`game-tile-${game.name.toLowerCase().replaceAll(' ','-')}`}><span className="game-symbol" style={game.art ? { backgroundImage: `url(${game.art})` } : undefined} aria-hidden="true">{!game.art && game.name.slice(0, 1).toUpperCase()}</span><span className="game-name">{game.name}</span></button>) : <div className="empty-games" data-testid="empty-game-search">No games match “{query}”</div>}
            </div>
          </section>
          <section className="popular-card glass">
            <div className="card-heading"><span><Sparkles size={13} color="#d849ff" style={{display:'inline',verticalAlign:'-3px'}}/> Popular Games</span><button onClick={() => inform('Popular games · trending in your community')} data-testid="button-popular-details">See All <ChevronRight size={11} style={{display:'inline',verticalAlign:'-2px'}}/></button></div>
            <div className="performers" data-testid="list-popular-games">
              {[
                { name: 'Grand Theft Auto V', art: 'popular-gta.png' },
                { name: 'Call of Duty', art: 'popular-cod.png' },
                { name: 'EA FC 26', art: 'popular-eafc.png' },
                { name: 'Valorant', art: 'popular-valorant.png' },
              ].map(({ name, art }, index) => <button key={name} className="popular-game" onClick={() => inform(`${name} selected from Popular Games`)} data-testid={`popular-game-${index}`}><img src={`/artwork/${art}`} alt="" /><span>{name}</span></button>)}
            </div>
          </section>
          <section className="food-card glass">
            <div className="card-heading"><span><Coffee size={13} color="#d849ff" style={{display:'inline',verticalAlign:'-3px'}}/> Food &amp; Drinks</span><button onClick={() => inform('Food & drinks menu opened')} data-testid="button-food-menu">See All <ChevronRight size={11} style={{display:'inline',verticalAlign:'-2px'}}/></button></div>
            <div className="food-row"><div className="burger-art" aria-hidden="true" /><div className="food-copy"><strong>Burger Combo</strong><div className="food-price">₹199</div></div></div>
            <button className="primary-btn" style={{alignSelf:'flex-end',padding:'4px 10px'}} onClick={() => inform('Burger Combo added to your order')} data-testid="button-order-food">Order Now <ChevronRight size={10} style={{display:'inline',verticalAlign:'-2px'}}/></button>
          </section>
          <section className="quick-actions glass">
            <div className="quick-title"><Sparkles size={13} color="#d849ff" style={{display:'inline',verticalAlign:'-3px'}}/> Quick Actions</div>
            <button className="quick-btn" onClick={() => inform('Food ordering is ready')} data-testid="button-quick-order"><ShoppingBag size={17} color="#f2b548"/>Order Food</button>
            <button className="quick-btn" onClick={() => inform('PC booking · choose your preferred station')} data-testid="button-book-pc"><Monitor size={17}/>Book PC</button>
            <button className="quick-btn" onClick={() => inform('Your stats · 66% win rate · 3.15 K/D')} data-testid="button-quick-stats"><Activity size={17}/>View Stats</button>
            <button className="quick-btn" onClick={() => inform('Support is available at the gaming lounge desk')} data-testid="button-support"><Headphones size={17}/>Support</button>
            <button className="quick-btn" onClick={() => togglePopover('more')} data-testid="button-quick-more">More <ChevronRight size={14}/></button>
          </section>
          <section className="discount glass">
            <div><h2>Get 20% OFF</h2><p>on your next session!</p></div>
            <button className="discount-hit" aria-label="View 20 percent session offer" onClick={() => inform('20% session discount · offer details opened')} data-testid="button-discount" />
          </section>
          </> : <SecondaryPage
            page={activeNav as LauncherPage}
            games={games}
            query={query}
            onQueryChange={setQuery}
            onGameSelect={(name) => inform(`${name} selected to play`)}
            onAddGame={handleAddGame}
            onAction={inform}
            backgroundId={backgroundId}
            onBackgroundChange={handleBackgroundChange}
            customBackgroundAvailable={Boolean(customWallpaper)}
            onWallpaperUpload={handleWallpaperUpload}
            animationsEnabled={animationsEnabled}
            onAnimationsChange={handleAnimationsChange}
          />}
        </main>
      </div>
      {popover && <div className="popover" role="dialog" aria-label={`${popover} options`} data-testid={`popover-${popover}`}>
        <button aria-label="Close popover" onClick={() => setPopover('')} data-testid="button-close-popover" style={{float:'right',background:'transparent',padding:0}}><X size={14}/></button>
        {popover === 'client' && <><h3>Select a client</h3>{['PC Client','Console','Cloud Gaming'].map((option)=><button key={option} onClick={()=>{setClient(option);setPopover('')}} data-testid={`button-client-${option.toLowerCase().replaceAll(' ','-')}`} style={{display:'block',margin:'5px 0',width:'100%',textAlign:'left'}}>{option}</button>)}</>}
        {popover === 'profile' && <><h3>Player_007</h3><p>Pro Member · Level 28<br/>Your gaming profile is up to date.</p><button onClick={()=>inform('Profile settings opened')} data-testid="button-profile-settings">Profile settings</button></>}
        {popover === 'notifications' && <><h3>Notifications</h3><p>Weekly activity report is ready.</p><p>Your Pro membership is active.</p><p>New games added to the lounge.</p><button onClick={()=>inform('Notifications marked as read')} data-testid="button-mark-read">Mark all as read</button></>}
        {popover === 'more' && <><h3>Quick access</h3><button onClick={()=>inform('Your achievements are up to date')} data-testid="button-achievements">Achievements</button><button onClick={()=>inform('Friends list opened')} style={{marginLeft:6}} data-testid="button-friends">Friends</button></>}
        {popover === 'library' && <><h3>All Games</h3><p>{games.length} apps in your library</p><div className="library-list">{games.map((game) => <button key={game.name} onClick={() => inform(`${game.name} selected`)} data-testid={`library-game-${game.name.toLowerCase().replaceAll(' ', '-')}`}>{game.name}</button>)}</div></>}
      </div>}
      {notice && <div className="toast-note" role="status" data-testid="status-feedback">{notice}</div>}
      {backgroundId !== 'windows' && <div className="system-taskbar" aria-label="Windows taskbar">
        <div className="taskbar-weather"><strong>29°C</strong><span>Mostly cloudy</span></div>
        <div className="taskbar-apps">
          <button aria-label="Open Home" onClick={() => handleNavigate('/')} data-testid="taskbar-home"><HomeIcon size={19}/></button>
          <button className="taskbar-search" aria-label="Search games" onClick={() => document.querySelector<HTMLInputElement>('[data-testid="input-game-search"]')?.focus()} data-testid="taskbar-search"><Search size={15}/>Search</button>
          <button aria-label="Open Games" onClick={() => handleNavigate('/games')} data-testid="taskbar-games"><Gamepad2 size={18}/></button>
          <button aria-label="Open Settings" onClick={() => handleNavigate('/settings')} data-testid="taskbar-settings"><Settings size={18}/></button>
        </div>
        <div className="taskbar-status"><span>9:37 PM</span><small>11/14/2026</small></div>
      </div>}
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        {NAV_ITEMS.slice(1).map((item) => (
          <Route key={item.path} path={item.path} component={Home} />
        ))}
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
