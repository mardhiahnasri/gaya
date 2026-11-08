import { useEffect, useState } from 'react';
import { getProfile, type Profile } from './services/api';
import { WardrobePage } from './pages/WardrobePage';
import { StudioPage } from './pages/StudioPage';
import { TryOnPage } from './pages/TryOnPage';
import { ProfilePage } from './pages/ProfilePage';
import { ColoursPage } from './pages/ColoursPage';

type Page = 'wardrobe' | 'studio' | 'tryon' | 'profile' | 'colours';

const ICONS: Record<Page, string[]> = {
  wardrobe: ['M12 4a2 2 0 0 1 2 2c0 1-1 1.5-2 2v1', 'm3 18 9-7 9 7a1 1 0 0 1-.6 1.8H3.6A1 1 0 0 1 3 18Z'],
  studio: ['M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Z', 'M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7L19 15Z'],
  tryon: ['M8.5 4 3 7l2 4 2-1v10h10V10l2 1 2-4-5.5-3a3.5 3.5 0 0 1-7 0Z'],
  profile: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
  colours: ['M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.5-1.9-.3-1 .4-2.1 1.5-2.1H17a4 4 0 0 0 4-4c0-5-4-10-9-10Z', 'M7.5 11h.01M10 7.5h.01M14.5 7.5h.01'],
};

const NAV: { id: Page; label: string; hint: string }[] = [
  { id: 'wardrobe', label: 'Wardrobe', hint: 'Your pieces' },
  { id: 'studio', label: 'Outfit studio', hint: 'Mix & match' },
  { id: 'tryon', label: 'Try on', hint: 'See it on you' },
  { id: 'profile', label: 'Profile', hint: 'Body & style' },
  { id: 'colours', label: 'Colour check', hint: 'Palette harmony' },
];

function NavIcon({ id }: { id: Page }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[id].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>('wardrobe');
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  const hasBody = Boolean(profile?.bodyPhoto);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-name">Gaya<span>.</span></div>
          <div className="brand-tag">AI wardrobe stylist</div>
        </div>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <button key={n.id} className={`nav-item${page === n.id ? ' active' : ''}`} aria-current={page === n.id ? 'page' : undefined} onClick={() => setPage(n.id)}>
              <NavIcon id={n.id} />
              <span className="nav-text">{n.label}<small>{n.hint}</small></span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span className={`status-dot${hasBody ? ' on' : ''}`} />
          {hasBody ? 'Body photo saved' : 'No body photo yet'}
        </div>
      </aside>
      <main className="main">
        {page === 'wardrobe' && <WardrobePage />}
        {page === 'studio' && <StudioPage profile={profile?.modesty ?? 'none'} hasBody={hasBody} onNeedProfile={() => setPage('profile')} />}
        {page === 'tryon' && <TryOnPage hasBody={hasBody} onNeedProfile={() => setPage('profile')} />}
        {page === 'profile' && <ProfilePage onSaved={setProfile} />}
        {page === 'colours' && <ColoursPage />}
      </main>
    </div>
  );
}
