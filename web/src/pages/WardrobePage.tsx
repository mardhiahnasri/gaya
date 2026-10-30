import { useCallback, useEffect, useMemo, useState } from 'react';
import { analyzeClothing, deleteFromWardrobe, getWardrobe, saveToWardrobe, updateWardrobeItem, type Category, type WardrobeItem } from '../services/api';
import { categoryOf } from './StudioPage';
import type { PickedImage } from '../lib/image';
import { ImageDrop } from '../components/ImageDrop';
import { Busy } from '../components/Busy';

export function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [adding, setAdding] = useState(false);
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await getWardrobe());
    } catch {
      setError('Could not load your wardrobe. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.type, i.culturalOrigin, i.style, ...(i.colourNames ?? [])].some((v) => v?.toLowerCase().includes(q))
    );
  }, [items, filter]);

  const addItem = async () => {
    if (!photo) return;
    setAnalysing(true);
    setError(null);
    try {
      const analysis = await analyzeClothing(photo.base64, photo.mimeType);
      const saved = await saveToWardrobe(analysis, photo.dataUrl);
      setItems((prev) => [...prev, saved]);
      setPhoto(null);
      setAdding(false);
    } catch {
      setError('Could not analyse that photo. Check that the AI model is running, then try again.');
    } finally {
      setAnalysing(false);
    }
  };

  const changeCategory = async (item: WardrobeItem, category: Category) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, category } : i)));
    try {
      await updateWardrobeItem(item.id, { category });
    } catch {
      setError('Could not update the category.');
      load();
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this item from your wardrobe?')) return;
    await deleteFromWardrobe(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Wardrobe</h1>
          <p>{items.length} {items.length === 1 ? 'piece' : 'pieces'} in your collection</p>
        </div>
        <div className="row">
          <input className="input" style={{ width: 220 }} placeholder="Search type, colour, culture…" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <button className="btn primary" onClick={() => setAdding((v) => !v)}>{adding ? 'Close' : '+ Add item'}</button>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

      {adding && (
        <div className="card grid-2" style={{ marginBottom: 24 }}>
          <ImageDrop value={photo} onChange={(img) => { setPhoto(img); setError(null); }} onError={setError} label="Add a clothing photo" maxSize={768} />
          <div className="stack">
            <div>
              <h3>AI will detect the details</h3>
              <p className="muted small">Type, colours, fabric, style and suitable occasions are filled in automatically. Use a clear photo with one item on a plain background.</p>
            </div>
            {analysing ? <Busy message="Analysing your item" /> : (
              <button className="btn primary" disabled={!photo} onClick={addItem}>Analyse and save</button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <Busy message="Loading wardrobe" />
      ) : visible.length === 0 ? (
        <div className="empty">
          <h3>{items.length === 0 ? 'Your wardrobe is empty' : 'No matches'}</h3>
          <p>{items.length === 0 ? 'Add your first piece to start getting outfit ideas.' : 'Try a different search.'}</p>
        </div>
      ) : (
        <div className="items-grid">
          {visible.map((item) => (
            <div key={item.id} className="card item">
              <div className="item-img">{item.imageUri ? <img src={item.imageUri} alt={item.type} /> : '👗'}</div>
              <div className="item-body">
                <div className="item-title">{item.type}</div>
                <div className="item-meta">{[item.style, item.culturalOrigin].filter(Boolean).join(' · ')}</div>
                <div className="item-meta">{[item.sleeves && item.sleeves !== 'none' ? `${item.sleeves} sleeves` : '', item.length, item.fit].filter(Boolean).join(' · ')}</div>
                <select className="select small-select" value={categoryOf(item)} onChange={(e) => changeCategory(item, e.target.value as Category)} aria-label="Category">
                  {['top', 'bottom', 'dress', 'outerwear', 'hijab', 'shoes', 'accessory'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="swatches">
                  {item.dominantColours?.map((c, i) => <span key={i} className="swatch" style={{ background: c }} title={item.colourNames?.[i]} />)}
                </div>
                <div className="item-actions"><button className="link" onClick={() => remove(item.id)}>Remove</button></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
