import { useEffect, useMemo, useRef, useState } from 'react';
import { OCCASIONS } from '../constants/config';
import {
  getWardrobe, matchOutfits, renderOutfit, reviewOutfit, scoreOutfit,
  type Category, type MatchedOutfit, type OutfitRender, type OutfitReview, type OutfitScore,
  type StyleProfile, type WardrobeItem,
} from '../services/api';
import { Busy } from '../components/Busy';

const SECTIONS: { id: Category; label: string }[] = [
  { id: 'dress', label: 'Dresses & sets' },
  { id: 'top', label: 'Tops' },
  { id: 'bottom', label: 'Bottoms' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'hijab', label: 'Hijabs & scarves' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'accessory', label: 'Accessories' },
];

const CATEGORY_HINTS: [Category, RegExp][] = [
  ['hijab', /hijab|tudung|shawl|scarf|selendang|bawal/i],
  ['outerwear', /blazer|jacket|cardigan|coat|kimono|vest/i],
  ['dress', /dress|gown|abaya|jubah|kurung|saree|sari|cheongsam|qipao|kaftan|jumpsuit/i],
  ['bottom', /pants|trouser|jeans|skirt|kain|shorts|palazzo|slacks/i],
  ['shoes', /shoe|heel|sandal|sneaker|boot|flat|loafer/i],
  ['accessory', /bag|belt|watch|necklace|earring|bracelet|brooch/i],
];

export function categoryOf(item: WardrobeItem): Category {
  if (item.category) return item.category;
  return CATEGORY_HINTS.find(([, re]) => re.test(item.type))?.[0] ?? 'top';
}

/** Picking one piece replaces the other in the same slot; a dress replaces top and bottom. */
function toggle(ids: string[], item: WardrobeItem, byId: Map<string, WardrobeItem>): string[] {
  if (ids.includes(item.id)) return ids.filter((id) => id !== item.id);
  const cat = categoryOf(item);
  const clears: Category[] = cat === 'dress' ? ['dress', 'top', 'bottom'] : cat === 'top' || cat === 'bottom' ? [cat, 'dress'] : cat === 'accessory' ? [] : [cat];
  const kept = ids.filter((id) => {
    const other = byId.get(id);
    return other && !clears.includes(categoryOf(other));
  });
  return [...kept, item.id];
}

function scoreTone(score: number) {
  return score >= 85 ? 'pass' : score >= 60 ? 'warn' : 'fail';
}

interface Props {
  profile: StyleProfile;
  hasBody: boolean;
  onNeedProfile: () => void;
}

export function StudioPage({ profile, hasBody, onNeedProfile }: Props) {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[] | null>(null);
  const [occasion, setOccasion] = useState('casual');
  const [selected, setSelected] = useState<string[]>([]);
  const [matches, setMatches] = useState<MatchedOutfit[] | null>(null);
  const [matching, setMatching] = useState(false);
  const [rules, setRules] = useState<OutfitScore | null>(null);
  const [rendering, setRendering] = useState(false);
  const [render, setRender] = useState<OutfitRender | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<OutfitReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  useEffect(() => {
    getWardrobe().then(setWardrobe).catch(() => setError('Could not load your wardrobe. Is the backend running?'));
  }, []);

  const byId = useMemo(() => new Map((wardrobe ?? []).map((i) => [i.id, i])), [wardrobe]);
  const picked = selected.map((id) => byId.get(id)).filter((i): i is WardrobeItem => Boolean(i));

  // Any change to the outfit invalidates the previous render and review; the rules re-run live.
  useEffect(() => {
    runId.current++;
    setRender(null);
    setReview(null);
    setRendering(false);
    setReviewing(false);
    if (selected.length === 0) {
      setRules(null);
      return;
    }
    const t = setTimeout(() => {
      scoreOutfit(selected, occasion, profile).then(setRules).catch(() => setRules(null));
    }, 200);
    return () => clearTimeout(t);
  }, [selected, occasion, profile]);

  const autoMatch = async () => {
    setMatching(true);
    setError(null);
    try {
      setMatches(await matchOutfits(occasion, profile));
    } catch {
      setError('Could not match outfits.');
    } finally {
      setMatching(false);
    }
  };

  const tryOn = async () => {
    if (!hasBody || selected.length === 0) return;
    const id = ++runId.current;
    setRendering(true);
    setError(null);
    setRender(null);
    setReview(null);
    try {
      const result = await renderOutfit(selected, occasion);
      if (id !== runId.current) return;
      setRender(result);
      if (result.status !== 'ready' || !result.previewImageBase64) {
        setError('The try-on service is unavailable right now. Try again in a few minutes.');
        return;
      }
      setRendering(false);
      setReviewing(true);
      try {
        const r = await reviewOutfit({ base64: result.previewImageBase64, mimeType: 'image/jpeg' }, selected, occasion, profile, result.tryonId);
        if (id === runId.current) setReview(r);
      } catch {
        if (id === runId.current) setError('The try-on worked, but the stylist review failed. Check that the AI model is running.');
      }
    } catch {
      if (id === runId.current) setError('Try-on failed. The free Hugging Face Space may be busy, so try again shortly.');
    } finally {
      if (id === runId.current) {
        setRendering(false);
        setReviewing(false);
      }
    }
  };

  const empty = wardrobe !== null && wardrobe.length === 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Outfit studio</h1>
          <p>Mix and match what you own, then see it on you.</p>
        </div>
        <div style={{ minWidth: 240 }}>
          <span className="label">Occasion</span>
          <select className="select" value={occasion} onChange={(e) => { setOccasion(e.target.value); setMatches(null); }}>
            {OCCASIONS.map((o) => <option key={o.id} value={o.id}>{o.emoji} {o.label}</option>)}
          </select>
        </div>
      </div>

      {empty && <div className="notice" style={{ marginBottom: 16 }}>Your wardrobe is empty. Add some pieces first.</div>}
      {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="studio">
        <div className="stack">
          <div className="card stack">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Suggested for you</h3>
              <button className="btn" disabled={matching || empty} onClick={autoMatch}>
                {matching ? <span className="spinner dark" /> : null}Auto-match
              </button>
            </div>
            {matches === null && <p className="muted small">Auto-match builds outfits from your wardrobe and ranks them by fashion rules{profile !== 'none' ? ` and ${profile === 'hijab' ? 'hijab / modest dressing' : 'modest dressing'}` : ''}.</p>}
            {matches?.length === 0 && <p className="muted small">No complete outfits yet. You need a top and bottom, or a dress{profile !== 'none' ? ', that meet your style profile' : ''}.</p>}
            {matches && matches.length > 0 && (
              <div className="match-list">
                {matches.map((m, idx) => (
                  <button key={idx} className={`match${m.itemIds.join() === selected.join() ? ' active' : ''}`} onClick={() => setSelected(m.itemIds)}>
                    <div className="thumbs">
                      {m.itemIds.map((id) => {
                        const it = byId.get(id);
                        return it?.imageUri ? <img key={id} src={it.imageUri} alt={it.type} title={it.type} /> : <span key={id} className="thumb-ph" title={it?.type}>{it?.type?.[0]}</span>;
                      })}
                    </div>
                    <span className={`score-pill ${scoreTone(m.score)}`}>{m.score}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card stack">
            <h3 style={{ margin: 0 }}>Your wardrobe</h3>
            {SECTIONS.map((sec) => {
              const items = (wardrobe ?? []).filter((i) => categoryOf(i) === sec.id);
              if (items.length === 0) return null;
              return (
                <div key={sec.id}>
                  <span className="label">{sec.label}</span>
                  <div className="pick-row">
                    {items.map((item) => (
                      <button key={item.id} className={`pick${selected.includes(item.id) ? ' on' : ''}`} onClick={() => setSelected((ids) => toggle(ids, item, byId))} title={item.type}>
                        {item.imageUri ? <img src={item.imageUri} alt={item.type} /> : <span className="thumb-ph">{item.type[0]}</span>}
                        <span className="pick-name">{item.type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="stack">
          <div className="card stack">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Current outfit</h3>
              {selected.length > 0 && <button className="link" onClick={() => setSelected([])}>Clear</button>}
            </div>
            {picked.length === 0 ? (
              <p className="muted small">Pick pieces from your wardrobe, or choose a suggestion.</p>
            ) : (
              <div className="outfit-pieces" style={{ margin: 0 }}>
                {picked.map((p) => <span key={p.id} className="piece">{p.imageUri ? <img src={p.imageUri} alt="" /> : <span className="piece-dot" />}{p.type}</span>)}
              </div>
            )}
            {rules && (
              <>
                <div className="row">
                  <span className={`score-pill big ${scoreTone(rules.score)}`}>{rules.score}</span>
                  <span className="muted small">Fashion check{profile !== 'none' ? ` · ${profile} profile` : ''}</span>
                </div>
                <ul className="checks">
                  {rules.checks.map((c) => (
                    <li key={c.id} className={c.status}>
                      <span className="dot" />
                      <div><strong>{c.label}</strong><div className="small">{c.detail}</div></div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="card stack">
            <h3 style={{ margin: 0 }}>Try it on</h3>
            {!hasBody && (
              <div className="notice">Add your body photo in your profile to try outfits on. <button className="link" onClick={onNeedProfile}>Go to profile</button></div>
            )}
            {rendering ? <Busy message="Dressing you in this outfit. This can take a few minutes" /> : (
              <button className="btn primary" disabled={!hasBody || selected.length === 0 || reviewing} onClick={tryOn}>Try on my body</button>
            )}
            {render?.previewImageBase64 && <img className="result-img" src={`data:image/jpeg;base64,${render.previewImageBase64}`} alt="Try-on result" />}
            {render?.warnings.map((w, i) => <div key={i} className="notice">{w}</div>)}
            {reviewing && <Busy message="Stylist is reviewing the look" />}
            {review && (
              <div className="stack">
                <div className="row">
                  <span className={`score-pill big ${scoreTone(review.score * 10)}`}>{review.score}<small>/10</small></span>
                  <strong>{review.verdict}</strong>
                </div>
                {review.strengths?.length > 0 && <div><span className="label">Works well</span><ul className="plain">{review.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
                {review.issues?.length > 0 && <div><span className="label">Could be better</span><ul className="plain">{review.issues.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
                {review.swaps?.length > 0 && <div><span className="label">Try this</span><ul className="plain">{review.swaps.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
