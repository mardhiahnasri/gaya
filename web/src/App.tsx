import { useState } from 'react';
import type { StyleProfile } from './services/api';
import { useStored } from './lib/storage';
import { WardrobePage } from './pages/WardrobePage';
import { StudioPage } from './pages/StudioPage';
import { ColoursPage } from './pages/ColoursPage';

type Page = 'wardrobe' | 'studio' | 'colours';

const NAV: { id: Page; label: string; icon: string }[] = [
  { id: 'wardrobe', label: 'Wardrobe', icon: '▦' },
  { id: 'studio', label: 'Outfit studio', icon: '✦' },
  { id: 'colours', label: 'Colour check', icon: '◍' },
];

export default function App() {
  const [page, setPage] = useState<Page>('wardrobe');
  const [profile, setProfile] = useStored<StyleProfile>('gaya.profile', 'none');

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Gaya<span>.</span></div>
        {NAV.map((n) => (
          <button key={n.id} className={`nav-item${page === n.id ? ' active' : ''}`} onClick={() => setPage(n.id)}>
            <span className="nav-icon">{n.icon}</span>{n.label}
          </button>
        ))}
        <div className="sidebar-foot">
          <span className="label">Style profile</span>
          <select className="select" value={profile} onChange={(e) => setProfile(e.target.value as StyleProfile)}>
            <option value="none">No restrictions</option>
            <option value="modest">Modest</option>
            <option value="hijab">Hijab &amp; modest</option>
          </select>
        </div>
      </aside>
      <main className="main">
        {page === 'wardrobe' && <WardrobePage />}
        {page === 'studio' && <StudioPage profile={profile} />}
        {page === 'colours' && <ColoursPage />}
      </main>
    </div>
  );
}
